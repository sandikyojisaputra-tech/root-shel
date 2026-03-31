# Pterodactyl Panel - Troubleshooting Guide

Common issues and solutions for the Pterodactyl Server Management Panel.

## Installation Issues

### npm install fails

**Problem**: Dependencies fail to install

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try specific version
npm install --legacy-peer-deps
```

### Port already in use

**Problem**: Port 5173 or server port already in use

**Solutions**:
```bash
# Change dev port
npm run dev -- --port 3000

# Find process using port (Linux/Mac)
lsof -i :5173

# Find process using port (Windows)
netstat -ano | findstr :5173

# Kill process (Linux/Mac)
kill -9 <PID>

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Module not found errors

**Problem**: `Module not found: Can't resolve 'module-name'`

**Solutions**:
```bash
# Install missing dependency
npm install missing-package

# Check import path
# Verify spelling and case sensitivity

# Restart dev server
npm run dev
```

## Development Issues

### Hot Module Replacement (HMR) not working

**Problem**: Changes don't appear in browser

**Solutions**:
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Clear .vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev

# Check browser console for errors
```

### TypeScript errors

**Problem**: Type-related errors in console

**Solutions**:
```bash
# Run type check
npm run lint

# Check tsconfig.json
cat tsconfig.json

# Clear dist folder
npm run clean

# Rebuild
npm run build
```

### Styling not applied

**Problem**: Tailwind CSS classes not rendering

**Solutions**:
```bash
# Rebuild CSS
npm run build

# Check if className is valid Tailwind
# Avoid arbitrary values: bg-[#fff] (bad)
# Use defined classes: bg-white (good)

# Verify tailwind.config.js includes src files

# Clear browser cache
Ctrl+Shift+Delete → All time

# Check CSS specificity conflicts
```

## Terminal Issues

### Terminal not connecting

**Problem**: Terminal shows "connecting..." forever

**Solutions**:
```bash
# Check WebSocket server is running
# Verify port number in code
# Check browser console for WS errors
# Verify ws:// vs wss:// protocol

// In browser console
const socket = new WebSocket('ws://localhost:5173');
socket.onopen = () => console.log('Connected');
socket.onerror = (e) => console.error('Error:', e);
```

### Terminal not responsive

**Problem**: Terminal exists but doesn't accept input

**Solutions**:
```javascript
// Check socket readyState
console.log("[v0] Socket state:", socketRef.current?.readyState);
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED

// Ensure FitAddon is initialized
console.log("[v0] FitAddon:", fitAddonRef.current);

// Check terminal focus
xtermRef.current?.focus();

// Verify onData handler
term.onData((data) => {
  console.log("[v0] Input:", data);
});
```

### Terminal showing garbled text

**Problem**: Output displays incorrectly or scrambled

**Solutions**:
```javascript
// Check terminal theme colors
const TERMINAL_THEMES = {
  default: {
    background: 'transparent',
    foreground: '#d4d4d4',
    // ...
  }
};

// Verify xterm.js version
npm list @xterm/xterm

// Try different theme
setTheme('dracula');

// Clear terminal
term.clear();

// Refresh page
```

### Copy/Paste not working

**Problem**: Ctrl+C/V doesn't work in terminal

**Solutions**:
```javascript
// Check keyboard handler
term.attachCustomKeyEventHandler((e) => {
  console.log("[v0] Key:", e.key, "Ctrl:", e.ctrlKey);
  return true; // Allow key
});

// Test clipboard API
navigator.clipboard.readText().then(text => {
  console.log("[v0] Clipboard:", text);
});

// Check browser permissions
// Settings → Privacy → Clipboard

// Try alternative shortcuts
// Mac: Cmd+C instead of Ctrl+C
```

## WebSocket Issues

### WebSocket disconnects frequently

**Problem**: WS connection drops and reconnects

**Solutions**:
```javascript
// Add reconnection logic
const reconnect = () => {
  setTimeout(() => {
    socket = new WebSocket(url);
  }, 1000);
};

socket.onclose = () => {
  console.log("[v0] WS Closed, reconnecting...");
  reconnect();
};

// Check network conditions
// Network throttling in DevTools

// Verify server stability
// Check server logs for errors
```

### WebSocket message loss

**Problem**: Some messages don't arrive

**Solutions**:
```javascript
// Check message size
console.log("[v0] Message size:", data.length);

// Verify socket state before sending
if (socket.readyState === WebSocket.OPEN) {
  socket.send(data);
} else {
  console.error("[v0] Socket not ready");
}

// Implement message queue
const messageQueue = [];
socket.onopen = () => {
  messageQueue.forEach(msg => socket.send(msg));
  messageQueue.length = 0;
};
```

## Performance Issues

### High CPU usage

**Problem**: App consuming too much CPU

**Solutions**:
```javascript
// Check terminal scrollback
const term = new XTerm({
  scrollback: 5000, // Limit to 5000 lines
  // ...
});

