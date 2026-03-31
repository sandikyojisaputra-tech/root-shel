# Pterodactyl Panel - Style Guide & Design System

This document outlines the design system, component patterns, and styling conventions used throughout the Pterodactyl Server Management Panel.

## 🎨 Color System

### Primary Colors
- **Background Primary**: `#0d0e12` - Main app background
- **Background Secondary**: `#101116` - Cards, headers
- **Background Tertiary**: `#1a1d23` - Elevated elements
- **Accent Blue**: `#3b82f6` - Primary interactive elements
- **Accent Dark**: `#1e40af` - Hover/active states

### Status Colors
- **Success (Emerald)**: `#10b981` - Online, active, positive
- **Error (Red)**: `#ef4444` - Offline, errors, danger
- **Warning (Yellow)**: `#f59e0b` - Alerts, caution
- **Info (Cyan)**: `#06b6d4` - Information, neutral

### Text Colors
- **Primary**: `#d4d4d4` - Main text content
- **Secondary**: `#a0aec0` - Labels, secondary text
- **Tertiary**: `#71717a` - Disabled, hints
- **Borders**: `#27272a` - UI dividers, borders

## 🔤 Typography

### Fonts
- **Sans-serif**: Inter (UI text, headings)
- **Monospace**: JetBrains Mono (code, terminals)

### Sizing Scale
- **Display**: 32px - Page titles
- **Title**: 24px - Section headings
- **Subtitle**: 18px - Subsections
- **Body**: 14px - Regular text
- **Small**: 12px - Labels, captions
- **Tiny**: 10px - Status indicators

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Headings
- **Extrabold**: 800 - Display text

## 🧩 Component Patterns

### Buttons

```tsx
// Primary Action
<button className="interactive-btn-primary">
  Save Changes
</button>

// Danger Action
<button className="interactive-btn-danger">
  Delete Server
</button>

// Icon Button
<button className="btn-icon">
  <Icon size={20} />
</button>
```

### Cards

```tsx
// Dark Card
<div className="card-dark">
  Content here
</div>

// Glass Card
<div className="card-glass">
  Content here
</div>
```

### Badges

```tsx
// Primary Badge
<span className="badge-primary">Active</span>

// Success Badge
<span className="badge-success">Running</span>

// Danger Badge
<span className="badge-danger">Offline</span>
```

### Stats Display

```tsx
<StatsCard
  icon={Cpu}
  label="CPU Usage"
  value={65}
  unit="%"
  percentage={65}
  trend="up"
  color="orange"
/>
```

### Tables

```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', render: (val) => <span>{val}</span> }
  ]}
  data={items}
  onSort={handleSort}
  sortBy="name"
  sortOrder="asc"
/>
```

## 📏 Spacing Scale

Using Tailwind's spacing scale:
- **xs**: 4px (`p-1`)
- **sm**: 8px (`p-2`)
- **md**: 12px (`p-3`)
- **lg**: 16px (`p-4`)
- **xl**: 24px (`p-6`)
- **2xl**: 32px (`p-8`)

## 🎯 Component Guidelines

### Buttons
- **Min height**: 32px (sm), 40px (md)
- **Padding**: 8px horizontal, 6px vertical (sm), 12px/8px (md)
- **Border radius**: 8px
- **Transition**: 200ms ease-out
- **Hover state**: Darker shade + shadow lift

### Cards
- **Border radius**: 12px
- **Border**: 1px solid `zinc-800/50`
- **Padding**: 16px (sm), 20px (md)
- **Shadow**: `shadow-sm` (default), `shadow-lg` (hover)
- **Background**: `bg-[#1b1d23]` or glass effect

### Modals
- **Border radius**: 12px
- **Max width**: 512px (sm), 640px (md), 768px (lg)
- **Padding**: 24px
- **Backdrop**: `bg-black/60 backdrop-blur-sm`
- **Z-index**: 50 (backdrop), 50+ (content)

### Inputs
- **Min height**: 40px
- **Border radius**: 8px
- **Padding**: 12px
- **Border**: 1px solid `zinc-800`
- **Focus**: Border `blue-500` + ring-1 `blue-500`
- **Background**: `bg-zinc-900/50`

