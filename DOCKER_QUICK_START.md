# Docker & Auto-Startup Quick Start Guide

## 5-Minute Setup

### Step 1: Navigate to Startup Configuration
- Click on **Startup** in the sidebar
- You'll see the Startup Configuration page

### Step 2: Select a Docker Image
1. Find the **Docker Image** dropdown
2. Choose from categories:
   - **Runtime Environments** - Node, Python, Java, Go, Rust, Ruby, PHP, .NET
   - **Game Servers** - Minecraft, Rust, CS:GO, Factorio, Valheim
   - **Databases** - MySQL, PostgreSQL, MongoDB, Redis
   - **Utilities** - Ubuntu, Alpine, Debian
3. Image description appears below
4. Default startup command updates automatically

### Step 3: Set Startup Command
1. Find **Startup Command** field
2. Default command is pre-filled based on image
3. Customize if needed:
   - Node.js: `npm start`, `node app.js`, `npm run dev`
   - Python: `python3 app.py`, `flask run`
   - Java: `java -jar app.jar`
   - Game Server: `/start.sh`, `./server.sh`
4. Type your command

### Step 4: Enable Auto-Execution
1. Scroll to **Auto-Execution** section
2. Toggle **"Auto-Execute Startup Command"** ON (green)
3. This makes startup command run automatically when server starts

### Step 5: Save Configuration
1. Click **Save Configuration** button (top right)
2. Wait for success message
3. Settings are now saved

### Step 6: Start Your Server
1. Click Start button in top bar
2. Server starts automatically
3. Wait ~2 seconds
4. Startup command executes automatically
5. Execution logs display in real-time

## Common Setup Examples

### Node.js Application
```
Docker Image: node:lts
Startup Command: npm start

// Or with custom script:
npm run production

// Or run directly:
node server.js
```

### Python Web App (Flask)
```
Docker Image: python:3.11
Startup Command: flask run --host=0.0.0.0

// Or with Gunicorn:
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Java Application
```
Docker Image: java:21
Startup Command: java -jar app.jar

// Or with memory limit:
java -Xmx1024m -jar app.jar
```

### Minecraft Server
```
Docker Image: itzg/minecraft-server:latest
Startup Command: /start.sh
```

### Rust Game Server
```
Docker Image: didstopia/rust-server:latest
Startup Command: /start.sh
```

### Python Data Application
```
Docker Image: python:3.10
Startup Command: python3 -u process.py
```

## Managing Environment Variables

### Adding Variables
1. In Startup Configuration, find **Environment Variables**
2. Click **+** button to add new variable
3. Enter **Key** (e.g., `NODE_ENV`)
4. Enter **Value** (e.g., `production`)
5. Click Save Configuration

### Common Variables

**Node.js:**
```
NODE_ENV = production
PORT = 3000
DEBUG = false
```

**Python:**
```
PYTHONUNBUFFERED = 1
FLASK_ENV = production
DEBUG = 0
```

**Java:**
```
JAVA_OPTS = -Xmx2048m
LOG_LEVEL = INFO
```

**Game Servers:**
```
EULA = TRUE (for Minecraft)
MEMORY = 2G
SERVER_PORT = 27015
```

## Testing Before Going Live

### Option 1: Test Execute Button
1. Configure your startup command
2. Enable auto-execution
3. Click **Test Execute Now** button
4. Watch execution logs appear
5. Verify command works correctly
6. No need to restart server

### Option 2: Manual Test
1. Start server normally
2. Check logs for errors
3. If problems, stop server
4. Modify command
5. Try again

## Troubleshooting

### Startup Command Not Executing
**Problem:** Auto-execution is off
**Solution:** Toggle auto-execution ON in Auto-Execution section

**Problem:** Command has wrong syntax
**Solution:** Use "Test Execute Now" to validate command

**Problem:** Docker image missing required files
**Solution:** Verify image contains needed dependencies

### Server Won't Start
**Problem:** Invalid Docker image name
**Solution:** Re-select from dropdown (don't type custom)

**Problem:** Server resources exhausted
**Solution:** Stop other containers, increase resources

### Execution Logs Show Errors
**Problem:** Command doesn't exist in container
**Solution:** Check Docker image documentation for available commands

**Problem:** Missing dependencies
**Solution:** Install in Dockerfile or startup script

## Advanced Usage

### Multi-Command Execution
Use && to chain commands:
```
npm install && npm start
```

### Conditional Execution
```
npm run build && npm start
```

### Background Processes
```
node server.js &
```

### With Logging
```
npm start > /tmp/server.log 2>&1
```

## Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Save Configuration | Ctrl+S (in form) |
| Test Execute | Click button |
| Clear Logs | Click "Clear" button |
| Start Server | Click button in topbar |

## Performance Tips

1. **Use lightweight images**
   - Alpine (~5MB) vs Ubuntu (~70MB)
   - Saves bandwidth and startup time

2. **Minimize startup commands**
   - Avoid large downloads in startup
   - Pre-cache dependencies in image

3. **Monitor resource usage**
   - Check CPU/Memory in Dashboard
   - Adjust Java heap size if needed

4. **Use environment variables**
   - Keep configuration external
   - Easy to modify without rebuilding

## Frequently Asked Questions

**Q: Can I use custom Docker images?**
A: Yes, enter the full image name (must be in repository)

**Q: Do startup commands run on every restart?**
A: Yes, if auto-execution is enabled

**Q: Can I disable auto-execution?**
A: Yes, toggle it off in Auto-Execution section

**Q: What if startup command fails?**
A: Check execution logs - they show exact error

**Q: Can I run multiple commands?**
A: Yes, use && to chain them or use a shell script

**Q: How long does auto-execution take?**
A: Usually 1-3 seconds after container starts

**Q: Are environment variables required?**
A: No, they're optional unless command needs them

**Q: Can I modify command during runtime?**
A: Yes, stop server, modify, save, restart

## Getting Help

1. Check `DOCKER_FEATURES.md` for detailed documentation
2. Review `ARCHITECTURE.md` for technical details
3. Look at example configurations above
4. Use "Test Execute Now" to validate commands
5. Check execution logs for error messages

## Related Documentation

- [DOCKER_FEATURES.md](./DOCKER_FEATURES.md) - Complete feature guide
- [README.md](./README.md) - Project overview
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - General quick reference
- [DOCKER_IMPLEMENTATION_SUMMARY.md](./DOCKER_IMPLEMENTATION_SUMMARY.md) - Technical details
