# 🔧 Appwrite Import & Data Retrieval Issues - Troubleshooting

## Problem Analysis

Based on your configuration, here are potential issues:

### 1. Resource Limits
```env
_APP_COMPUTE_CPUS=0          # ⚠️ No CPU limit (can cause issues)
_APP_COMPUTE_MEMORY=0        # ⚠️ No memory limit (can cause issues)
_APP_STORAGE_LIMIT=300000000 # 300MB storage limit
```

### 2. Worker Configuration
```env
_APP_WORKER_PER_CORE=12      # High worker count
_APP_WORKERS_NUM=             # Not set (uses default)
```

### 3. Database Configuration
```env
_APP_DB_HOST=appwrite-mariadb
_APP_DB_PORT=3306
_APP_DB_SCHEMA=appwrite
```

### 4. Abuse Protection
```env
_APP_OPTIONS_ABUSE=disabled   # ✅ Good for imports
```

## Common Causes & Solutions

### Issue 1: Database Connection Lost

**Symptoms:**
- Import stops mid-way
- Can't retrieve data
- Network errors in console

**Check:**
```bash
# Test MariaDB connection
docker exec -it appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -p appwrite

# Check if database is running
docker ps | grep mariadb
```

**Solution:**
```bash
# Restart MariaDB
docker restart appwrite-mariadb

# Restart Appwrite
docker restart appwrite
```

### Issue 2: Storage Limit Reached

**Symptoms:**
- Import stops at specific count
- "Storage limit exceeded" errors

**Check:**
```bash
# Check storage usage
docker exec appwrite-mariadb du -sh /var/lib/mysql
```

**Solution:**
Increase storage limit in your Appwrite .env:
```env
_APP_STORAGE_LIMIT=1000000000  # Increase to 1GB
```

### Issue 3: Memory Exhaustion

**Symptoms:**
- Import slows down over time
- Browser becomes unresponsive
- Appwrite container crashes

**Check:**
```bash
# Check Appwrite container memory
docker stats appwrite

# Check MariaDB memory
docker stats appwrite-mariadb
```

**Solution:**
Set memory limits in docker-compose.yml:
```yaml
services:
  appwrite:
    mem_limit: 2g
  appwrite-mariadb:
    mem_limit: 1g
```

### Issue 4: Too Many Concurrent Connections

**Symptoms:**
- "Too many connections" error
- Import fails after certain records
- Random connection timeouts

**Check:**
```bash
# Check MariaDB max connections
docker exec appwrite-mariadb mysql -u root -p -e "SHOW VARIABLES LIKE 'max_connections';"
```

**Solution:**
Increase MariaDB max connections:
```bash
# Edit MariaDB config
docker exec appwrite-mariadb bash -c "echo 'max_connections=500' >> /etc/mysql/my.cnf"

# Restart MariaDB
docker restart appwrite-mariadb
```

### Issue 5: Request Timeout

**Symptoms:**
- Import stops at same batch
- Timeout errors in console
- No response from server

**Check:**
Your current timeout settings:
```env
_APP_FUNCTIONS_TIMEOUT=900        # 15 minutes
_APP_COMPUTE_BUILD_TIMEOUT=900    # 15 minutes
```

**Solution:**
These are already high. Issue is likely elsewhere.

### Issue 6: Network Issues

**Symptoms:**
- Intermittent failures
- "Network error" in console
- Can't reach Appwrite server

**Check:**
```bash
# Test Appwrite connectivity
curl http://192.168.2.3/v1/health

# Check if port is accessible
telnet 192.168.2.3 80
```

**Solution:**
```bash
# Restart network
docker network ls
docker network inspect appwrite

# Restart Appwrite stack
docker-compose down
docker-compose up -d
```

## Diagnostic Steps

### Step 1: Check Appwrite Health
```bash
# Check all containers
docker ps

# Check Appwrite logs
docker logs appwrite --tail 100

# Check MariaDB logs
docker logs appwrite-mariadb --tail 100

# Check executor logs
docker logs appwrite-executor --tail 100
```

