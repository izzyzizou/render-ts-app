# Render Deployment Debugging Guide

## Common Issues and Solutions

### 1. Build Failures

#### Issue: TypeScript Compilation Errors
**Symptoms:**
- Build logs show TypeScript errors
- `dist/` folder is missing or incomplete

**Solutions:**
- Check build logs in Render Dashboard → Your Service → Logs
- Test build locally: `npm run build`
- Ensure all TypeScript files compile without errors
- Check `tsconfig.json` is correct

#### Issue: Missing Dependencies
**Symptoms:**
- `Cannot find module` errors
- Missing package errors during build

**Solutions:**
- Verify all dependencies are in `package.json`
- Check `devDependencies` are included (TypeScript is needed for build)
- Run `npm install` locally to verify

### 2. Start Command Failures

#### Issue: Cannot find dist/index.js
**Symptoms:**
- Error: `Cannot find module 'dist/index.js'`
- Service fails to start

**Solutions:**
- Verify build completed successfully
- Check that `dist/` folder exists after build
- Ensure `tsconfig.json` has correct `outDir: "dist"`

#### Issue: Port Already in Use
**Symptoms:**
- Error: `EADDRINUSE: address already in use`
- Service won't start

**Solutions:**
- Render automatically sets PORT, but verify it's set correctly
- Check `render.yaml` has `PORT: 10000`
- Ensure your code uses `process.env.PORT`

### 3. Environment Variable Issues

#### Issue: Missing JWT_SECRET
**Symptoms:**
- Authentication fails
- Error: `JWT_SECRET is not defined`

**Solutions:**
- Verify `render.yaml` has `JWT_SECRET` with `generateValue: true`
- Check environment variables in Render Dashboard
- Ensure code handles missing env vars gracefully

#### Issue: DATABASE_URL Not Set
**Symptoms:**
- Database connection errors
- Service crashes on startup

**Solutions:**
- Verify database is created before web service
- Check `render.yaml` database reference is correct
- Ensure `fromDatabase` property matches database name
- Wait for database to be fully provisioned

### 4. Database Connection Issues

#### Issue: SSL Connection Required
**Symptoms:**
- `SSL connection required` error
- Database connection fails

**Solutions:**
- Verify `db.ts` has SSL configuration for production
- Check `NODE_ENV=production` is set
- Render databases require SSL

#### Issue: Database Schema Not Initialized
**Symptoms:**
- `relation "users" does not exist` errors
- Tables missing

**Solutions:**
- Run `schema.sql` after database is created
- Use Render Shell or external psql client
- See `RENDER_DEPLOYMENT.md` for instructions

### 5. Runtime Errors

#### Issue: Module Not Found (ESM)
**Symptoms:**
- `Cannot find module` errors at runtime
- Import errors with `.js` extensions

**Solutions:**
- Verify `package.json` has `"type": "module"`
- Ensure imports use `.js` extensions (even for `.ts` files)
- Check `tsconfig.json` module settings

#### Issue: CORS Errors
**Symptoms:**
- Frontend can't connect
- CORS policy errors

**Solutions:**
- Update CORS origin in `src/index.ts` to your frontend domain
- For development, `origin: "*"` is fine
- For production, specify exact domain

## Debugging Steps

### Step 1: Check Build Logs
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for build errors (red text)
5. Check for TypeScript compilation errors

### Step 2: Check Runtime Logs
1. After build succeeds, check runtime logs
2. Look for startup errors
3. Check for missing environment variables
4. Verify server starts on correct port

### Step 3: Test Locally
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Check if dist/ exists
ls -la dist/

# Test start command
npm start
```

### Step 4: Verify Environment Variables
1. Go to Render Dashboard → Your Service → Environment
2. Verify all required variables are set:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `DATABASE_URL` (should be auto-linked)
   - `JWT_SECRET` (should be auto-generated)

### Step 5: Check Database Status
1. Go to Render Dashboard → Your Database
2. Verify status is "Available" (green)
3. Check connection string is correct
4. Verify database name matches `render.yaml`

### Step 6: Test Health Endpoint
Once service is running:
```bash
curl https://your-service.onrender.com/health
```
Should return: `{"status":"ok","uptime":...}`

## Quick Fixes

### Fix 1: Remove postinstall Build (Recommended)
The `postinstall` script can cause issues. Update `package.json`:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    // Remove or comment out: "postinstall": "npm run build"
  }
}
```

### Fix 2: Add Error Handling for Missing Env Vars
Add to `src/index.ts`:
```typescript
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set!');
  process.exit(1);
}
```

### Fix 3: Verify Build Output
Add a script to verify build:
```json
{
  "scripts": {
    "verify": "node -e \"require('./dist/index.js')\""
  }
}
```

## Getting Help

If issues persist:
1. Copy full error logs from Render Dashboard
2. Check Render status page: https://status.render.com
3. Review Render documentation: https://render.com/docs
4. Check service logs for specific error messages

## Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `Cannot find module` | Missing dependency or wrong import | Check package.json and imports |
| `EADDRINUSE` | Port conflict | Verify PORT env var |
| `relation does not exist` | Schema not initialized | Run schema.sql |
| `SSL connection required` | Database SSL not configured | Check db.ts SSL settings |
| `JWT_SECRET is undefined` | Missing env var | Check render.yaml config |
