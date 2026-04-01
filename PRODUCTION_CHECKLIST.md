# Production Checklist - Pterodactyl Panel on Railway

Complete checklist before deploying to production.

## Pre-Deployment

### Code Quality
- [ ] All console.log debug statements removed
- [ ] TypeScript compiles without errors
- [ ] No console warnings in development build
- [ ] All imports are properly resolved
- [ ] No unused variables or imports

### Testing
- [ ] Server starts without errors: `npm run dev`
- [ ] Frontend builds successfully: `npm run build`
- [ ] WebSocket connection establishes correctly
- [ ] Real-time stats update flowing
- [ ] All UI components render properly
- [ ] No broken links or missing assets

### Performance
- [ ] Build bundle size reasonable (<500KB gzipped)
- [ ] Initial load time < 3 seconds
- [ ] Stats update latency < 1.5 seconds
- [ ] WebSocket messages deliver reliably
- [ ] No memory leaks detected

### Security
- [ ] Environment variables use .env.example template
- [ ] No API keys in source code
- [ ] No sensitive data in logs
- [ ] CORS configured appropriately
- [ ] Input validation implemented
- [ ] File path traversal protection active

## Deployment Configuration

### Environment Variables
- [ ] PORT set (Railway will override)
- [ ] HOST set to 0.0.0.0
- [ ] NODE_ENV set to production
- [ ] MONITORING_INTERVAL configured
- [ ] All optional vars have defaults

### Docker Configuration
- [ ] Dockerfile exists and is valid
- [ ] .dockerignore excludes unnecessary files
- [ ] Build completes in < 5 minutes
- [ ] Image size < 500MB
- [ ] All system dependencies installed

### Railway Setup
- [ ] Railway account created and verified
- [ ] GitHub repository connected
- [ ] Branch selected (main/master)
- [ ] Project created on Railway
- [ ] Deployment trigger configured

## Real-Time Feature Verification

### WebSocket Infrastructure
- [ ] WebSocket server initialized on startup
- [ ] Broadcasting function implemented
- [ ] Message types defined and handled
- [ ] Connection tracking working
- [ ] Graceful disconnection implemented
- [ ] Reconnection with exponential backoff

### Real-Time Stats
- [ ] CPU monitoring active
- [ ] Memory tracking functional
- [ ] Disk usage calculated correctly
- [ ] Network stats placeholder ready
- [ ] Uptime counter accurate
- [ ] Stats update at configured interval

### Server Actions
- [ ] Start action broadcasts status changes
- [ ] Stop action properly stops service
- [ ] Restart action cycles correctly
- [ ] Startup command executes on start
- [ ] Command execution logged
- [ ] Status persists across restarts

### Frontend Integration
- [ ] useWebSocket hook created
- [ ] Connection status displayed
- [ ] Stats auto-update in dashboard
- [ ] Error messages shown appropriately
- [ ] Reconnection handled gracefully
- [ ] ConnectionStatus component working

## Monitoring and Logging

### Application Logs
- [ ] Server startup messages clear
- [ ] Port and host logged on start
- [ ] Connection events logged
- [ ] Error stack traces visible
- [ ] Audit log file created
- [ ] Log rotation configured (if needed)

### Railway Integration
- [ ] Logs visible in Railway Dashboard
- [ ] No sensitive data in logs
- [ ] Error logs identified quickly
- [ ] Warning logs reviewed
- [ ] Info logs informative
- [ ] Debug logs disabled in production

### Error Handling
- [ ] Try-catch blocks for API routes
- [ ] WebSocket error handlers present
- [ ] Graceful degradation on failures
- [ ] User-friendly error messages
- [ ] Error logging implemented
- [ ] Recovery mechanisms in place

## Feature Validation

### Terminal Emulator
- [ ] WebSocket connection to shell works
- [ ] Commands execute correctly
- [ ] Output displays in real-time
- [ ] Tab completion functional
- [ ] Shell prompt visible
- [ ] Input/output synchronized

