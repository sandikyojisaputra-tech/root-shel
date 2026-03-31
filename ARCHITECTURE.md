# Pterodactyl Panel - Architecture & Developer Guide

## Overview

The Pterodactyl Server Management Panel is a professional-grade web interface for managing game servers. It's built with a modern React/TypeScript stack and uses WebSocket for real-time communication.

## Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **Motion** - Animations (Framer Motion fork)
- **Recharts** - Data visualization
- **xterm.js** - Terminal emulator

### Backend
- **Express.js** - HTTP server
- **WebSocket (ws)** - Real-time communication
- **TypeScript** - Type-safe server code

### Build & Dev Tools
- **Vite** - Fast build tool
- **tsx** - TypeScript execution
- **Tailwind CSS** - Utility-first CSS
- **Autoprefixer** - CSS vendor prefixes

## Directory Structure

```
project-root/
├── src/
│   ├── App.tsx              # Main application (2928 lines)
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   └── components/
│       ├── Sidebar.tsx      # Navigation sidebar
│       ├── Topbar.tsx       # Top header bar
│       ├── StatsCard.tsx    # Stats display
│       ├── DataTable.tsx    # Data table
│       ├── Toast.tsx        # Notifications
│       └── index.ts         # Export barrel
│
├── public/                  # Static assets
├── index.html              # HTML entry point
├── server.ts               # Express/WS server
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind theme
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies
└── README.md               # Documentation
```

## Core Components

### App.tsx (Main Component)
The central hub containing:
- **State Management**: Server status, stats, views, settings
- **Terminal Emulation**: xterm.js integration with WebSocket
- **View Routing**: Conditional rendering of different views
- **Event Handling**: Server actions, file uploads
- **Modal Management**: Settings, confirmations

**Key Features**:
- Real-time CPU/Memory/Disk monitoring
- Terminal emulator with auto-completion
- Command palette (Cmd/Ctrl + K)
- Multiple terminal themes
- Mobile responsive controls

### Sidebar Component
Navigation component featuring:
- Icon-based menu items
- Hover tooltips
- Active state highlighting
- Settings and logout buttons
- Smooth transitions

### Topbar Component
Header bar with:
- Server status indicator
- Public IP display with copy
- Uptime counter
- Server control buttons (Start/Restart/Stop)
- Breadcrumb navigation

### StatsCard Component
Reusable stats display:
- Icon and label
- Numeric value with unit
- Progress bar (optional)
- Trend indicator
- Color variants

### DataTable Component
Generic table component:
- Sortable columns
- Custom rendering
- Loading state
- Empty state
- Hover effects

### Toast Component
Notification system:
- Four types: success, error, warning, info
- Auto-dismiss
- Manual close
- Stacked layout

## State Management Pattern

The application uses React hooks for state management:

```typescript
const [view, setView] = useState('console');
const [serverStatus, setServerStatus] = useState('offline');
const [stats, setStats] = useState({
  cpu: 0,
  memory: 0,
  disk: 0,
  uptime: 0
});
```

### State Flow
1. **User Action** → Click button/input
2. **Handler Function** → Updates state or sends data
3. **State Update** → Component re-renders
4. **WebSocket Event** → Real-time data updates

## WebSocket Protocol

### Connection
```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const socket = new WebSocket(`${protocol}//${window.location.host}?shell=${shell}`);
```

### Message Format
- **Terminal Data**: Plain text or binary (Uint8Array)
- **Control Messages**: JSON format
  ```json
  {
    "type": "resize",
    "cols": 80,
    "rows": 24
  }
  ```

### Event Handling
```javascript
socket.onopen = () => setStatus('connected');
socket.onmessage = (event) => term.write(event.data);
socket.onclose = () => setStatus('disconnected');
```

## Component Communication

### Props Drilling
For simple prop passing:
```tsx
<Topbar
  publicIP={publicIP}
  serverStatus={serverStatus}
  onServerAction={handleServerAction}
