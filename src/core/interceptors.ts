export function setupNetworkInterceptors(callback: (data: any) => void) {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          callback({
            type: "fetch_error",
            url: args[0],
            status: response.status,
            statusText: response.statusText,
          });
        }
        return response;
      } catch (err) {
        callback({
          type: "fetch_exception",
          message: (err as Error).message,
          url: args[0],
        });
        throw err;
      }
    };
  
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;
  
    XMLHttpRequest.prototype.open = function (...args: any[]) {
      (this as any)._sniff_url = args[1];
      return originalXhrOpen.apply(this, args);
    };
  
    XMLHttpRequest.prototype.send = function (...args: any[]) {
      this.addEventListener("load", function () {
        if (this.status >= 400) {
          callback({
            type: "xhr_error",
            url: (this as any)._sniff_url,
            status: this.status,
          });
        }
      });
      return originalXhrSend.apply(this, args);
    };
  }