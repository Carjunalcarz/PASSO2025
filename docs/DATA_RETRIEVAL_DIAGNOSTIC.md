# 🔧 Data Retrieval Diagnostic Guide

## Problem: Can't Get Data from Property Assessment Table

This diagnostic tool will tell you **exactly why** you can't retrieve data.

## How to Use

### Step 1: Open Browser Console
Press **F12** in your browser

### Step 2: Run Diagnostic
```javascript
await diagnoseDataIssue('property_assessments')
```

### Step 3: Read the Results
The diagnostic will run **8 comprehensive tests** and tell you exactly what's wrong.

## What It Tests

### Test 1: Appwrite Connection ✅
**Checks:** Can we connect to Appwrite server?

**Possible Issues:**
- ❌ Collection doesn't exist → Run `node scripts/setup-admin.js`
- ❌ Not authenticated → Login to the app
- ❌ Network error → Check if Appwrite is running

### Test 2: Record Count 📊
**Checks:** How many records are in the table?

**Possible Issues:**
- ⚠️ Table is EMPTY → Import CSV data first
- ✅ Table has data → Continue to next test

### Test 3: Fetch Sample Records 📄
**Checks:** Can we actually retrieve records?

**Possible Issues:**
- ❌ Cannot fetch → Permission or query issue
- ✅ Fetched successfully → Shows sample record

### Test 4: Permissions 🔐
**Checks:** Do you have permission to read?

**Possible Issues:**
- ❌ Permission denied → Check Appwrite Console permissions
- ✅ Permission OK → Can read from collection

### Test 5: Configuration ⚙️
**Checks:** Are database IDs correct?

**Shows:**
- Database ID
- Collection ID
- Appwrite endpoint
- Project ID

### Test 6: Query Methods 🔍
**Checks:** Do different query types work?

**Tests:**
- No-query fetch
- With limit query
- With offset query

### Test 7: Browser Environment 🌐
**Checks:** Is browser online?

**Possible Issues:**
- ❌ Browser offline → Check internet connection
- ✅ Browser online → Network is working

### Test 8: Authentication 👤
**Checks:** Are you logged in?

**Possible Issues:**
- ❌ Not authenticated → Login to the app
- ✅ User authenticated → Shows user details

## Example Output

### Successful Diagnostic
```
🔍 ========== DATA RETRIEVAL DIAGNOSTIC ==========
📊 Collection ID: property_assessments
🗄️ Database ID: your_database_id
⏰ Timestamp: 2025-10-24T01:31:00.000Z

🔌 TEST 1: Checking Appwrite connection...
✅ Appwrite connection successful
   Response status: OK
   Database ID: your_database_id
   Collection ID: property_assessments

📊 TEST 2: Checking total record count...
✅ Total records: 15,234
   Status: Table has data

📄 TEST 3: Attempting to fetch sample records...
✅ Successfully fetched 5 records
   Sample record ID: abc123
   TDN: 2024-001-0001
   Municipality: BUENAVISTA
   Created: 2025-10-24T00:15:30.000Z

🔐 TEST 4: Checking permissions...
✅ Read permission: OK
   User can read from collection

⚙️ TEST 5: Checking configuration...
   Database ID: your_database_id
   Collection ID: property_assessments
   Appwrite Endpoint: http://192.168.2.3/v1
   Project ID: your_project_id

🔍 TEST 6: Testing different query methods...
✅ No-query fetch: 25 records
✅ With limit query: 10 records
✅ With offset query: 5 records

🌐 TEST 7: Checking browser environment...
✅ Running in browser
   User Agent: Mozilla/5.0...
   Online: Yes
   Network: Connected

👤 TEST 8: Checking authentication...
✅ User authenticated
   User ID: user123
   Email: admin@example.com
   Name: Admin User

📋 ========== DIAGNOSTIC SUMMARY ==========

✅ NO ISSUES FOUND!
   Everything appears to be working correctly.
   If you still can't see data, check your UI component.

💡 RECOMMENDED ACTIONS:

   ✅ No action needed - system is working!

🔍 ========== DIAGNOSTIC COMPLETE ==========
```

### Failed Diagnostic (Example Issues)

```
🔍 ========== DATA RETRIEVAL DIAGNOSTIC ==========

🔌 TEST 1: Checking Appwrite connection...
❌ Appwrite connection FAILED!
   Error: Collection not found
   Code: 404
   Type: collection_not_found

💡 SOLUTION: Run setup script to create collection
   Command: node scripts/setup-admin.js

📋 ========== DIAGNOSTIC SUMMARY ==========

❌ CRITICAL ISSUES FOUND (3):

   1. Collection "property_assessments" does not exist
   2. Table is EMPTY - no records found
   3. User not logged in or session expired

💡 RECOMMENDED ACTIONS:

   1. Create collection: node scripts/setup-admin.js
   2. Import CSV data through the UI
   3. Login to the application

🔍 ========== DIAGNOSTIC COMPLETE ==========
```