// Monitor re-renders
console.log("[v0] Component rendered");

// Profile with DevTools
// Performance → Record → Analyze

// Check for infinite loops
// Look for event listeners without cleanup
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler); // Cleanup!
  };
}, []);
```

### Memory leaks

**Problem**: App uses increasing memory over time

**Solutions**:
```javascript
// Clean up event listeners
window.removeEventListener('resize', handleResize);

// Clean up timers
clearTimeout(timer);
clearInterval(interval);

// Dispose resources
term.dispose();
socket.close();

// Remove circular references
obj.ref = null;

// Monitor memory
// DevTools → Memory → Heap snapshots
```

### Slow rendering

**Problem**: UI lags or is unresponsive

**Solutions**:
```typescript
// Use memoization
const MemoComponent = memo(MyComponent);

// Use useCallback for handlers
const handleClick = useCallback(() => {
  // ...
}, []);

// Lazy load components
const LazyComponent = lazy(() => import('./Component'));

// Virtual scrolling for large lists
// Use a library like react-window

// Reduce animation complexity
// Simplify CSS transitions
```

## UI/UX Issues

### Layout broken on mobile

**Problem**: UI doesn't display correctly on phone

**Solutions**:
```tsx
// Check responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>

// Test with actual devices
// Use DevTools device emulation

// Check viewport meta tag
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

// Debug layout
<div style={{ border: '1px solid red' }}>
  {/* Visualize boundaries */}
</div>
```

### Z-index stacking issues

**Problem**: Modals/dropdowns appear behind other elements

**Solutions**:
```tsx
// Use consistent z-index system
// Backdrop: z-40
// Modal: z-50
// Tooltip: z-[100]

<div className="modal-backdrop z-40" /> {/* Backdrop */}
<div className="modal-content z-50" /> {/* Content */}

// Check for conflicting z-indexes
grep -r "z-" src/ | sort
```

### Font loading issues

**Problem**: Text appears unstyled until fonts load

**Solutions**:
```css
/* In index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700');

/* Add fallback fonts */
font-family: 'Inter', 'Segoe UI', sans-serif;

/* Use font-display: swap */
font-display: swap; /* In Google Fonts URL */
```

## Browser-Specific Issues

### Safari issues

**Problem**: Works on Chrome but not Safari

**Solutions**:
```javascript
// Check API compatibility
// WebSocket - Supported
// Clipboard API - Supported (iOS 13.3+)
// Fetch - Supported

// Test on actual device
// Use Safari on Mac
// Use iOS Simulator

// Check console for errors
// Safari → Develop → JavaScript Console
```

### Firefox issues

**Problem**: Works on Chrome but not Firefox

**Solutions**:
```javascript
// Check vendor prefixes
// Use Autoprefixer
// Check CSS Grid support

// Test CSS Grid
display: grid; /* Should work */
display: -webkit-grid; /* Webkit prefix */
```

### Mobile browser issues

**Problem**: Works on desktop but not mobile

**Solutions**:
```javascript
// Check touch events
document.addEventListener('touchstart', handler);

// Test on actual device
// Check mobile console
// Use remote debugging

// Verify viewport
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

## Network Issues

### CORS errors

**Problem**: `Access to XMLHttpRequest blocked by CORS`

**Solutions**:
```javascript
// Server should set CORS headers
response.headers['Access-Control-Allow-Origin'] = '*';

// Or use proxy in development
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

### Slow network

**Problem**: App slow on slow connections

**Solutions**:
```bash
# Enable compression
gzip on;

# Reduce bundle size
npm run build
ls -lh dist/

# Use CDN for assets
# Implement caching
# Lazy load heavy components
```

### Offline mode

**Problem**: App doesn't work offline

**Solutions**:
```javascript
// Check WebSocket status
socket.onclose = () => {
  console.log("[v0] Offline mode");
  // Show offline indicator
  // Queue operations
};

// Service Worker for offline support
// Not currently implemented
```

## Debugging Tools

### Browser DevTools

```javascript
// Console
console.log("[v0] Debug:", variable);
console.time("operation");
// ... code
console.timeEnd("operation");

// Network Tab
// Monitor WebSocket messages
// Check request/response sizes

// Performance Tab
// Record page load
// Identify bottlenecks

// Storage Tab
// Check localStorage/sessionStorage
// View cookies
```

### VS Code Debugging

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### Remote DevTools

```javascript
// For mobile debugging
// Chrome: chrome://inspect
// Safari: Develop menu → device
```

## Getting Help

### Check These First
1. Read ARCHITECTURE.md
2. Review STYLE_GUIDE.md
3. Check DEVELOPMENT.md
4. Search existing issues

### How to Report Issues
1. Clear reproduction steps
2. Browser and OS version
3. Console errors (copy-paste)
4. Network tab screenshots
5. Expected vs actual behavior

### Questions?
- GitHub Issues
- Discussions section
- Email support

---

**Last Updated**: March 2026  
**Version**: 1.0.0