### File Manager
- [ ] Directory listing works
- [ ] File upload functional
- [ ] File download works
- [ ] Create folder works
- [ ] Create file works
- [ ] Delete operations safe (no critical files)
- [ ] Rename functional
- [ ] Path traversal prevented

### Server Configuration
- [ ] Docker image selector populated
- [ ] Startup command editable
- [ ] Config saves to file
- [ ] Config loads on restart
- [ ] Auto-execution toggle working
- [ ] Execution log displays correctly

### Dashboard
- [ ] Stats cards display correctly
- [ ] Real-time updates visible
- [ ] Colors consistent with theme
- [ ] Responsive on all screen sizes
- [ ] Mobile controls working
- [ ] Touch gestures functional

## Performance Benchmarks

### Startup Time
- [ ] Server starts in < 5 seconds
- [ ] First page load in < 3 seconds
- [ ] WebSocket connects in < 1 second
- [ ] Initial stats received in < 2 seconds

### Ongoing Performance
- [ ] CPU usage < 20% idle
- [ ] Memory usage < 150MB
- [ ] No memory leaks over 1 hour
- [ ] WebSocket latency < 100ms
- [ ] Stats update rate consistent

### Scalability
- [ ] 10+ simultaneous WebSocket connections
- [ ] Multiple browser tabs supported
- [ ] No degradation with multiple users
- [ ] File operations don't freeze UI

## Browser Compatibility

Tested on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Deployment Steps

1. [ ] Clone repository: `git clone <repo>`
2. [ ] Install dependencies: `npm install`
3. [ ] Build frontend: `npm run build`
4. [ ] Test locally: `npm run dev`
5. [ ] Push to GitHub
6. [ ] Navigate to Railway Dashboard
7. [ ] Connect GitHub repo
8. [ ] Set environment variables
9. [ ] Deploy
10. [ ] Monitor logs
11. [ ] Verify all features work
12. [ ] Set up custom domain (optional)
13. [ ] Configure monitoring alerts (optional)

## Post-Deployment

### Immediate (First 30 minutes)
- [ ] Check Railway logs for errors
- [ ] Verify WebSocket connections stable
- [ ] Test all server actions
- [ ] Confirm real-time stats flowing
- [ ] Monitor CPU/memory usage
- [ ] Check error rates

### Short-term (First 24 hours)
- [ ] Monitor for memory leaks
- [ ] Check log file growth
- [ ] Verify all features stable
- [ ] Monitor error patterns
- [ ] Test during peak usage
- [ ] Collect performance metrics

### Ongoing
- [ ] Set up monitoring/alerts (if available)
- [ ] Plan backup strategy
- [ ] Document any issues
- [ ] Track performance metrics
- [ ] Monitor Railway billing
- [ ] Plan scaling strategy

## Rollback Procedure

If deployment fails:

1. Check Railway logs for specific error
2. Review recent changes in Git
3. Rollback to last known good commit:
   ```bash
   git revert <commit-hash>
   git push
   ```
4. Railway automatically redeploys on push
5. Verify deployment succeeded
6. Investigate root cause locally

## Success Indicators

- Server starts without errors
- Dashboard displays real-time data
- WebSocket maintains stable connection
- All buttons/controls responsive
- File operations completed successfully
- Terminal commands execute properly
- Logs show normal operation
- CPU/Memory within expected ranges
- No console errors in browser DevTools
- Users can access and use all features

## Documentation

- [ ] README.md up to date
- [ ] RAILWAY_DEPLOYMENT.md complete
- [ ] .env.example has all variables
- [ ] API documentation current
- [ ] Known issues documented
- [ ] Troubleshooting guide helpful

## Support Contacts

- Railway Support: support@railway.app
- GitHub Issues: Create issue in repo
- Emergency: Check Railway status page
- Documentation: docs.railway.app

## Sign-Off

- [ ] Developer has tested locally
- [ ] Code review completed
- [ ] All checklist items verified
- [ ] Ready for production deployment

**Date**: ___________
**Developer**: ___________
**Approver**: ___________
