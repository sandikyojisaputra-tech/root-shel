# Pterodactyl Server Management Panel

A modern, professional game server management interface built with React, TypeScript, and Tailwind CSS. This panel provides real-time server monitoring, terminal access, file management, and comprehensive server administration tools.

## 🚀 Features

### Core Features
- **Real-time Terminal Emulator** - Full xterm.js integration with WebSocket support
- **Server Dashboard** - Monitor CPU, memory, and disk usage in real-time
- **File Manager** - Browse, upload, and manage server files
- **Database Management** - Manage databases and user access
- **Schedule Management** - Create and manage automated tasks
- **User Management** - Manage server users and permissions
- **Startup Configuration** - Configure server startup parameters
- **Audit Logs** - Track all server actions and changes

### Advanced Features
- **Command Palette** - Quick access to common commands (Cmd/Ctrl + K)
- **Terminal Themes** - Multiple color schemes (Default, Dracula, Solarized, One Dark, Monokai)
- **Mobile Controls** - Special keyboard controls for mobile terminals
- **Auto-completion** - Smart command suggestions
- **Real-time Updates** - WebSocket-based live data
- **Dark Theme** - Professional dark UI designed for long work sessions
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🛠 Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Terminal**: xterm.js with addon support
- **UI**: Lucide React icons + Motion animations
- **Charts**: Recharts for visualization
- **Build**: Vite
- **Server**: Express.js with WebSocket

## 📁 Project Structure

```
src/
├── App.tsx              # Main application (2928 lines)
├── main.tsx             # React entry point
├── index.css            # Global styles and utilities
├── components/
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── Topbar.tsx       # Top navigation bar
│   └── index.ts         # Component exports

Configuration:
├── vite.config.ts       # Build configuration
├── tailwind.config.js   # Tailwind CSS theme
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies
└── server.ts            # Express/WebSocket server
```

## 🚦 Quick Start

```bash
npm install
npm run dev         # Development
npm run build       # Build for production
npm start          # Production server
```

## 🎨 Design Highlights

- **Color Palette**: Deep charcoal (#0d0e12) with blue accents (#3b82f6)
- **Typography**: Inter for UI, JetBrains Mono for code
- **Animations**: Smooth transitions with Motion library
- **Responsive**: Mobile-first design with Tailwind breakpoints

## ⌨️ Keyboard Shortcuts

- **Cmd/Ctrl + K**: Command palette
- **Escape**: Close modals
- **Tab**: Auto-complete in terminal
- **Ctrl+C/V**: Copy/paste

## 📚 Documentation

- `DEVELOPMENT.md` - Architecture and component patterns
- `README_OLD.md` - Original project notes
