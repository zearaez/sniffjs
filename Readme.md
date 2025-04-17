# @zearaez/sniff-js

A lightweight JavaScript error tracking and logging library for frontend applications.

[![npm version](https://badge.fury.io/js/@zearaez%2Fsniff-js.svg)](https://badge.fury.io/js/@zearaez%2Fsniff-js)

## Features

- Automatic error capture for JavaScript exceptions
- Promise rejection tracking
- Network request error monitoring (fetch and XHR)
- Console error logging
- Manual log submission
- Environment detection (dev/prod)
- Development mode control

## Installation

```bash
npm install @zearaez/sniff-js
```

## Quick Start

```javascript
import { Sniff } from '@zearaez/sniff-js';

// Initialize with your project
const sniff = new Sniff({
  endpoint: 'your-reporting-api-endpoint'
});

// Now errors will be automatically captured and reported
```

## Configuration

The `Sniff` class accepts the following options:

```typescript
interface SniffOptions {
  endpoint?: string;     // Custom reporting endpoint of your app
  enableInDev?: boolean; // Enable logging in development mode (false by default)
}
```

You must provide `endpoint` parameter.

## Usage

### Manual Logging

```javascript
// Log a message with optional metadata
sniff.log('User clicked checkout button', {
  userId: 123,
  cartValue: 59.99
});
```

### Environment Detection

By default, logs are only sent in production environments. @zearaez/sniff-js automatically detects production environments by checking:

```javascript
process.env.NODE_ENV === "production" || import.meta.env?.MODE === "production"
```

To enable logging in development environments, set the `enableInDev` option to `true`.

## How It Works

@zearaez/sniff-js works by:

1. Setting up global error handlers via `setupGlobalHandlers` to catch JavaScript errors
2. Intercepting network requests with `setupNetworkInterceptors` to monitor fetch and XHR failures
3. Sending error data to your specified endpoint using the Navigator.sendBeacon API

## API Reference

### Sniff Class

- `constructor(options: SniffOptions)`: Initialize the error tracking
- `log(message: string, meta?: Record<string, any>)`: Send manual logs with optional metadata

## Building from Source

```bash
npm run build
```

This will generate compiled output in the `dist` directory.

## Browser Compatibility

@zearaez/sniff-js works in all modern browsers that support:
- `Navigator.sendBeacon`
- `Promise`
- `fetch` API

## License

MIT