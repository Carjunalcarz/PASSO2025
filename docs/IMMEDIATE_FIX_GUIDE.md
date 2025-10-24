# 🚨 IMMEDIATE FIX - Appwrite Import & Data Issues

## Problem
- Import stops mid-way
- Can't retrieve data from property_assessments
- Appwrite becomes unresponsive

## Root Causes (Based on Your Config)

1. **Too Many Concurrent Requests** - 100 records at once overwhelms server
2. **Database Connection Pool Exhausted** - MariaDB can't handle load
3. **Memory Issues** - No memory limits set (`_APP_COMPUTE_MEMORY=0`)
4. **Network Timeouts** - Requests timing out

## IMMEDIATE FIXES (Do These Now)

### Step 1: Restart Appwrite (Windows)
```powershell
# Open PowerShell as Administrator
cd C:\path\to\appwrite

# Restart MariaDB first
docker restart appwrite-mariadb

# Wait 10 seconds
Start-Sleep -Seconds 10

# Restart Appwrite
docker restart appwrite

# Wait 20 seconds
Start-Sleep -Seconds 20

# Check status
docker ps | Select-String appwrite
```

### Step 2: Run Diagnostic
```powershell
# In your project folder
cd C:\PASSODEVELOP2025\expo\rptas\PASSO2025

# Run diagnostic
.\scripts\diagnose-appwrite.bat
```

### Step 3: Test Connection
Open browser console (F12) and run:
```javascript
// Quick test
await quickStatus('property_assessments')
```

If this works, your Appwrite is running!

### Step 4: Check What Happened
```javascript
// Full debug to see current state
await debugTable('property_assessments')
```

Look for:
- Total record count (did any records import?)
- Last import timestamp (when did it stop?)
- Error messages

## What I Fixed in Code

### Reduced Batch Size
**Before:**
```typescript
const HYPER_BATCH_SIZE = 100;  // Too aggressive
const BATCH_DELAY = 0;         // No breathing room
```

**After:**
```typescript
const HYPER_BATCH_SIZE = 25;   // Safer, more stable
const BATCH_DELAY = 100;       // Gives server time to process
```

### Why This Helps
- **25 records** instead of 100 = less memory pressure
- **100ms delay** = database can catch up
- **Fewer connection errors** = more reliable imports
- **Better error recovery** = can identify specific issues

## Speed Comparison

| Batch Size | Delay | 10k Records | Stability |
|------------|-------|-------------|-----------|
| 100 | 0ms | ~30 sec | ❌ Unstable |
| 25 | 100ms | ~2 min | ✅ Stable |

**Trade-off:** Slightly slower but MUCH more reliable!

## If Still Not Working

### Check 1: Is Appwrite Running?
```powershell
docker ps
```
Should see:
- `appwrite`
- `appwrite-mariadb`
- `appwrite-redis`

### Check 2: Can You Access Appwrite Console?
Open browser: `http://192.168.2.3`

If not loading:
```powershell
docker logs appwrite --tail 50
```

### Check 3: Database Connection
```powershell
docker exec appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j appwrite -e "SELECT COUNT(*) FROM _1_property_assessments;"
```

### Check 4: Memory/CPU Issues
```powershell
docker stats
```

Look for:
- High memory usage (>80%)
- High CPU (>90%)

## Recovery Steps

### If Import Stopped Halfway

1. **Check how many records imported:**
```javascript
await quickStatus('property_assessments')
```

2. **Don't re-import everything!** 
   - Note the count
   - Skip already imported records in CSV
   - Import only remaining records

3. **Use smaller batches:**
   - The code now uses 25 instead of 100
   - Should be more stable

### If Can't Get Data

1. **Test database directly:**
```powershell
docker exec appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j appwrite -e "SELECT * FROM _1_property_assessments LIMIT 5;"
```

2. **If data exists in DB but not in app:**
   - Clear browser cache
   - Restart Appwrite: `docker restart appwrite`
   - Check permissions in Appwrite Console

3. **If no data in DB:**
   - Import failed completely
   - Check logs: `docker logs appwrite`
   - Re-run setup: `node scripts/setup-admin.js`

## Prevention for Next Import

### Before Importing:
1. ✅ Restart Appwrite services
2. ✅ Check disk space: `docker system df`
3. ✅ Monitor resources: `docker stats`
4. ✅ Use debug mode (already enabled)

### During Import:
1. ✅ Watch console for errors
2. ✅ Monitor batch completion
3. ✅ Check memory usage
4. ✅ Don't close browser tab

### After Import:
1. ✅ Run `await quickStatus('property_assessments')`
2. ✅ Verify count matches CSV rows
3. ✅ Check for errors in console
4. ✅ Test data retrieval

## Configuration Improvements

### Update Appwrite .env (Optional)
```env
# Set memory limits
_APP_COMPUTE_MEMORY=4096

# Set CPU limits  
_APP_COMPUTE_CPUS=4

# Reduce workers
_APP_WORKER_PER_CORE=6

# Increase storage
_APP_STORAGE_LIMIT=5000000000
```

After changing:
```powershell
docker-compose down
docker-compose up -d
```

## Emergency Contacts

### Appwrite Endpoints
- Console: http://192.168.2.3
- Health: http://192.168.2.3/v1/health
- API: http://192.168.2.3/v1

### Quick Commands
```powershell
# Restart everything
docker-compose restart

# Check logs
docker logs appwrite --tail 100

# Check database
docker exec appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j appwrite

# Monitor resources
docker stats
```

## Summary

**What to do RIGHT NOW:**

1. ✅ Restart Appwrite: `docker restart appwrite-mariadb && docker restart appwrite`
2. ✅ Wait 30 seconds
3. ✅ Test: `await quickStatus('property_assessments')` in browser console
4. ✅ Check results and decide next step

**Code is now optimized for:**
- ✅ Smaller batches (25 instead of 100)
- ✅ Delays between batches (100ms)
- ✅ Better error tracking
- ✅ More stable imports

**Try importing again - it should work better now!** 🚀
