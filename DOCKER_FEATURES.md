# Docker Images and Startup Commands

## Overview

The Pterodactyl Server Management Panel now includes comprehensive Docker image selection and automatic startup command execution features. This allows users to quickly deploy different runtime environments and game servers with pre-configured startup commands.

## Docker Image Categories

### Runtime Environments (10 options)
- **Node.js LTS/Latest** - JavaScript runtime with npm
- **Python 3.9/3.10/3.11** - Python development environment
- **Java 17/21 LTS** - Java virtual machine
- **Go Latest** - Go programming language
- **Rust Latest** - Rust systems programming language
- **Ruby 3.2** - Ruby on Rails environment
- **PHP 8.2 Apache** - PHP web server
- **.NET 7** - Microsoft .NET runtime

### Game Servers (5 options)
- **Minecraft Java** - Minecraft server with EULA
- **Rust Game Server** - Rust multiplayer server
- **CS:GO Server** - Counter-Strike server
- **Factorio Server** - Factorio multiplayer server
- **Valheim Server** - Valheim dedicated server

### Databases (4 options)
- **MySQL 8.0** - Relational database
- **PostgreSQL 15** - Advanced SQL database
- **MongoDB** - NoSQL database
- **Redis** - In-memory cache and data store

### Utilities (3 options)
- **Ubuntu 22.04** - Base Linux distribution
- **Alpine Linux** - Lightweight Linux
- **Debian Bookworm** - Debian base image

## Features

### 1. Extended Docker Image Selection

The startup configuration page now displays all available Docker images organized by category. Users can:

- Browse 22+ pre-configured Docker images
- Select from different runtime environments, game servers, and databases
- View descriptions for each image
- See recommended startup commands

**Implementation:**
```typescript
// From src/config/dockerImages.ts
import { DOCKER_IMAGES, getImagesByCategory } from './config/dockerImages';

// Filter images by category
const runtimeImages = DOCKER_IMAGES.filter(img => img.category === 'runtime');
const gameServers = DOCKER_IMAGES.filter(img => img.category === 'game-server');
```

### 2. Auto-Execution of Startup Commands

When a server starts or restarts, the configured startup command can be automatically executed within the Docker container. This eliminates the need for manual command entry after server start.

**Features:**
- Toggle auto-execution on/off
- View real-time execution logs
- Test execute commands without starting the server
- Automatic retry logic and error handling

**How it works:**

1. User configures a startup command (e.g., `npm start`, `java -jar app.jar`)
2. User enables "Auto-Execute Startup Command"
3. When pressing Start or Restart:
   - Server container is started
   - After connection is established, the startup command automatically executes
   - Execution is logged with timestamps
   - Failures are captured and displayed

**Configuration:**
```javascript
// In Startup Configuration view
config = {
  startupCommand: "npm start",
  dockerImage: "node:lts",
  autoStartCommand: true,  // Enable auto-execution
  envVars: []
}
```

### 3. Enhanced API Integration

The server actions API now accepts startup command information:

**Endpoint:** `POST /api/server/action`
```json
{
  "action": "start",
  "startupCommand": "npm start",
  "dockerImage": "node:lts",
  "autoExecute": true
}
```

**Execution Endpoint:** `POST /api/server/execute`
```json
{
  "command": "npm start",
  "dockerImage": "node:lts",
  "envVars": [
    { "key": "NODE_ENV", "value": "production" }
  ]
}
```

### 4. Visual Indicators

The Topbar now displays:
- Current Docker image name (on Startup view)
- Auto-execution status (Auto/Manual)
- Color-coded indicators (green for auto, yellow for manual)

## Configuration

### Setting Up Docker Images

1. Navigate to **Startup Configuration** tab
2. Select a Docker image from the dropdown
3. The default startup command updates automatically
4. Customize the command if needed
5. Click **Save Configuration**

### Enabling Auto-Execution

1. In Startup Configuration, find "Auto-Execution" section
2. Toggle "Auto-Execute Startup Command" ON
3. Customize your startup command
4. Save configuration
5. When starting/restarting the server, the command will execute automatically

### Testing Startup Commands

1. Enable auto-execution
2. Click **Test Execute Now** button
3. View execution logs in real-time
4. Logs show timestamps and output
5. Use to validate commands before production use

## API Structure

### Server Actions

**File:** `src/utils/serverActions.ts`

```typescript
interface ServerActionPayload {
  action: 'start' | 'stop' | 'restart';
  startupCommand?: string;
  dockerImage?: string;
  autoExecute?: boolean;
}

async function performServerAction(
  payload: ServerActionPayload
): Promise<ServerActionResponse>
```

### Startup Command Execution

```typescript
interface StartupCommandPayload {
  command: string;
  dockerImage: string;
  envVars?: Array<{ key: string; value: string }>;
}

async function executeStartupCommand(
  payload: StartupCommandPayload
): Promise<StartupCommandResponse>
```

## Validation

### Startup Command Validation

The system validates startup commands for:
- Empty command detection
- Dangerous pattern detection (rm -rf /, mkfs, etc.)
- Command length limits (max 2048 chars)

```typescript
import { validateStartupCommand } from './utils/serverActions';

const result = validateStartupCommand('npm start');
// Returns: { valid: true, errors: [] }
```

### Docker Image Validation

```typescript
import { validateDockerImage } from './utils/serverActions';

const result = validateDockerImage('node:lts');
// Returns: { valid: true, errors: [] }
```

## Recommended Startup Commands

The panel includes a helper function that suggests startup commands based on Docker image:

```typescript
import { getRecommendedCommand } from './utils/serverActions';

const cmd = getRecommendedCommand('node:lts');
// Returns: 'node app.js'

const cmd2 = getRecommendedCommand('java:17');
// Returns: 'java -jar app.jar'
```

## Examples

### Node.js Server

```
Docker Image: node:lts
Startup Command: npm start
Environment Variables:
  - NODE_ENV = production
  - PORT = 3000
```

### Minecraft Server

```
Docker Image: itzg/minecraft-server:latest
Startup Command: /start.sh
Environment Variables:
  - EULA = TRUE
  - MEMORY = 2G
```

### Python Application

```
Docker Image: python:3.11
Startup Command: python3 app.py
Environment Variables:
  - PYTHONUNBUFFERED = 1
  - DEBUG = 0
```

### Java Application

```
Docker Image: eclipse-temurin:21
Startup Command: java -jar app.jar
Environment Variables:
  - JAVA_OPTS = -Xmx1024m
```

## Execution Flow

```
User clicks Start/Restart
    ↓
Server action sent with startup command
    ↓
Docker container is created and started
    ↓
Wait for container readiness (1.5s)
    ↓
If autoExecute is enabled:
    → Send startup command to container
    → Capture and log output
    → Display execution status
    ↓
Server status updated to 'running'
    ↓
Execution logs displayed in UI
```

## Error Handling

### Common Issues

**Command not executing:**
- Check auto-execution is enabled
- Verify command syntax is correct
- Check Docker image has required dependencies
- Review execution logs for errors

**Server won't start:**
- Check Docker image availability
- Verify container has required resources
- Check Docker daemon is running
- Review server logs for detailed errors

**Environment variables not set:**
- Add variables in Environment Variables section
- Ensure key and value are not empty
- Click Save Configuration after adding

## Future Enhancements

- [ ] Command scheduling (run at specific times)
- [ ] Command templates library
- [ ] Multi-command execution sequences
- [ ] Conditional command execution
- [ ] Custom Docker image support
- [ ] Health check configuration
- [ ] Performance monitoring during execution
- [ ] Rollback functionality

## See Also

- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick start guide
