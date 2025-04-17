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

    const endpoint = this.options.endpoint || this.defaultEndpoint;

    const payload = {
      ...data,
      token: this.options.token || null,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    navigator.sendBeacon(endpoint, JSON.stringify(payload));
  }
}