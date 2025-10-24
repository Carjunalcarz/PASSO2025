# 🔍 Property Assessment Table Debug Guide

## Quick Start

### Method 1: Browser Console (Easiest)

1. Open your app in the browser
2. Open Developer Console (F12)
3. Run one of these commands:

```javascript
// Full comprehensive debug
await debugPropertyTable('property_assessments')

// Quick status check
await quickStatus('property_assessments')

// Debug specific municipality
await debugMunicipality('BUENAVISTA')
```

### Method 2: Import in Your Component

```typescript
import { databaseService } from '../services/databaseService';

// In your component or function
const checkTableStatus = async () => {
    await databaseService.debugTableStatus('property_assessments');
};

// Quick status
const quickCheck = async () => {
    const status = await databaseService.quickTableStatus('property_assessments');
    console.log(status); // { total, municipalities, lastImport }
};
```

## What You'll See

### Full Debug Output

```
🔍 ========== TABLE STATUS DEBUG ==========
📊 Collection ID: property_assessments
🗄️ Database ID: your_database_id
⏰ Timestamp: 2025-10-24T01:20:00.000Z

📊 Fetching total record count...
✅ Total Records: 15,234

📄 Fetching sample records (first 10)...
✅ Retrieved 10 sample records

📋 Sample Record Structure:
   - Document ID: abc123xyz
   - TDN: 2024-001-0001
   - PIN: 123-45-678-90
   - Name: Juan Dela Cruz
   - Municipality: BUENAVISTA
   - Market Value: 150000
   - Created: 2025-10-24T00:15:30.000Z
   - Updated: 2025-10-24T00:15:30.000Z

🔑 Available Fields:
   - tdn: string = 2024-001-0001
   - pin: string = 123-45-678-90
   - name: string = Juan Dela Cruz
   - municipality: string = BUENAVISTA
   - market_val: number = 150000
   - classification: string = Residential
   - taxability: string = Taxable
   ... (all other fields)

🏘️ Fetching municipality breakdown...
📊 Municipality Distribution (from 1000 records):
   - BUENAVISTA: 450 records
   - AGUSAN: 320 records
   - CABADBARAN: 230 records

🔍 Checking for duplicate TDNs (sample of 1000 records)...
⚠️ Found 15 duplicate TDNs (top 10):
   - TDN "2024-001-0001": 3 occurrences
   - TDN "2024-002-0050": 2 occurrences

📊 Data Quality (from 100 records):
   - Missing TDN: 0%
   - Missing PIN: 2%
   - Missing Name: 1%
   - Missing Municipality: 0%
   - Zero Market Value: 5%

📅 Most Recent Records (last 5):
   1. ID: xyz789
      TDN: 2024-001-9999
      Municipality: BUENAVISTA
      Created: 2025-10-24T00:20:00.000Z
   2. ID: abc456
      TDN: 2024-001-9998
      Municipality: AGUSAN
      Created: 2025-10-24T00:19:55.000Z
   ...

✅ ========== SUMMARY ==========
📊 Total Records: 15,234
🏘️ Municipalities: 12
⚠️ Duplicate TDNs: 15 (in sample)
📅 Last Import: 2025-10-24T00:20:00.000Z
✅ Table Status: ACTIVE
🔍 ========== DEBUG COMPLETE ==========
```

### Quick Status Output

```
📊 Quick Status: 15,234 records, 12 municipalities, Last: 2025-10-24T00:20:00.000Z
```

## Debug Information Provided

### 1. Total Record Count
- Total number of documents in the collection
- Formatted with thousand separators

### 2. Sample Records
- First 10 records from the table
- Shows document structure
- Lists all available fields with types and values

### 3. Municipality Breakdown
- Count of records per municipality
- Sorted by count (highest first)
- Samples first 1000 records for speed

### 4. Duplicate Detection
- Checks for duplicate TDNs
- Shows top 10 most duplicated
- Samples first 1000 records

### 5. Data Quality Check
- Missing TDN percentage
- Missing PIN percentage
- Missing Name percentage
- Missing Municipality percentage
- Zero Market Value percentage
- Based on 100 record sample

### 6. Recent Records
- Last 5 imported records
- Shows TDN, Municipality, and timestamp
- Helps verify latest imports

### 7. Summary
- Quick overview of table status
- Total records, municipalities, duplicates
- Last import timestamp
- Table status (ACTIVE/EMPTY)

## Use Cases

### Check Import Success
```javascript
// After CSV import, check if records were added
await quickStatus('property_assessments')
// Compare total with expected count
```

### Verify Data Quality
```javascript
// Run full debug to check for issues
await debugPropertyTable('property_assessments')
// Review data quality section for missing fields
```

### Find Duplicates
```javascript
// Check for duplicate TDNs
await debugPropertyTable('property_assessments')
// Look for "Found X duplicate TDNs" section
```

### Check Municipality Distribution
```javascript
// See which municipalities have data
await debugPropertyTable('property_assessments')
// Review municipality breakdown section
```

### Verify Latest Import
```javascript
// Check when last import happened
const status = await quickStatus('property_assessments')
console.log('Last import:', status.lastImport)
```

## Error Handling

### Collection Not Found (404)
```
❌ Collection not found. Possible issues:
   - Collection ID "property_assessments" doesn't exist
   - Database ID is incorrect
   - Collection was deleted
```

**Solution**: Verify collection ID and run setup script

### Authentication Error (401)
```
❌ Authentication error. Check:
   - Appwrite session is valid
   - User has read permissions
```

**Solution**: Login again or check user permissions

### Network Error
```
❌ Network error. Check:
   - Appwrite server is running
   - Network connection is stable
```

**Solution**: Verify Appwrite server is accessible

## Tips

1. **Run After Import**: Always run debug after CSV import to verify success
2. **Check Duplicates**: Review duplicate section if you see unexpected counts
3. **Monitor Quality**: Watch data quality percentages to catch import issues
4. **Quick Checks**: Use `quickStatus()` for fast verification
5. **Save Logs**: Right-click console → "Save as..." to export debug output

## Integration Examples

### In React Component
```typescript
import { databaseService } from '../services/databaseService';

const MyComponent = () => {
    const handleDebug = async () => {
        try {
            await databaseService.debugTableStatus('property_assessments');
        } catch (error) {
            console.error('Debug failed:', error);
        }
    };

    return (
        <button onClick={handleDebug}>
            Debug Table Status
        </button>
    );
};
```

### After Import
```typescript
const handleImport = async () => {
    // ... import logic ...
    
    // Check status after import
    const status = await databaseService.quickTableStatus('property_assessments');
    console.log(`Import complete! Total records: ${status.total}`);
};
```

### Scheduled Check
```typescript
// Check table status every hour
setInterval(async () => {
    const status = await databaseService.quickTableStatus('property_assessments');
    console.log('Hourly check:', status);
}, 3600000);
```
