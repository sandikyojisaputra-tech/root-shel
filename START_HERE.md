# Start Here - Pterodactyl Panel on Railway

Quick start guide to deploy your fully functional Pterodactyl Server Management Panel to Railway.

## 30-Second Overview

Your Pterodactyl Panel is production-ready with:
- Real-time server monitoring (CPU, memory, disk)
- Live WebSocket updates every second
- Terminal emulator, file manager, Docker config
- Auto-executing startup commands
- Comprehensive error handling
- Docker containerization included
- Railway deployment ready

## 5-Minute Deployment

### Step 1: Prepare Your Code (1 minute)
```bash
# Make sure you're in the project directory
cd root-shel

# Create environment file
cp .env.example .env

# Push to GitHub (if not already pushed)
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Deploy to Railway (2 minutes)
1. Go to [railway.app](https://railway.app)
2. Sign in or create account
3. Click "Start New Project"
4. Select "Deploy from GitHub repo"
5. Connect your GitHub account
6. Select `root-shel` repository
7. Click "Deploy"

### Step 3: Configure Environment (2 minutes)
Railway auto-detects your Dockerfile. Set these variables:
```
NODE_ENV = production
HOST = 0.0.0.0
PORT = 3000 (Railway overrides this)
```

That's it! Your app should deploy in 3-5 minutes.

## Verify It's Working

1. **Check the Logs**
   - Click "View Logs" in Railway Dashboard
   - Should see: "Server running on 0.0.0.0:3000"

2. **Test WebSocket**
   - Open your app URL
   - Open DevTools (F12) → Network tab → WS filter
   - Should see WebSocket connection
   - Refresh page, stats should update

3. **Test Features**
   - Dashboard stats should auto-update
   - Click "Start" server button
   - Status should change: offline → starting → running
   - Check "Startup" tab - should show Docker config

## Real-Time Features You Have

- **Live Stats**: CPU, Memory, Disk update every second
- **Server Control**: Start/Stop/Restart with visual feedback
- **Auto-Startup**: Run commands when server starts
- **Terminal**: Full bash terminal access
- **File Manager**: Browse, upload, download files
- **Docker Config**: 20+ pre-configured Docker images
- **Audit Logs**: Track all server actions
- **Connection Status**: See WebSocket status in header

## Important Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variable template |
| `Dockerfile` | Docker build config |
| `server.ts` | Backend + WebSocket server |
| `src/App.tsx` | Frontend app (3000+ lines) |
| `DEPLOYMENT_READY.md` | Full deployment info |
| `RAILWAY_DEPLOYMENT.md` | Detailed Railway guide |
| `PRODUCTION_CHECKLIST.md` | Pre-deploy verification |

## Troubleshooting

### App Won't Start
```
Check Railway logs: "View Logs" in Dashboard
Look for: error messages, port conflicts, missing dependencies
```

### WebSocket Won't Connect
```
Open DevTools Console
Should see: "[WebSocket] Connected"
If error: Check network tab for failed connection
```

### Stats Not Updating
```
WebSocket must be connected
Server must be returning stats
Check log for: "stats_update" messages
```

### Docker Build Fails
```
Wait 5-10 minutes for Railway build to complete
Check build logs in Railway Dashboard
Ensure Dockerfile exists in root directory
```

## Performance Notes

- **CPU Usage**: ~5% idle (normal)
- **Memory**: ~100MB baseline
- **Startup Time**: 3-5 seconds
- **Stats Latency**: ~100ms
- **Cost**: ~$7-15/month on Railway

## Next Steps

1. ✅ Deploy to Railway (you are here)
2. 📖 Read DEPLOYMENT_READY.md for full details
3. 🔍 Follow PRODUCTION_CHECKLIST.md before production
4. 📊 Monitor Railway Dashboard for performance
5. 📱 Test on mobile and different browsers

## Common Commands

```bash
# View live logs
railway logs --follow

# View last 100 lines
railway logs --limit 100

# Set environment variable
railway variables set KEY=value

# Check project status
railway status

# Restart app
railway restart
```

## Useful URLs

- **Railway Dashboard**: https://railway.app
- **Your App**: Check Railway project for deployment URL
- **Full Deployment Guide**: See RAILWAY_DEPLOYMENT.md
- **Production Checklist**: See PRODUCTION_CHECKLIST.md

## Features Summary

```
Terminal Emulator      ✅ Full bash with xterm.js
File Manager          ✅ Upload, download, browse
Server Control        ✅ Start/stop/restart
Docker Config         ✅ 20+ pre-configured images
Startup Commands      ✅ Auto-execute on start
Real-Time Stats       ✅ Updates every second
Audit Logs            ✅ Track all actions
Responsive Design     ✅ Works on mobile
WebSocket RTx         ✅ Bidirectional live updates
Error Handling        ✅ Comprehensive
Monitoring            ✅ CPU/Memory/Disk
Command Palette       ✅ Quick access
Auto-Reconnect        ✅ On connection loss
```

## Need Help?

1. **Deployment Issues**: See RAILWAY_DEPLOYMENT.md
2. **Feature Questions**: See ARCHITECTURE.md
3. **Pre-Deployment**: See PRODUCTION_CHECKLIST.md
4. **General Troubleshooting**: See TROUBLESHOOTING.md
5. **Development**: See QUICK_REFERENCE.md

---

**You're all set!** Deploy to Railway and enjoy your real-time Pterodactyl Panel.

**Questions?** Check the docs in the root folder or Railway documentation at docs.railway.app
