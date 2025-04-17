import { setupGlobalHandlers } from "./core/capture";
import { setupNetworkInterceptors } from "./core/interceptors";

export interface SniffOptions {
  token?: string;
  endpoint?: string;
  enableInDev?: boolean;
}

export class Sniff {
  private options: SniffOptions;
  private defaultEndpoint = "https://sniffjs.app/api/log";
  private isProdEnv: boolean;
  // Rate limiting - fixed at 5 requests per second (only for default endpoint)
  private requestQueue: any[] = [];
  private requestTimestamps: number[] = [];
  private processingQueue = false;
  private readonly MAX_REQUESTS_PER_SECOND = 5;

  constructor(options: SniffOptions) {
    if (!options.token && !options.endpoint) {
      throw new Error("Sniff: Either 'token' or 'endpoint' must be provided");
    }

    this.options = options;
    this.isProdEnv = this.detectProdEnv();

    if (!this.shouldSendLogs()) {
      console.warn("[Sniff] Logging disabled in development mode.");
      return;
    }

    this.init();
  }

  private detectProdEnv() {
    return process.env.NODE_ENV === "production" || import.meta.env?.MODE === "production";
  }

  private shouldSendLogs() {
    return this.isProdEnv || this.options.enableInDev === true;
  }

  private init() {
    setupGlobalHandlers((err) => this.send(err));
    setupNetworkInterceptors((err) => this.send(err));
  }

  log(message: string, meta?: Record<string, any>) {
    if (!this.shouldSendLogs()) return;
    this.send({
      type: "manual_log",
      message,
      meta
    });
  }

  private send(data: any) {
    if (!this.shouldSendLogs()) return;

    const payload = {
      ...data,
      token: this.options.token || null,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const endpoint = this.options.endpoint || this.defaultEndpoint;
    
    // Only apply rate limiting to our default API endpoint
    const isDefaultEndpoint = !this.options.endpoint;
    
    if (isDefaultEndpoint) {
      // Queue the request for rate limiting
      this.requestQueue.push(payload);
      this.processQueue();
    } else {
      // Send immediately to custom endpoint
      navigator.sendBeacon(endpoint, JSON.stringify(payload));
    }
  }

  private processQueue() {
    // Prevent multiple queue processors running simultaneously
    if (this.processingQueue) return;
    this.processingQueue = true;

    setTimeout(() => {
      // Clear timestamps older than 1 second
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter(
        time => now - time < 1000
      );

      // Send queued requests if we're under the rate limit
      while (
        this.requestQueue.length > 0 && 
        this.requestTimestamps.length < this.MAX_REQUESTS_PER_SECOND
      ) {
        const payload = this.requestQueue.shift();
        const endpoint = this.defaultEndpoint;
        
        // Send the request
        navigator.sendBeacon(endpoint, JSON.stringify(payload));
        
        // Record this request timestamp
        this.requestTimestamps.push(Date.now());
      }

      // If queue still has items, schedule another processing
      if (this.requestQueue.length > 0) {
        // Wait until at least one request slot becomes available
        const oldestTimestamp = this.requestTimestamps[0];
        const timeToWait = Math.max(10, 1000 - (now - oldestTimestamp));
        
        setTimeout(() => {
          this.processingQueue = false;
          this.processQueue();
        }, timeToWait);
      } else {
        // Queue is empty, release the processing flag
        this.processingQueue = false;
      }
    }, 0);
  }
}