# 🔍 Quick Debug Reference Card

## Browser Console Commands

### 1. Full Table Debug
```javascript
await debugTable('property_assessments')
```
**Shows:**
- ✅ Total record count
- 📋 Sample record structure
- 🏘️ Municipality breakdown
- ⚠️ Duplicate TDNs
- 📊 Data quality metrics
- 📅 Recent records
- ✅ Summary

### 2. Quick Status Check
```javascript
await quickStatus('property_assessments')
```
**Shows:**
- Total records
- Number of municipalities
- Last import timestamp

### 3. Check Different Collection
```javascript
await debugTable('your_collection_id')
await quickStatus('your_collection_id')
```

## Expected Output Examples

### Quick Status
```
📊 Quick Status: 15,234 records, 12 municipalities, Last: 2025-10-24T00:20:00.000Z
```

### Full Debug Summary
```
✅ ========== SUMMARY ==========
📊 Total Records: 15,234
🏘️ Municipalities: 12
⚠️ Duplicate TDNs: 15 (in sample)
📅 Last Import: 2025-10-24T00:20:00.000Z
✅ Table Status: ACTIVE
```

## Common Checks

### After CSV Import
```javascript
// Check if import succeeded
await quickStatus('property_assessments')
// Compare total with expected count
```

### Find Import Issues
```javascript
// Run full debug to see data quality
await debugTable('property_assessments')
// Look for:
// - Missing fields percentage
// - Duplicate TDNs
// - Municipality distribution
```

### Verify Specific Municipality
```javascript
// Check records for specific municipality
await debugTable('property_assessments')
// Review municipality breakdown section
```

## Troubleshooting

### No Output
- Check browser console is open (F12)
- Verify you're logged in to the app
- Check network connection

### Error: Collection Not Found
- Verify collection ID is correct
- Run setup script to create collection
- Check database ID in .env

### Error: Authentication Failed
- Login to the application
- Check user has read permissions
- Verify Appwrite session is active

## Tips

1. **Open Console First**: Press F12 before running commands
2. **Copy Output**: Right-click console → "Save as..." to export
3. **Run After Import**: Always check status after CSV import
4. **Compare Counts**: Match total records with CSV row count
5. **Check Quality**: Review missing field percentages

## Quick Checklist

After CSV Import:
- [ ] Run `await quickStatus('property_assessments')`
- [ ] Verify total count matches CSV rows
- [ ] Check last import timestamp is recent
- [ ] Run full debug if count doesn't match
- [ ] Review error section for issues

## Access Anywhere

These commands are available globally in your browser console as soon as the app loads. No need to import anything!

Just open console (F12) and type the commands.
