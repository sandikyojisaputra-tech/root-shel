# Pterodactyl Panel Development Guide

This is a modern implementation of a Pterodactyl-style server management panel built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Architecture

### Project Structure

```
src/
├── components/          # Modular, reusable React components
│   ├── Sidebar.tsx     # Left navigation sidebar
│   ├── Topbar.tsx      # Top header bar with controls
│   ├── ConsoleView.tsx # Console/dashboard view
│   ├── FilesView.tsx   # File manager view
│   ├── DatabasesView.tsx # Databases management
│   ├── SchedulesView.tsx  # Task scheduling
│   ├── UsersView.tsx      # Sub-user management
│   ├── StartupView.tsx    # Startup configuration
│   ├── AuditView.tsx      # Audit logs
│   └── index.ts        # Component exports
├── App.tsx            # Main application component with all views
├── index.css          # Global styles with Tailwind
└── main.tsx           # React entry point
```

### Design System

The application uses a dark theme inspired by modern server management panels:

- **Primary Color**: Blue (#3b82f6)
- **Background**: Deep Dark (#0d0e12)
- **Secondary Background**: Dark Gray (#101116)
- **Text Primary**: Light Gray (#d4d4d4)
- **Borders**: Subtle Zinc (#27272a)

### Key Features

1. **Responsive Design**: Optimized for mobile, tablet, and desktop
2. **Terminal Emulator**: Full xterm.js integration for server console
3. **Real-time Stats**: CPU, Memory, Disk usage monitoring
4. **File Manager**: Server file exploration and management
5. **Database Management**: Database administration interface
6. **Scheduling**: Automated task configuration
7. **User Management**: Sub-user and permissions management
8. **Audit Logs**: Complete activity logging
9. **Settings**: Configurable terminal themes and behavior

## Development

### Setup

```bash
cd vpsme-main
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Technologies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Utility-first CSS
- **Framer Motion**: Smooth animations
- **xterm.js**: Terminal emulator
- **Lucide React**: Icon library

### Component Guidelines

#### Creating New Views

New views should follow this pattern:

```tsx
import React from 'react';
import { motion } from 'motion/react';
import { IconName } from 'lucide-react';

interface ViewProps {
  // Props here
}

export const MyView: React.FC<ViewProps> = ({ ...props }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-color-600/20 rounded-lg">
            <IconName size={24} className="text-color-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">View Title</h1>
            <p className="text-sm text-zinc-400">Description</p>
          </div>
        </div>
      </div>

      {/* Content with motion animations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-lg p-6"
      >
        {/* Content */}
      </motion.div>
    </div>
  );
};
```

#### Styling Classes

Use these utility classes for consistency:

- `.glass` - Glassmorphism effect
- `.sidebar-active` - Active sidebar item
- `.card-dark` - Dark card style
- `.stat-card` - Statistics card
- `.btn-primary` - Primary button
- `.terminal-container` - Terminal wrapper

## API Integration

The application expects these API endpoints:

- `GET /api/status` - Server status
- `POST /api/server/action` - Start/stop/restart server
- `GET /api/config` - Server configuration
- `POST /api/config` - Save configuration
- `GET /api/info` - Server statistics

## Styling

### Tailwind Configuration

The project uses Tailwind CSS v4 with custom design tokens defined in `index.css`. All colors are themed through CSS variables in the `@theme` block.

### Key Utility Classes

- Responsive prefixes: `sm:`, `lg:`, `xl:`
- Flexbox: `flex`, `items-center`, `justify-between`
- Grid: `grid`, `grid-cols-2`, `gap-4`
- Colors: Use design tokens instead of direct colors
- Spacing: Use scale (4, 6, 8, etc.) not arbitrary values

## Performance Optimizations

1. **Component Lazy Loading**: Views load on demand
2. **Animation Control**: Framer Motion with optimized transitions
3. **CSS Scrollbar**: Custom lightweight scrollbar
4. **Responsive Images**: Conditional rendering based on screen size
5. **Terminal Buffering**: Efficient xterm.js rendering

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader friendly

## Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Advanced file upload with progress
- [ ] Database backup/restore UI
- [ ] Schedule templates
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Mobile app responsive improvements
