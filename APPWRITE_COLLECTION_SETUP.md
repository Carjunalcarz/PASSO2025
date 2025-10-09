# Appwrite Collection Setup for ADN Assessment

## Collection Configuration

**Collection ID:** `property_assessments`
**Collection Name:** Property Assessment Data

## Required Attributes

Create the following attributes in your Appwrite collection:

| Attribute Name | Type | Size | Required | Default | Array |
|----------------|------|------|----------|---------|-------|
| pin | string | 50 | Yes | - | No |
| name | string | 255 | Yes | - | No |
| tdn | string | 50 | Yes | - | No |
| market_val | double | - | Yes | 0 | No |
| ass_value | double | - | Yes | 0 | No |
| area | double | - | Yes | 0 | No |
| unit_value | double | - | Yes | 0 | No |
| kind | string | 100 | No | - | No |
| ass_level | double | - | Yes | 0 | No |
| classification | string | 50 | Yes | - | No |
| sub_class | string | 100 | No | - | No |
| taxability | string | 20 | Yes | - | No |
| trans_cd | string | 20 | No | - | No |
| tax_beg_yr | integer | - | Yes | 0 | No |
| eff_date | string | 20 | No | - | No |
| owner_no | string | 50 | No | - | No |
| mun_code | string | 20 | Yes | - | No |
| municipality | string | 100 | Yes | - | No |
| barangay_code | string | 20 | No | - | No |
| barangay | string | 100 | No | - | No |
| gr_code | string | 20 | No | - | No |
| gr | string | 100 | No | - | No |

## Indexes (Recommended for Performance)

Create the following indexes for better query performance:

1. **tdn_index**: Single index on `tdn` (unique)
2. **municipality_index**: Single index on `mun_code`
3. **classification_index**: Single index on `classification`
4. **taxability_index**: Single index on `taxability`
5. **composite_filter_index**: Compound index on `mun_code`, `classification`, `taxability`

## Permissions

Set the following permissions for your collection:

### Read Permissions
- Any authenticated user: `users`

### Write Permissions (Create, Update, Delete)
- Specific roles only (e.g., `role:admin`, `role:assessor`)

## Collection Rules

1. **Unique Constraint**: Ensure `tdn` values are unique
2. **Validation**: Set up validation rules for required fields
3. **Data Types**: Ensure numeric fields accept proper decimal values

## Data Migration

To migrate existing data from FastAPI:

1. Export data from your current FastAPI database
2. Transform data to match the collection schema
3. Use Appwrite's bulk import feature or create a migration script
4. Verify data integrity after import

## Environment Variables

Ensure your `.env` file contains:

```env
VITE_APPWRITE_ENDPOINT=http://192.168.2.3/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_STORAGE_ID=your-storage-id
VITE_APPWRITE_PROPERTY_ASSESSMENTS_COLLECTION_ID=property_assessments
```

## Testing

After setup:

1. Test data fetching in the ADN Assessment component
2. Verify filtering and search functionality
3. Test CRUD operations (create, update, delete)
4. Check performance with large datasets
5. Validate permissions and security

## Troubleshooting

Common issues and solutions:

- **Collection not found**: Verify collection ID matches `VITE_APPWRITE_PROPERTY_ASSESSMENTS_COLLECTION_ID` environment variable
- **Permission denied**: Check user roles and collection permissions
- **Query timeout**: Add appropriate indexes for frequently queried fields
- **Data type errors**: Ensure attribute types match the interface definition
