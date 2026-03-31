# Pterodactyl Panel - Quick Reference Card

**A quick lookup guide for common tasks and patterns.**

## 🚀 Quick Start

```bash
npm install           # Install dependencies
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm start            # Start production server
npm run clean        # Clean dist folder
npm run lint         # Check TypeScript
```

## 🎯 Common Commands

### File Structure
```
src/
├── App.tsx              # Main app (2,928 lines)
├── main.tsx             # Entry point
├── index.css            # Global styles (276 lines)
├── components/          # Reusable components
│   └── {Component}.tsx
└── hooks/              # Custom hooks
    └── use{Hook}.ts
```

### Create New Component
```tsx
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <div className="card-dark">{title}</div>;
};
```

### Create New Hook
```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from 'react';

export const useMyHook = () => {
  const [state, setState] = useState(false);
  
  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);
  
  return { state, toggle };
};
```

## 🎨 Styling Quick Lookup

### Colors
```tsx
// Primary colors
bg-blue-600 text-white          // Primary button
bg-emerald-500 text-white       // Success
bg-red-500 text-white           // Danger
bg-yellow-500 text-white        // Warning
bg-cyan-500 text-white          // Info

// Dark backgrounds
bg-[#0d0e12]    // Primary BG
bg-[#101116]    // Secondary BG
bg-zinc-800     // Lighter dark
bg-zinc-900     // Darkest
```

### Common Classes
```tsx
className="card-dark"                    // Card container
className="interactive-btn-primary"      // Primary button
className="interactive-btn-danger"       // Danger button
className="badge-success"                // Success badge
className="status-online"                // Online indicator
className="spinner"                      // Loading spinner
className="fade-in"                      // Entrance animation
className="glass"                        // Glass effect
```

### Responsive
```tsx
// Mobile first, then enhance
className="p-4 md:p-6 lg:p-8"           // Padding
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"  // Grid
className="hidden md:block"              // Hide on mobile
className="md:hidden"                    // Show only on mobile
```

## 📦 Component Usage

### StatsCard
```tsx
import { StatsCard } from './components';
import { Cpu } from 'lucide-react';

<StatsCard
  icon={Cpu}
  label="CPU Usage"
  value={65}
  unit="%"
  percentage={65}
  color="orange"
/>
```

### DataTable
```tsx
import { DataTable } from './components';

<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status' }
  ]}
  data={items}
  onSort={handleSort}
  sortBy="name"
  sortOrder="asc"
/>
```

### Toast
```tsx
import { useToast } from './hooks';

const { success, error, warning, info } = useToast();

success('Changes saved!');
error('An error occurred', 'Please try again');
warning('Are you sure?');
info('New update available');
```

## 🪝 Hook Usage

### useToast
```typescript
const { toasts, success, error, warning, info, removeToast } = useToast();

// Show notifications
success('Success!');
error('Something went wrong');
warning('Are you sure?');
info('Information');

// Custom duration
success('Quick message', '', 2000);

// Render toast container
<ToastContainer toasts={toasts} onClose={removeToast} />
```

### useAPI
```typescript
const { data, loading, error, get, post, put, delete: delete_ } = useAPI();

// GET request
const users = await get('/api/users');

// POST request
const newUser = await post('/api/users', { name: 'John' });

// PUT request
const updated = await put(`/api/users/${id}`, { name: 'Jane' });

// DELETE request
await delete_(`/api/users/${id}`);

// Check state
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
```

## 🎯 Common Patterns

### Conditional Rendering
```tsx
{view === 'console' && <ConsoleView />}
{view === 'files' && <FilesView />}
{loading ? <Spinner /> : <Content />}
{error && <ErrorMessage error={error} />}
{items.length === 0 ? <Empty /> : <List items={items} />}
```

### Event Handlers
```tsx
const handleClick = useCallback(() => {
  // Action here
}, []);

const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
}, []);

const handleSubmit = useCallback((e: FormEvent) => {
  e.preventDefault();
  // Submit here
}, []);
```

### State Management
```tsx
const [count, setCount] = useState(0);
const [items, setItems] = useState([]);
const [formData, setFormData] = useState({ name: '', email: '' });

// Update single value
setCount(prev => prev + 1);

// Update array
setItems([...items, newItem]);
setItems(items.filter(item => item.id !== id));
setItems(items.map(item => 
  item.id === id ? { ...item, name: newName } : item
));

// Update object
setFormData({ ...formData, name: 'John' });
```

## 🔌 WebSocket Guide

### Connection
```typescript
const socket = new WebSocket(`ws://${window.location.host}?shell=bash`);

