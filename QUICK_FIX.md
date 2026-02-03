# Quick Fix Guide for Render Deployment Issues

## What Error Are You Seeing?

### 🔴 "Build Failed" or "Build Command Failed"

**Quick Fix:**
1. Check Render logs for specific TypeScript errors
2. Test build locally: `npm run build`
3. Ensure all imports use `.js` extensions (e.g., `'./routes/authRoutes.js'`)
4. Verify `tsconfig.json` is correct

**Common Causes:**
- TypeScript compilation errors
- Missing dependencies
- Incorrect import paths

---

### 🔴 "Cannot find module 'dist/index.js'"

**Quick Fix:**
1. Verify build completed successfully in logs
2. Check that `dist/` folder exists after build
3. Ensure `package.json` has `"main": "dist/index.js"`
4. Verify `tsconfig.json` has `"outDir": "dist"`

**Common Causes:**
- Build didn't complete
- `dist/` folder not generated
- Wrong output directory

---

### 🔴 "JWT_SECRET is not defined" or "JWT_SECRET is undefined"

**Quick Fix:**
1. Check Render Dashboard → Environment tab
2. Verify `JWT_SECRET` is listed (should be auto-generated)
3. If missing, add it manually in Render Dashboard
4. Or verify `render.yaml` has:
   ```yaml
   - key: JWT_SECRET
     generateValue: true
   ```

**Common Causes:**
- Environment variable not set
- `render.yaml` not applied correctly
- Service created manually without blueprint

---

### 🔴 "DATABASE_URL is not set" or Database Connection Errors

**Quick Fix:**
1. Verify database service is created and running (green status)
2. Check `render.yaml` database reference:
   ```yaml
   - key: DATABASE_URL
     fromDatabase:
       name: find-my-family-db
       property: connectionString
   ```
3. Ensure database name matches: `find-my-family-db`
4. Wait for database to fully provision before starting web service

**Common Causes:**
- Database not created yet
- Database name mismatch
- Service dependency order issue

---

### 🔴 "relation 'users' does not exist" or Table Missing Errors

**Quick Fix:**
1. Database schema not initialized
2. Get connection string from Render Dashboard → Database → Connect
3. Run: `psql "YOUR_CONNECTION_STRING" -f schema.sql`
4. Or use Render Shell tab in database service

**Common Causes:**
- Schema not run after database creation
- Wrong database selected
- Permission issues

---

### 🔴 "EADDRINUSE" or Port Already in Use

**Quick Fix:**
1. Verify `render.yaml` has `PORT: 10000`
2. Check your code uses `process.env.PORT`:
   ```typescript
   const PORT = Number(process.env.PORT) || 3000;
   ```
3. Render automatically sets PORT, but verify it's not conflicting

**Common Causes:**
- Port hardcoded in code
- Multiple services on same port
- Environment variable not read

---

### 🔴 Service Starts But Returns 500 Errors

**Quick Fix:**
1. Check runtime logs in Render Dashboard
2. Look for specific error messages
3. Verify database connection is working
4. Check if schema is initialized
5. Test health endpoint: `curl https://your-service.onrender.com/health`

**Common Causes:**
- Database not connected
- Missing tables
- Environment variables missing
- Code errors in routes/controllers

---

## Step-by-Step Debugging

### 1. Check Build Logs
```
Render Dashboard → Your Service → Logs → Build Logs
```
Look for:
- TypeScript errors
- Missing dependencies
- Build failures

### 2. Check Runtime Logs
```
Render Dashboard → Your Service → Logs → Runtime Logs
```
Look for:
- Startup errors
- Missing environment variables
- Database connection errors
- Application crashes

### 3. Verify Environment Variables
```
Render Dashboard → Your Service → Environment
```
Should have:
- ✅ `NODE_ENV=production`
- ✅ `PORT=10000`
- ✅ `DATABASE_URL` (auto-linked)
- ✅ `JWT_SECRET` (auto-generated)

### 4. Test Locally
```bash
# Install
npm install

# Build
npm run build

# Check build output
ls -la dist/

# Test start (requires DATABASE_URL and JWT_SECRET)
npm start
```

### 5. Run Diagnostic Script
```bash
./check-deployment.sh
```

---

## Most Common Fix

If you're not sure what's wrong, try this:

1. **Remove postinstall build** (if causing issues):
   ```json
   // In package.json, remove or comment out:
   // "postinstall": "npm run build"
   ```

2. **Verify render.yaml** is correct:
   - Database name matches
   - Environment variables are set
   - Build and start commands are correct

3. **Rebuild from scratch**:
   - Delete service in Render
   - Re-apply blueprint
   - Wait for database first
   - Then web service

4. **Check logs** for specific error messages

---

## Still Stuck?

1. Copy the **exact error message** from Render logs
2. Check which step failed (build, start, or runtime)
3. Share the error and I can help debug further!

Common places to find errors:
- Build logs: Render Dashboard → Service → Logs → Build
- Runtime logs: Render Dashboard → Service → Logs → Runtime
- Service events: Render Dashboard → Service → Events