## Common Issues & Solutions

### Issue 1: Collection Not Found (404)
```
❌ Collection "property_assessments" does not exist
```

**Solution:**
```bash
node scripts/setup-admin.js
```

### Issue 2: Table is Empty
```
⚠️ WARNING: Table has 0 records!
```

**Solution:**
1. Login to your app
2. Go to CSV Import
3. Import your CSV file

### Issue 3: Not Authenticated (401)
```
❌ Not authenticated or session expired
```

**Solution:**
1. Login to the application
2. Run diagnostic again

### Issue 4: Network Error
```
❌ Network error - cannot reach Appwrite server
```

**Solution:**
```bash
# Check if Appwrite is running
docker ps | grep appwrite

# Restart if needed
docker restart appwrite-mariadb
docker restart appwrite
```

### Issue 5: Permission Denied (403)
```
❌ Permission denied!
```

**Solution:**
1. Open Appwrite Console: http://192.168.2.3
2. Go to Database → property_assessments → Settings → Permissions
3. Add: `read("any")` or `read("users")`

### Issue 6: Browser Offline
```
❌ Browser is OFFLINE!
```

**Solution:**
Check your internet connection

## Quick Commands Reference

### Run Full Diagnostic
```javascript
await diagnoseDataIssue('property_assessments')
```

### Quick Status Check
```javascript
await quickStatus('property_assessments')
```

### Full Table Debug
```javascript
await debugTable('property_assessments')
```

### Check Different Collection
```javascript
await diagnoseDataIssue('your_collection_id')
```

## Interpreting Results

### All Tests Pass ✅
- System is working correctly
- Issue might be in your UI component
- Check React component code

### Some Tests Fail ❌
- Follow the recommended actions
- Fix issues in order listed
- Re-run diagnostic after each fix

### All Tests Fail ❌
- Appwrite server likely not running
- Run: `docker ps | grep appwrite`
- Restart: `docker restart appwrite`

## Step-by-Step Troubleshooting

### If Diagnostic Shows "Collection Not Found"
1. Run: `node scripts/setup-admin.js`
2. Wait for completion
3. Run diagnostic again
4. Should now show "Table is EMPTY"
5. Import CSV data

### If Diagnostic Shows "Table is Empty"
1. Login to your app
2. Navigate to CSV Import page
3. Select your CSV file
4. Click Import
5. Wait for completion
6. Run diagnostic again
7. Should now show record count

### If Diagnostic Shows "Not Authenticated"
1. Go to login page
2. Enter credentials
3. Login
4. Run diagnostic again
5. Should now show user details

### If Diagnostic Shows "Network Error"
1. Check Appwrite status: `docker ps`
2. If not running: `docker-compose up -d`
3. If running: `docker restart appwrite`
4. Wait 30 seconds
5. Run diagnostic again

## Advanced Usage

### Save Diagnostic Output
```javascript
// Run diagnostic and save to variable
const result = await diagnoseDataIssue('property_assessments')

// Right-click console → "Save as..." to export logs
```

### Run Multiple Diagnostics
```javascript
// Check multiple collections
await diagnoseDataIssue('property_assessments')
await diagnoseDataIssue('building_assessments')
```

### Automated Monitoring
```javascript
// Check every 5 minutes
setInterval(async () => {
    console.log('=== Scheduled Check ===')
    await quickStatus('property_assessments')
}, 300000)
```

## Tips

1. **Run After Every Import** - Verify data was imported
2. **Run After Errors** - Identify root cause quickly
3. **Save Output** - Keep logs for troubleshooting
4. **Check Regularly** - Monitor system health
5. **Share Results** - Easy to share diagnostic output

## When to Use Each Tool

### Use `diagnoseDataIssue()` When:
- ❌ Can't see any data in UI
- ❌ Getting errors when fetching data
- ❌ Import completed but no data shows
- ❌ Need to identify root cause

### Use `quickStatus()` When:
- ✅ Just want to check record count
- ✅ Verify import succeeded
- ✅ Quick health check
- ✅ Monitor data growth

### Use `debugTable()` When:
- ✅ Need detailed table analysis
- ✅ Check for duplicates
- ✅ Review data quality
- ✅ See municipality breakdown

## Summary

**Problem:** Can't get data from property_assessments

**Solution:** Run diagnostic to find out why
```javascript
await diagnoseDataIssue('property_assessments')
```

**Result:** Get exact issue and solution in console!

The diagnostic will tell you:
- ✅ What's working
- ❌ What's broken
- 💡 How to fix it

**No more guessing - know exactly what's wrong!** 🎯
