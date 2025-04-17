export function setupGlobalHandlers(callback: (data: any) => void) {
    window.onerror = (message, source, lineno, colno, error) => {
      callback({
        type: "js_error",
        message,
        source,
        lineno,
        colno,
        stack: error?.stack,
      });
    };
  
    window.addEventListener("unhandledrejection", (event) => {
      callback({
        type: "unhandled_promise",
        message: (event.reason as any)?.message || event.reason,
        stack: (event.reason as any)?.stack,
      });
    });
  
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      callback({
        type: "console_error",
        message: args.map(String).join(" "),
      });
      originalConsoleError.apply(console, args);
    };
  }