# 🔍 Import Debug Guide

## Enhanced Debug Mode

The `hyperFastImport` method now includes comprehensive debugging to identify why imports stop.

## What You'll See in Console

### 1. Batch Start Information
```
🚀 ========== BATCH 1/90 START ==========
📊 Batch Info:
   - Records in batch: 100
   - Start index: 0
   - End index: 99
   - Time: 2025-10-24T00:52:00.000Z
   - Progress: 0 successful, 0 failed so far
```

### 2. Individual Record Tracking
```
⚡ Firing 100 parallel requests...
   🔄 [0] Starting: record-0
   ✅ [0] Success: record-0 -> 67890abc123
   🔄 [1] Starting: record-1
   ❌ [1] Failed: record-1 { code: 500, type: 'server_error', message: '...' }
```

### 3. Batch Completion Summary
```
✅ ========== BATCH 1/90 COMPLETE ==========
📊 Batch Results:
   ✅ Successful: 98
   ❌ Failed: 2
   ⏱️ Duration: 3500ms
   📈 Total Progress: 98/9000 (1%)
   ⏱️ Total Time: 4s
   🚀 Speed: 24 records/sec
💾 Memory: 45MB / 128MB
```

### 4. Error Detection
```
🚨 CRITICAL: Entire batch 20 failed! Stopping import.
🚨 Last 5 errors:
   - [1900] record-1900: Network error
   - [1901] record-1901: Connection timeout
```

### 5. Timeout Detection
```
🚨 ========== BATCH 25 ERROR ==========
❌ Error Type: Error
❌ Error Message: BATCH 25 TIMEOUT after 120000ms
⏰ Batch timed out - this batch may still be processing in background
```

### 6. Final Summary
```
⚡ ========== IMPORT COMPLETE ==========
📊 Final Results:
   ✅ Successful: 8500
   ❌ Failed: 500
   📊 Total: 9000
   ⏱️ Total Time: 180s
   🚀 Average Speed: 47 records/sec
   📋 Error Count: 500

❌ First 10 errors:
   1. [100] record-100: Document validation failed
   2. [250] record-250: Network timeout
   ...
```

## What to Look For

### Import Stops Completely
**Check for:**
- `🚨 CRITICAL: Entire batch X failed!` - All records in a batch failed
- `🛑 Fatal error - stopping import` - Unrecoverable error occurred
- `BATCH X TIMEOUT` - Batch took longer than 2 minutes

**Common Causes:**
- Network connection lost
- Appwrite server down
- Rate limiting (too many requests)
- Memory exhaustion

### Import Slows Down
**Check for:**
- Increasing batch duration times
- Memory usage growing (💾 Memory: X MB)
- Failed records increasing

**Common Causes:**
- Server under load
- Network congestion
- Memory pressure

### Specific Records Failing
**Check for:**
- Error codes in failed records (code: 400, 500, etc.)
- Error types (validation_error, server_error, etc.)
- Patterns in failed record IDs

**Common Causes:**
- Invalid data in specific records
- Missing required fields
- Data type mismatches

## Debug Features

### 1. Timeout Protection
- Each batch has 2-minute timeout
- Prevents silent hangs
- Logs timeout errors clearly

### 2. Individual Record Tracking
- Every record logged with index
- Success/failure tracked per record
- Error details captured

### 3. Performance Metrics
- Batch duration tracking
- Overall speed calculation
- Progress percentage
- Memory monitoring

### 4. Error Categorization
- Network errors
- Validation errors
- Server errors
- Timeout errors

### 5. Critical Error Detection
- Stops import if entire batch fails
- Prevents wasting time on broken imports
- Shows last errors for diagnosis

## Troubleshooting Steps

### If Import Stops at Same Batch
1. Check the batch number where it stops
2. Look at the start index of that batch
3. Examine records at that index in your CSV
4. Check for data issues in those specific records

### If Random Timeouts
1. Check network stability
2. Verify Appwrite server is responsive
3. Consider reducing batch size from 100 to 50
4. Add small delay between batches (e.g., 100ms)

### If Many Validation Errors
1. Review error messages for patterns
2. Check CSV data format
3. Verify required fields are present
4. Validate data types match schema

### If Memory Issues
1. Watch memory usage in console
2. If growing continuously, reduce batch size
3. Consider processing in smaller chunks
4. Clear browser cache and restart

## Adjusting Performance

### Reduce Batch Size
```typescript
const HYPER_BATCH_SIZE = 50; // Reduce from 100
```

### Add Delay Between Batches
```typescript
const BATCH_DELAY = 100; // Add 100ms delay
```

### Increase Timeout
```typescript
const BATCH_TIMEOUT = 300000; // Increase to 5 minutes
```

## Console Commands

### Filter for Errors Only
In browser console:
```javascript
// Show only error messages
console.log = () => {}; // Suppress regular logs
// Errors will still show
```

### Export Console Logs
Right-click in console → "Save as..." to export all logs for analysis

## Next Steps After Debug

1. **Identify the pattern** - What batch/record number stops?
2. **Check the data** - Examine CSV rows at that position
3. **Review errors** - Look for common error codes/types
4. **Adjust settings** - Reduce batch size or add delays if needed
5. **Test again** - Run import with adjustments

## Success Indicators

✅ All batches complete
✅ Consistent batch durations
✅ Low failure rate (<5%)
✅ Stable memory usage
✅ No timeouts
✅ Final count matches CSV rows