/>
```

### Event Callbacks
```tsx
const handleServerAction = (action: string) => {
  if (action === 'start') startServer();
  if (action === 'stop') stopServer();
};
```

### Window Events
For cross-component communication:
```javascript
window.addEventListener('terminal-command', (e) => {
  const cmd = e.detail;
  socket.send(cmd);
});
```

## Styling Architecture

### Design Tokens (src/index.css)
```css
@theme {
  --color-bg-primary: #0d0e12;
  --color-accent: #3b82f6;
  /* ... more tokens */
}
```

### Utility Classes
- `.card-dark` - Styled card container
- `.interactive-btn-primary` - Primary button
- `.status-online` - Online indicator
- `.spinner` - Loading spinner
- `.fade-in` - Entrance animation

### Responsive Prefix
```tsx
// Mobile first, then enhance
<div className="p-4 md:p-6 lg:p-8">
```

## Performance Optimization

### Terminal Optimization
```javascript
// Limit scrollback to prevent memory issues
const term = new XTerm({
  scrollback: 5000,
  // ...
});
```

### Debouncing
```javascript
// Window resize events
const handleResize = debounce(() => {
  fitAddon.fit();
}, 300);
```

### Lazy Loading
Components are imported normally but can be split:
```tsx
const ConsoleView = lazy(() => import('./views/Console'));
```

## Data Flow Examples

### Server Status Update
```
1. Server event triggered
2. WebSocket message received
3. Status state updated: setServerStatus('running')
4. Topbar re-renders with new status
5. Status indicator animated
```

### File Upload
```
1. User selects file
2. FormData created: new FormData()
3. Sent to server: fetch('/upload', { body: formData })
4. Server processes and responds
5. File list refreshed
```

### Terminal Command
```
1. User types in terminal
2. xterm.onData() triggered
3. Command sent via WebSocket
4. Server executes: socket.send(command)
5. Output received: socket.onmessage()
6. Terminal updated: term.write(output)
```

## API Endpoints

### WebSocket
```
ws://localhost:5173?shell=bash
wss://domain.com?shell=bash (production)
```

### HTTP Endpoints (expected)
- `GET /api/stats` - Server statistics
- `POST /api/server/start` - Start server
- `POST /api/server/stop` - Stop server
- `POST /api/server/restart` - Restart server
- `GET /api/files` - File listing
- `POST /api/files/upload` - Upload file
- `POST /api/files/delete` - Delete file
- `GET /api/databases` - List databases
- `POST /api/database/create` - Create database
- `GET /api/audit-logs` - Audit history

## Adding New Features

### Adding a New View
1. Create component in `src/components/ViewName.tsx`
2. Add navigation item in Sidebar
3. Add route handler in App.tsx:
```tsx
{view === 'newview' && <NewView />}
```
4. Update sidebar navigation array

### Adding a New Stat
1. Update stats state structure:
```tsx
const [stats, setStats] = useState({
  // ... existing
  newMetric: 0
});
```
2. Create StatsCard component
3. Add to dashboard layout
4. Implement data update logic

### Adding a New Theme
1. Add to TERMINAL_THEMES in App.tsx:
```typescript
const TERMINAL_THEMES = {
  // ... existing
  mytheme: {
    background: '#...',
    foreground: '#...',
    // ... other colors
  }
};
```
2. Update theme selector UI
3. Test in terminal

## Testing

### Manual Testing Checklist
- [ ] Terminal connects and displays output
- [ ] Commands auto-complete
- [ ] Copy/paste works
- [ ] Server controls respond
- [ ] Responsive on mobile
- [ ] Keyboard shortcuts work
- [ ] Modals close properly

### Browser Testing
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Deployment

### Build Process
```bash
npm run build
# Outputs to dist/
```

### Production Server
```bash
npm start
# Runs on configured port
# Serves built assets
```

### Environment Variables
```
NODE_ENV=production
PORT=3000
WS_URL=wss://domain.com
```

## Security Considerations

### Frontend Security
- ✅ Input validation before sending to server
- ✅ XSS prevention via React escaping
- ✅ CSRF protection via server validation
- ⚠️ No sensitive data in client-side storage
- ⚠️ HTTPS/WSS required in production

### Backend Security (Server Implementation)
- ✅ Validate all WebSocket messages
- ✅ Sanitize file paths
- ✅ Rate limiting on endpoints
- ✅ Authentication/authorization checks
- ✅ Input size limits

## Debugging

### Enable Debug Logs
```javascript
// In App.tsx or components
console.log("[v0] Debug info:", variable);
```

### WebSocket Debugging
```javascript
socket.onmessage = (event) => {
  console.log("[v0] WS Message:", event.data);
  term.write(event.data);
};
```

### Terminal Debugging
```javascript
term.onData((data) => {
  console.log("[v0] Terminal input:", data);
});
```

### Network Tab
- Open DevTools Network tab
- Filter by WS for WebSocket
- Check message frequency and size

## Common Issues & Solutions

### Terminal Not Responsive
- Check WebSocket connection status
- Verify socket is in OPEN state
- Ensure FitAddon is initialized
- Check browser console for errors

### Performance Issues
- Check scrollback setting (limit to 5000)
- Monitor memory usage in DevTools
- Reduce update frequency if needed
- Implement virtual scrolling for large lists

### Styling Issues
- Clear browser cache
- Check Tailwind classes are applied
- Verify z-index hierarchy
- Test in incognito/private mode

## Best Practices

### Code Organization
- Keep components small (< 200 lines)
- Use TypeScript for type safety
- Extract reusable logic into hooks
- Use meaningful variable names

### Performance
- Memoize expensive calculations
- Use virtual scrolling for large lists
- Lazy load heavy components
- Optimize re-renders

### Maintainability
- Comment complex logic
- Document component props
- Keep styles in index.css
- Use consistent naming conventions

### Testing
- Test keyboard navigation
- Test on actual devices/browsers
- Test with slow network
- Test with WebSocket disconnects

## Resources

- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org
- **Tailwind CSS**: https://tailwindcss.com
- **xterm.js**: https://xtermjs.org
- **Vite**: https://vitejs.dev

---

**Last Updated**: March 2026  
**Maintained by**: Development Team  
**Version**: 1.0.0