## 🌐 Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md to lg)
- **Desktop**: > 1024px (lg+)
- **Wide**: > 1280px (xl+)

### Mobile-First Approach
```tsx
// Mobile first, then enhance for larger screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## ✨ Animations

### Transitions
- **Fast**: 150ms (hover effects)
- **Normal**: 200ms (default interactions)
- **Slow**: 300ms (modal opens, page transitions)

### Utility Classes
- `.transition-smooth` - All properties, 300ms, ease-out
- `.hover-lift` - Translate + shadow on hover
- `.hover-glow` - Add glow shadow on hover
- `.fade-in` - Fade in from below

## 🔔 Status Indicators

### Online (Green)
```css
.status-online {
  @apply bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)];
}
```

### Offline (Red)
```css
.status-offline {
  @apply bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)];
}
```

### Starting (Yellow)
```css
.status-starting {
  @apply bg-yellow-500 animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.5)];
}
```

## 🎬 Accessibility

### Color Contrast
- Text on background: ≥ 4.5:1 WCAG AA
- UI components: ≥ 3:1 WCAG AA
- All interactive elements focus-visible

### Keyboard Navigation
- Tab order follows visual flow
- Focus indicators clearly visible (ring-1)
- Escape closes modals
- Enter/Space activate buttons

### ARIA Labels
```tsx
<button aria-label="Close notification">
  <X size={20} />
</button>
```

## 📦 Component Structure

### File Organization
```
src/components/
├── Sidebar.tsx         # Navigation sidebar
├── Topbar.tsx          # Header navigation
├── StatsCard.tsx       # Stats display
├── DataTable.tsx       # Data table component
├── Toast.tsx           # Notifications
└── index.ts            # Exports
```

### Component Template
```tsx
import React from 'react';
import { SomeIcon } from 'lucide-react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="card-dark p-6">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {/* Component content */}
    </div>
  );
};
```

## 🚀 Best Practices

### Do's
✅ Use design tokens for colors  
✅ Leverage existing utility classes  
✅ Keep components small and focused  
✅ Use TypeScript for type safety  
✅ Follow mobile-first responsive design  
✅ Add loading and error states  
✅ Test keyboard navigation  

### Don'ts
❌ Use arbitrary Tailwind values (use scale)  
❌ Hard-code colors (use tokens)  
❌ Create deeply nested divs  
❌ Skip ARIA labels on interactive elements  
❌ Ignore hover/focus states  
❌ Mix different design patterns  
❌ Use images without alt text  

## 🔄 State Management

### Loading State
```tsx
<div className="skeleton h-12 rounded-lg" />
```

### Disabled State
```tsx
<button disabled className="opacity-50 cursor-not-allowed">
  Disabled
</button>
```

### Error State
```tsx
<input className="border-red-500 focus:ring-red-500" />
<p className="text-red-400 text-sm mt-1">Error message</p>
```

## 📝 Examples

### Full Card Example
```tsx
<div className="card-dark p-6 border-blue-500/20">
  <div className="flex items-start justify-between mb-4">
    <h3 className="text-xl font-bold text-white">Server Status</h3>
    <span className="badge-success">Online</span>
  </div>
  <p className="text-zinc-400 mb-4">Your server is running smoothly</p>
  <button className="interactive-btn-primary w-full">
    View Details
  </button>
</div>
```

### Interactive Form Example
```tsx
<form className="space-y-6">
  <div>
    <label className="block text-sm font-medium text-zinc-300 mb-2">
      Server Name
    </label>
    <input
      type="text"
      className="input-field w-full"
      placeholder="Enter server name"
    />
  </div>
  <div className="flex gap-3">
    <button type="submit" className="interactive-btn-primary flex-1">
      Save
    </button>
    <button type="button" className="btn-secondary flex-1">
      Cancel
    </button>
  </div>
</form>
```

---

**Last Updated**: March 2026  
**Version**: 1.0.0  
**Maintained by**: Development Team
