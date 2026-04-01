# Railway Deployment Guide for Pterodactyl Panel

Complete guide to deploy the Pterodactyl Server Management Panel to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub (Railway can deploy directly from GitHub)
3. **Docker**: Basic understanding of Docker (optional, Railway handles it)

## Quick Deploy (Recommended)

### Option 1: Deploy from GitHub via Railway UI

1. **Connect Your Repository**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "Start New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select the `root-shel` repository

2. **Configure Railway Project**
   - Railway will automatically detect the Dockerfile
   - Configure environment variables (see Configuration section below)
   - Deploy!

### Option 2: Deploy Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to project directory
cd root-shel

# Initialize Railway project
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set HOST=0.0.0.0

# Deploy
railway up
```

## Environment Configuration

Create environment variables in Railway Dashboard:

### Required Variables

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
```

### Optional Variables

```env
# Monitoring
MONITORING_INTERVAL=1000
LOG_LEVEL=info

# WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_PING_TIMEOUT=5000

# Server
SERVER_STATUS=running
DOCKER_IMAGE=ghcr.io/pterodactyl/yolks:node_20
STARTUP_COMMAND=npm start
AUTO_EXECUTE_STARTUP=true
```

## Troubleshooting Railway Deployment

### 1. Build Failures

**Problem**: Docker build fails
```
ERROR: failed to solve with frontend dockerfile.v0
```

**Solution**:
- Ensure `Dockerfile` exists in root directory
- Check Node.js version compatibility (Node 20 recommended)
- Verify all dependencies in `package.json` are installable

### 2. Port Issues

**Problem**: Application won't start on Railway
```
Error: listen EADDRINUSE :::3000
```

**Solution**:
- Railway automatically assigns a PORT via environment variable
- The Dockerfile uses `ENV PORT=3000` as default
- Railway will override this with actual port
- Server correctly uses `process.env.PORT`

### 3. WebSocket Connection Failures

**Problem**: WebSocket connections drop or fail
```
WebSocket connection to 'ws://...' failed
```

**Solution**:
- Railway supports WebSocket connections
- Check that WebSocket URL is using correct protocol (wss:// for HTTPS)
- Verify CORS is properly configured
- Check Railway logs for connection errors

### 4. Memory Issues

**Problem**: Application crashes with out of memory
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
```

**Solution**:
- Check memory limits in Railway plan
- Reduce monitoring interval: `MONITORING_INTERVAL=5000`
- Monitor system stats before crash
- Consider upgrading Railway plan if consistent crashes

## Real-Time Features Verification

### Check WebSocket Connection

1. Open browser DevTools (F12)
2. Go to Network tab → WS filter
3. Connect to application
4. Should see WebSocket connection to `/ws`
5. Observe real-time messages flowing

### Monitor Real-Time Stats

1. Open DevTools Console
2. Watch for messages like:
   ```
   {type: "stats_update", data: {...}}
   {type: "server_status", status: "running"}
   ```

### Test Server Actions

1. Click "Start" button in Topbar
2. Watch status change: offline → starting → running
3. Startup command should auto-execute (if enabled)
4. Monitor logs for execution confirmation

## Performance Optimization for Production

### 1. Monitoring Interval

Default: 1000ms (1 second)
For lower bandwidth:
```env
MONITORING_INTERVAL=5000  # Update every 5 seconds
```

### 2. Log Level

```env
LOG_LEVEL=warn  # Reduce logging in production
```

### 3. WebSocket Heartbeat

```env
WS_HEARTBEAT_INTERVAL=60000  # 60 second heartbeat
WS_PING_TIMEOUT=10000        # 10 second timeout
```

## Monitoring and Logs

### View Real-Time Logs on Railway

```bash
# Using Railway CLI
railway logs --follow

# View last 100 lines
railway logs --limit 100
```

### Log Format

Logs follow this pattern:
```
[timestamp] [level] message
2024-01-15T10:30:45.123Z [info] Server running on 0.0.0.0:3000
2024-01-15T10:30:46.456Z [info] New WebSocket connection
2024-01-15T10:30:47.789Z [warn] CPU usage high: 85%
```

## Scaling and Upgrades

### Single vs Multi-Replica

Current setup: Single replica (`numReplicas: 1` in railway.json)

For high availability, Railway supports multiple replicas:
- Update `numReplicas` in `railway.json`
- Consider shared file system for logs
- WebSocket will work but clients may need reconnection on failures

### Database Integration (Future)

When adding database:
1. Add PostgreSQL or MySQL service in Railway
2. Get connection string from Railway
3. Add to environment variables
4. Update server code to use database

## SSL/TLS Configuration

Railway automatically provides:
- HTTPS on custom domain
- SSL certificate (auto-renewed)
- HTTP → HTTPS redirect

For WebSocket with SSL:
- Use `wss://` protocol automatically in browser
- Server doesn't need SSL config (Railway handles it)

## Custom Domain Setup

1. In Railway Dashboard → Project Settings
2. Add custom domain (e.g., `panel.example.com`)
3. Update DNS records as instructed by Railway
4. SSL certificate auto-generated

## Backup and Restore

### File Backup

Railway restarts can clear application state. For persistent data:

```bash
# Backup audit logs locally
railway run "cp audit-logs.json /backup/"

# Backup server config
railway run "cp server-config.json /backup/"
```

### Environment Backup

Export Railway variables:
```bash
railway variables export > backup.env
```

## Monitoring Resources

### CPU Usage
- Monitor in Railway Dashboard
- Reduce monitoring frequency if consistently high
- Consider upgrading plan

### Memory Usage
- Check in Railway Dashboard metrics
- Default 512MB usually sufficient
- Increase if crashes occur

### Disk Usage
- Limited in Railway sandboxed environment
- Audit logs and configs are small (<10MB)
- Consider cleanup for old logs

## Estimated Costs

### Railway Pricing (as of 2024)

- Hobby Plan: $5/month (starter, limited resources)
- Pro Plan: $7/month + usage (recommended)
- Usage: ~$0.000463 per hour of CPU, ~$0.000051 per GB memory

Typical monthly cost for this application: $7-15/month

## Success Checklist

- [ ] Dockerfile builds successfully
- [ ] Application starts without errors
- [ ] WebSocket connections established
- [ ] Real-time stats update every second
- [ ] Server actions (start/stop/restart) work
- [ ] Startup commands execute automatically
- [ ] File manager operations functional
- [ ] Terminal emulator responsive
- [ ] Logs display in Railway Dashboard
- [ ] Custom domain configured (optional)

## Support and Resources

- **Railway Docs**: https://docs.railway.app
- **Discord Community**: https://discord.gg/railway
- **GitHub Issues**: Report bugs and features
- **Email Support**: support@railway.app (Pro plan)

## Next Steps

1. Prepare environment variables
2. Connect GitHub repository to Railway
3. Deploy and verify real-time features
4. Monitor logs and performance
5. Set up custom domain (optional)
6. Configure alerts (optional)