socket.onopen = () => console.log('Connected');
socket.onmessage = (event) => console.log(event.data);
socket.onclose = () => console.log('Disconnected');
socket.onerror = (error) => console.error(error);
```

### Sending Data
```typescript
// Send command
socket.send('ls -la\r');

// Send JSON
socket.send(JSON.stringify({ 
  type: 'resize', 
  cols: 80, 
  rows: 24 
}));

// Check connection
if (socket.readyState === WebSocket.OPEN) {
  socket.send(data);
}
```

## 🔍 Debugging

### Console Logs
```javascript
console.log("[v0] Debug message:", variable);
console.time("operation");
// ... code
console.timeEnd("operation");

console.error("[v0] Error:", error);
console.warn("[v0] Warning:", message);
console.info("[v0] Info:", data);
```

### DevTools
- **Network Tab**: Monitor WS connections
- **Console Tab**: Check for errors
- **Performance Tab**: Profile app
- **Storage Tab**: Check cache

## 📚 Documentation

| Document | Purpose | Length |
|----------|---------|--------|
| README.md | Overview & quick start | ~50 lines |
| ARCHITECTURE.md | System design | 466 lines |
| STYLE_GUIDE.md | Design system | 356 lines |
| CONTRIBUTING.md | How to contribute | 409 lines |
| TROUBLESHOOTING.md | Debug common issues | 588 lines |
| DEVELOPMENT.md | Development guide | ~150 lines |
| PROJECT_STATUS.md | Project summary | 396 lines |
| QUICK_REFERENCE.md | This file | ~300 lines |

## 🚦 Keyboard Shortcuts

- **Cmd/Ctrl + K** - Open command palette
- **Escape** - Close modals
- **Tab** - Auto-complete in terminal
- **Ctrl+C** - Copy (or Cmd+C)
- **Ctrl+V** - Paste (or Cmd+V)
- **↑↓←→** - Navigate in terminal

## 🎨 Tailwind Classes Cheat Sheet

```tsx
/* Layout */
flex, grid, block, inline, absolute, relative

/* Sizing */
w-full, h-full, w-12, h-8, max-w-lg, min-h-screen

/* Spacing */
p-4, m-2, gap-3, space-y-2, space-x-4

/* Colors */
text-white, bg-blue-600, border-zinc-800, text-zinc-400

/* Display */
hidden, block, flex, grid, opacity-50, visible

/* Position */
top-0, right-0, bottom-0, left-0, z-50

/* Effects */
shadow-lg, rounded-xl, border, blur, backdrop-blur

/* Text */
text-center, font-bold, text-sm, uppercase, truncate

/* Responsive */
md:, lg:, xl:, 2xl:, sm:
```

## 🔐 TypeScript Tips

```typescript
// Define props
interface ComponentProps {
  title: string;
  count?: number;
  onAction?: () => void;
}

// Use as FC
const MyComponent: React.FC<ComponentProps> = ({ title }) => {};

// Type state
const [items, setItems] = useState<Item[]>([]);
const [count, setCount] = useState<number>(0);

// Type events
(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
(e: FormEvent<HTMLFormElement>) => handleSubmit(e);
(e: MouseEvent<HTMLButtonElement>) => handleClick(e);
```

## 🌐 API Endpoints (To Implement)

```
GET    /api/stats              - Server statistics
POST   /api/server/start       - Start server
POST   /api/server/stop        - Stop server
POST   /api/server/restart     - Restart server
GET    /api/files              - List files
POST   /api/files/upload       - Upload file
DELETE /api/files/:path        - Delete file
GET    /api/databases          - List databases
POST   /api/database/create    - Create database
GET    /api/audit-logs         - Audit history
```

## ⚡ Performance Tips

```javascript
// Use memoization
import { useMemo, useCallback } from 'react';

const expensiveValue = useMemo(() => compute(), [deps]);
const handler = useCallback(() => handle(), [deps]);

// Lazy load components
const Heavy = lazy(() => import('./Heavy'));

// Limit terminal scrollback
const term = new XTerm({ scrollback: 5000 });

// Debounce events
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
```

## 🎯 View Components

```typescript
// Main views in App.tsx
view === 'console'   → Terminal emulator
view === 'audit'     → Audit logs
view === 'files'     → File manager
view === 'databases' → Database management
view === 'schedules' → Task scheduling
view === 'users'     → User management
view === 'startup'   → Startup config
```

## 📞 Support Resources

- **TROUBLESHOOTING.md** - Common issues & solutions
- **ARCHITECTURE.md** - System design deep-dive
- **CONTRIBUTING.md** - Contribution workflow
- **STYLE_GUIDE.md** - Design & code patterns

---

**Print this page for easy reference!**

Last Updated: March 31, 2026
