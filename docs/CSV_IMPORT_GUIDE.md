# CSV Import Guide for Property Assessments

## Overview
The CSV import feature allows you to bulk import property assessment records into the Appwrite database. This feature supports both creating new records and updating existing ones based on TDN (Tax Declaration Number).

## Features
- ✅ **File Validation**: Validates CSV format and required fields
- ✅ **Data Preview**: Shows first 10 rows with validation status
- ✅ **Progress Tracking**: Real-time import progress with success/failure counts
- ✅ **Error Handling**: Detailed error messages for failed imports
- ✅ **Duplicate Handling**: Automatically updates existing records or creates new ones
- ✅ **Batch Processing**: Processes records in small batches to avoid API limits
- ✅ **Template Download**: Provides a sample CSV template

## CSV Format Requirements

### Required Columns
- `tdn` - Tax Declaration Number (unique identifier)
- `pin` - Property Identification Number

### Optional Columns
All other fields are optional but recommended for complete records:

| Column | Description | Data Type | Example |
|--------|-------------|-----------|---------|
| `tdn` | Tax Declaration Number | String | 001-001-001 |
| `pin` | Property Identification Number | String | 001-001-001-001 |
| `name` | Property Owner Name | String | JUAN DELA CRUZ |
| `market_val` | Market Value | Number | 500000 |
| `ass_value` | Assessment Value | Number | 100000 |
| `area` | Property Area (sqm) | Number | 100 |
| `unit_value` | Unit Value | Number | 5000 |
| `kind` | Property Kind | String | LAND |
| `ass_level` | Assessment Level | Number | 20 |
| `classification` | Property Classification | String | RESIDENTIAL |
| `sub_class` | Sub Classification | String | RESIDENTIAL LOT |
| `taxability` | Taxability Status | String | Taxable/Exempt |
| `trans_cd` | Transaction Code | String | NEW |
| `tax_beg_yr` | Tax Begin Year | Number | 2025 |
| `eff_date` | Effective Date | String | 2025-01-01 |
| `owner_no` | Owner Number | String | 12345 |
| `mun_code` | Municipality Code | String | 001 |
| `municipality` | Municipality Name | String | BUTUAN CITY |
| `barangay_code` | Barangay Code | String | 001 |
| `barangay` | Barangay Name | String | BARANGAY 1 |
| `gr_code` | GR Code | String | 001 |
| `gr` | GR Name | String | GR 1 |

### Column Name Flexibility
The system supports multiple column name variations:
- `market_val` or `market_value`
- `ass_value` or `assessment_value`
- `sub_class` or `subclass`
- `trans_cd` or `transaction_code`
- `tax_beg_yr` or `tax_begin_year`
- `eff_date` or `effective_date`
- `owner_no` or `owner_number`
- `mun_code` or `municipality_code`

## How to Use

### Step 1: Prepare Your CSV File
1. Download the CSV template from the import dialog
2. Fill in your property assessment data
3. Ensure required fields (TDN, PIN) are present
4. Save as CSV format

### Step 2: Import Process
1. Click the "Import CSV" button in the ADN Assessment page
2. Select your CSV file
3. Review the preview showing first 10 rows
4. Check validation status for each row
5. Click "Import X Records" to start the process
6. Monitor the progress bar and statistics

### Step 3: Review Results
- Check the success/failure counts
- Review any error messages
- The data table will automatically refresh after import

## Data Validation Rules

### Required Field Validation
- **TDN**: Must be present and not empty
- **PIN**: Must be present and not empty

### Data Type Validation
- Numeric fields are automatically converted from strings
- Invalid numbers will generate validation errors
- Empty numeric fields are treated as 0 or null

### Duplicate Handling
- Records with existing TDN will be **updated**
- Records with new TDN will be **created**
- No duplicate records are created

## Performance Considerations

### Batch Processing
- Records are processed in batches of 5 to avoid API rate limits
- Small delay between batches ensures system stability
- Progress is updated after each batch

### Recommended Limits
- **Small files**: Up to 100 records - Very fast
- **Medium files**: 100-1000 records - Takes a few minutes
- **Large files**: 1000+ records - May take 10+ minutes

## Error Handling

### Common Errors
1. **Missing Required Fields**: TDN or PIN not provided
2. **Invalid Data Types**: Non-numeric values in number fields
3. **Appwrite API Errors**: Network or permission issues
4. **Duplicate TDN in CSV**: Multiple rows with same TDN

### Error Resolution
- Check the error list in the import dialog
- Fix issues in your CSV file
- Re-import the corrected file
- Failed records can be imported separately

## Best Practices

### Data Preparation
1. **Clean Data**: Remove extra spaces, special characters
2. **Consistent Format**: Use consistent date formats (YYYY-MM-DD)
3. **Validate Numbers**: Ensure numeric fields contain valid numbers
4. **Unique TDNs**: Each row should have a unique TDN

### Import Strategy
1. **Test First**: Import a small sample to verify format
2. **Backup**: Ensure you have backups before large imports
3. **Monitor**: Watch the progress and error messages
4. **Verify**: Check the imported data in the table

### Troubleshooting
1. **File Format**: Ensure file is saved as CSV, not Excel
2. **Encoding**: Use UTF-8 encoding for special characters
3. **Permissions**: Ensure user has write access to the collection
4. **Network**: Stable internet connection for large imports

## Sample CSV Template

```csv
tdn,pin,name,market_val,ass_value,area,unit_value,kind,ass_level,classification,sub_class,taxability,trans_cd,tax_beg_yr,eff_date,owner_no,mun_code,municipality,barangay_code,barangay,gr_code,gr
001-001-001,001-001-001-001,JUAN DELA CRUZ,500000,100000,100,5000,LAND,20,RESIDENTIAL,RESIDENTIAL LOT,Taxable,NEW,2025,2025-01-01,12345,001,BUTUAN CITY,001,BARANGAY 1,001,GR 1
001-001-002,001-001-002-001,MARIA SANTOS,750000,150000,150,5000,LAND,20,RESIDENTIAL,RESIDENTIAL LOT,Taxable,NEW,2025,2025-01-01,12346,001,BUTUAN CITY,001,BARANGAY 1,001,GR 1
```

## Technical Implementation

### Components
- **CSVImport.tsx**: Main import component with UI
- **DatabaseService.ts**: Bulk import methods
- **ADN_Assessment.tsx**: Integration point

### Key Features
- Real-time progress tracking
- Batch processing with rate limiting
- Comprehensive error handling
- Data validation and preview
- Automatic duplicate detection

### Appwrite Integration
- Uses existing authentication
- Leverages collection permissions
- Handles API rate limits
- Provides detailed error logging

## Support

For technical issues or questions about the CSV import feature:
1. Check the error messages in the import dialog
2. Verify your CSV format against the template
3. Ensure proper Appwrite permissions
4. Contact system administrator for collection access issues