### Step 2: Test Database Connection
```bash
# Connect to MariaDB
docker exec -it appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j appwrite

# Check tables
SHOW TABLES;

# Check property_assessments collection
SELECT COUNT(*) FROM _1_property_assessments;

# Check recent records
SELECT * FROM _1_property_assessments ORDER BY _createdAt DESC LIMIT 5;
```

### Step 3: Check Resource Usage
```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check Docker resources
docker stats
```

### Step 4: Run Debug Commands

In browser console:
```javascript
// Quick status check
await quickStatus('property_assessments')

// Full debug
await debugTable('property_assessments')
```

## Quick Fixes

### Fix 1: Restart Everything
```bash
cd /path/to/appwrite
docker-compose down
docker-compose up -d

# Wait 30 seconds
sleep 30

# Check status
docker ps
```

### Fix 2: Clear Cache
```bash
# Clear Redis cache
docker exec appwrite-redis redis-cli FLUSHALL

# Restart Appwrite
docker restart appwrite
```

### Fix 3: Optimize Database
```bash
# Connect to MariaDB
docker exec -it appwrite-mariadb mysql -u root -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j appwrite

# Optimize tables
OPTIMIZE TABLE _1_property_assessments;

# Analyze tables
ANALYZE TABLE _1_property_assessments;
```

### Fix 4: Reduce Import Batch Size

In your code, reduce batch size:
```typescript
const HYPER_BATCH_SIZE = 25;  // Reduce from 100
const BATCH_DELAY = 100;      // Add delay
```

### Fix 5: Check Collection Permissions
```bash
# In Appwrite Console
# Go to Database → property_assessments → Settings → Permissions
# Ensure: read("any"), write("users")
```

## Prevention

### 1. Monitor Resources
```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
    echo "=== $(date) ==="
    docker stats --no-stream
    echo ""
    sleep 60
done
EOF

chmod +x monitor.sh
./monitor.sh > monitor.log &
```

### 2. Set Proper Limits
Update your .env:
```env
_APP_COMPUTE_CPUS=4
_APP_COMPUTE_MEMORY=4096
_APP_STORAGE_LIMIT=5000000000  # 5GB
_APP_WORKER_PER_CORE=6         # Reduce from 12
```

### 3. Regular Maintenance
```bash
# Weekly optimization
docker exec appwrite-mariadb mysql -u root -p appwrite -e "OPTIMIZE TABLE _1_property_assessments;"

# Clear old logs
docker system prune -f
```

### 4. Use Smaller Import Batches
```typescript
// In hyperFastImport
const HYPER_BATCH_SIZE = 50;   // More stable
const BATCH_DELAY = 50;        // Small delay
const BATCH_TIMEOUT = 300000;  // 5 minute timeout
```

## Emergency Recovery

If nothing works:

### 1. Export Data (if accessible)
```javascript
// In browser console
const allData = await databaseService.getAssessments('property_assessments', 100000);
console.log('Exported:', allData.length);
// Copy from console
```

### 2. Recreate Collection
```bash
# Run setup script
node scripts/setup-admin.js
```

### 3. Re-import Data
Use smaller batches and add delays.

## Contact Points

### Check Appwrite Status
- Appwrite Console: http://192.168.2.3
- Health Check: http://192.168.2.3/v1/health
- Realtime: http://192.168.2.3/v1/realtime

### Logs Location
```bash
# Appwrite logs
docker logs appwrite

# MariaDB logs
docker logs appwrite-mariadb

# All logs
docker-compose logs
```

## Next Steps

1. **Check Appwrite is running**: `docker ps | grep appwrite`
2. **Test database connection**: Run MariaDB commands above
3. **Check resource usage**: `docker stats`
4. **Run debug command**: `await quickStatus('property_assessments')`
5. **Review logs**: `docker logs appwrite --tail 100`
6. **Restart if needed**: `docker-compose restart`
