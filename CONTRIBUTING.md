# Contributing to Pterodactyl Panel

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the Pterodactyl Server Management Panel.

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Help others learn and grow
- Report issues responsibly

## Getting Started

### Prerequisites
- Node.js 18+ or tsx runtime
- Git for version control
- A code editor (VS Code recommended)
- Basic React and TypeScript knowledge

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/pterodactyl-panel.git
cd pterodactyl-panel

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in browser
```

### Building for Production

```bash
# Build the project
npm run build

# Output is in dist/ directory
# Preview production build
npm run preview

# Start production server
npm start
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/improvement
```

### 2. Make Your Changes

Follow the coding standards and patterns described in STYLE_GUIDE.md and ARCHITECTURE.md.

### 3. Test Thoroughly

- Test on desktop browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile devices
- Test keyboard navigation
- Test with WebSocket disconnects
- Check console for errors/warnings

### 4. Commit with Clear Messages

```bash
git add .
git commit -m "feat: add new feature description"
git commit -m "fix: resolve issue with X"
git commit -m "docs: update README"
git commit -m "style: improve button styling"
git commit -m "refactor: reorganize component structure"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/my-new-feature
```

Then create a pull request on GitHub with:
- Clear description of changes
- Reference to related issues
- Screenshots if UI changes
- Testing notes

## What to Contribute

### Good First Issues
- 🐛 Bug fixes with clear reproduction steps
- 📚 Documentation improvements
- ✨ Minor UI/UX improvements
- 🎨 Styling enhancements
- ♻️ Code refactoring

### Major Features
- 🚀 New significant features (discuss in issue first)
- 🔄 Architecture changes
- 📊 New visualization types
- 🔌 Plugin/extension system

## Coding Standards

### TypeScript
```tsx
// Use explicit types
interface ComponentProps {
  title: string;
  onAction?: () => void;
  count?: number;
}

// Use const for components
export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onAction,
  count = 0,
}) => {
  // Component code
};
```

### React Best Practices
```tsx
// ✅ DO: Use hooks
const [count, setCount] = useState(0);
const handleClick = useCallback(() => setCount(c => c + 1), []);

// ❌ DON'T: Use class components or deprecated patterns
class OldComponent extends React.Component { }

// ✅ DO: Extract components
const Header = () => <h1>Title</h1>;
const Content = () => <p>Body</p>;
const Page = () => <><Header /><Content /></>;

// ❌ DON'T: Huge components
const MassiveComponent = () => { /* 500 lines */ };
```

### Styling
```tsx
// ✅ DO: Use utility classes
<button className="interactive-btn-primary">Click</button>

// ✅ DO: Use design tokens
className="bg-blue-600 text-white"

// ❌ DON'T: Use arbitrary values
<button className="bg-[#ff00ff]">Click</button>

// ❌ DON'T: Use inline styles
<button style={{ color: 'red' }}>Click</button>
```

### Comments
```typescript
// ✅ DO: Meaningful comments
// Fetch data on component mount
useEffect(() => {
  fetchServerStats();
}, []);

// ✅ DO: Document complex logic
// Convert milliseconds to human readable format
const formatUptime = (ms: number) => {
  const days = Math.floor(ms / 86400000);
  // ...
};

// ❌ DON'T: Obvious comments
// Set count to 0
const [count, setCount] = useState(0);
```

## File Organization

### New Components
```tsx
// src/components/NewComponent.tsx
import React from 'react';
import { SomeIcon } from 'lucide-react';

interface NewComponentProps {
  // Props here
}

export const NewComponent: React.FC<NewComponentProps> = ({ /* props */ }) => {
  // Component code
  return (
    <div className="card-dark">
      {/* JSX */}
    </div>
  );
};
```

### New Views
```tsx
// src/views/NewView.tsx
import React from 'react';

export const NewView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="section-header">
        <h2 className="section-title">New View</h2>
      </div>
      {/* Content */}
    </div>
  );
};
```

### New Hooks
```typescript
// src/hooks/useNewFeature.ts
import { useState, useCallback } from 'react';

export const useNewFeature = () => {
  const [state, setState] = useState(false);

  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  return { state, toggle };
};
```

## Testing Checklist

Before submitting a pull request, verify:

### Functionality
- [ ] Feature works as intended
- [ ] No console errors or warnings
- [ ] No performance regressions
- [ ] WebSocket handling is robust

### Design & UX
- [ ] Follows STYLE_GUIDE.md
- [ ] Responsive on mobile/tablet/desktop
- [ ] Consistent with existing UI
- [ ] Proper loading/error states

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color not only indicator

### Browser Compatibility
- [ ] Chrome/Chromium latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest
- [ ] Mobile browsers

## Common Issues & Solutions

### TypeScript Errors
```bash
# Run type checking
npm run lint

# Check tsconfig.json is correct
```

### Styling Not Applying
```bash
# Rebuild Tailwind CSS
npm run build

# Clear browser cache
# Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

### WebSocket Connection Issues
```javascript
// Check server is running
// Check protocol (ws vs wss)
// Check browser console for connection errors
```

### Component Not Rendering
```typescript
// Check component is exported
// Check import path
// Check props are correct type
// Check component is used in JSX
```

## Documentation Guidelines

### Code Comments
- Explain WHY, not WHAT
- Keep comments up-to-date with code
- Use clear, concise language

### Commit Messages
```
feat: add new feature (imperative)
fix: resolve bug
docs: update documentation
style: format code
refactor: improve structure
perf: optimize performance
test: add tests
chore: maintenance
```

### README Updates
- Keep installation clear and current
- Document new features
- Add examples for complex features
- Update feature list

## Performance Guidelines

### Terminal Performance
- Keep scrollback at 5000 lines
- Debounce resize events
- Avoid heavy updates on every message

### Component Performance
- Memoize expensive calculations
- Use virtual scrolling for large lists
- Lazy load heavy components
- Avoid unnecessary re-renders

### Network Performance
- Compress WebSocket messages
- Batch updates when possible
- Implement request debouncing
- Cache appropriate data

## Security Considerations

### What to Check
- [ ] No sensitive data in logs
- [ ] Input properly validated
- [ ] XSS protection via React escaping
- [ ] HTTPS/WSS in production
- [ ] No hardcoded API keys

### Reporting Security Issues
Please report security vulnerabilities responsibly:
1. Do NOT open public issues
2. Email security@example.com
3. Include steps to reproduce
4. Allow time for patch

## Resources

- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Git Guide**: https://git-scm.com/book/en/v2
- **xterm.js API**: https://xtermjs.org/docs/api/

## Project Roadmap

### In Progress
- 🚀 Terminal themes customization
- 📊 Advanced statistics dashboard
- 🔐 Enhanced security features

### Planned
- 🎮 Game-specific templates
- 📱 Mobile app companion
- 🔔 Real-time notifications
- 🌍 Multi-language support

### Discussing
- 💾 Database backup/restore UI
- 📈 Performance analytics
- 🤖 AI-powered server recommendations

## Questions?

- Check existing issues and pull requests
- Read ARCHITECTURE.md and DEVELOPMENT.md
- Review STYLE_GUIDE.md
- Ask in discussions section

## Recognition

Contributors will be recognized in:
- GitHub CONTRIBUTORS file
- Release notes for major contributions
- Special credit in documentation

---

**Thank you for contributing!** 🎉

Your efforts help make Pterodactyl Panel better for everyone.
