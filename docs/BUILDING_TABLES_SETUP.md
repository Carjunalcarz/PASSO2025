# Building Tables Setup Documentation

## Overview
This document describes the setup and structure of the three building-related tables in Appwrite:
1. **building_components** - Main building component categories
2. **building_parts** - Specific parts within each component
3. **building_part_rates** - Rate/pricing information for each part

## Database Schema

### 1. building_components
**Purpose**: Store main building component categories (e.g., Foundation, Walls, Roof, etc.)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| building_component_id | String(50) | Yes | Primary Key - Unique identifier |
| description | String(500) | No | Component description |
| status | String(50) | No | Active/Inactive status |
| uid | String(100) | No | User ID who created/modified |

**Indexes**:
- `component_id_unique` - Unique index on building_component_id
- `status_index` - Index on status for filtering

---

### 2. building_parts
**Purpose**: Store specific parts within each building component

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| building_part_id | String(50) | Yes | Primary Key - Unique identifier |
| description | String(500) | No | Part description |
| status | String(50) | No | Active/Inactive status |
| uid | String(100) | No | User ID who created/modified |
| building_component_id | String(50) | No | Foreign Key to building_components |

**Indexes**:
- `part_id_unique` - Unique index on building_part_id
- `component_fk_index` - Index on building_component_id (FK)
- `status_index` - Index on status for filtering

**Relationships**:
- Many-to-One with building_components (building_component_id)

---

### 3. building_part_rates
**Purpose**: Store pricing/rate information for each building part

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| building_part_rate_id | String(50) | Yes | Primary Key - Unique identifier |
| unit_value | Float | No | Unit price/rate value (default: 0) |
| status | String(50) | No | Active/Inactive status |
| uid | String(100) | No | User ID who created/modified |
| building_part_id | String(50) | No | Foreign Key to building_parts |

**Indexes**:
- `rate_id_unique` - Unique index on building_part_rate_id
- `part_fk_index` - Index on building_part_id (FK)
- `status_index` - Index on status for filtering

**Relationships**:
- Many-to-One with building_parts (building_part_id)

---

## Relationships Diagram

```
building_components (1) ──────< (N) building_parts (1) ──────< (N) building_part_rates
     [PK] building_component_id          [PK] building_part_id          [PK] building_part_rate_id
                                         [FK] building_component_id      [FK] building_part_id
```

## Setup Instructions

### Prerequisites
1. Node.js 18+ installed
2. Appwrite server running
3. API key with Database permissions
4. `.env` file configured with:
   ```
   VITE_APPWRITE_ENDPOINT=http://your-appwrite-server
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=your-database-id
   APPWRITE_API_KEY=your-api-key
   ```

### Running the Setup Script

**Option 1: Using npm script**
```bash
npm run setup:building
```

**Option 2: Using node directly**
```bash
node scripts/setup-building-tables.js
```

### What the Script Does
1. **Deletes existing collections** (if they exist)
2. **Creates three new collections** with proper permissions
3. **Creates all attributes** for each table
4. **Creates indexes** for performance and relationships
5. **Validates configuration** before starting

### Expected Output
```
🚀 Starting Building Tables Setup with Admin API Key...
📍 Endpoint: http://192.168.2.3
🆔 Project: your-project-id
🗄️ Database: your-database-id
🔑 API Key: Present

🏢 === SETTING UP BUILDING COMPONENTS ===
🗑️ Deleting existing collection: building_components...
🏗️ Creating collection: Building Components...
✅ Collection building_components created successfully

📝 Creating attributes...
  📝 Creating string attribute: building_component_id (50)
  ✅ Created: building_component_id
  ...

📇 Creating indexes...
  📇 Creating index: component_id_unique
  ✅ Created index: component_id_unique
  ...

✅ Building Components setup complete!

[Similar output for building_parts and building_part_rates]

🎉 ALL BUILDING TABLES SETUP COMPLETED SUCCESSFULLY!
```

## Usage Examples

### Creating a Building Component
```typescript
import { databases, ID } from './lib/appwrite';

const component = await databases.createDocument(
    DATABASE_ID,
    'building_components',
    ID.unique(),
    {
        building_component_id: 'COMP001',
        description: 'Foundation',
        status: 'Active',
        uid: currentUser.id
    }
);
```

### Creating a Building Part
```typescript
const part = await databases.createDocument(
    DATABASE_ID,
    'building_parts',
    ID.unique(),
    {
        building_part_id: 'PART001',
        description: 'Concrete Foundation',
        status: 'Active',
        uid: currentUser.id,
        building_component_id: 'COMP001' // FK to component
    }
);
```

### Creating a Building Part Rate
```typescript
const rate = await databases.createDocument(
    DATABASE_ID,
    'building_part_rates',
    ID.unique(),
    {
        building_part_rate_id: 'RATE001',
        unit_value: 1500.50,
        status: 'Active',
        uid: currentUser.id,
        building_part_id: 'PART001' // FK to part
    }
);
```

### Querying with Relationships
```typescript
import { Query } from 'appwrite';

// Get all parts for a specific component
const parts = await databases.listDocuments(
    DATABASE_ID,
    'building_parts',
    [
        Query.equal('building_component_id', 'COMP001'),
        Query.equal('status', 'Active')
    ]
);

// Get all rates for a specific part
const rates = await databases.listDocuments(
    DATABASE_ID,
    'building_part_rates',
    [
        Query.equal('building_part_id', 'PART001'),
        Query.equal('status', 'Active')
    ]
);
```

## Common Use Cases

### 1. Building Assessment Calculation
```typescript
// Get component → parts → rates hierarchy
const component = await databases.getDocument(DATABASE_ID, 'building_components', componentId);
const parts = await databases.listDocuments(DATABASE_ID, 'building_parts', [
    Query.equal('building_component_id', componentId)
]);

for (const part of parts.documents) {
    const rates = await databases.listDocuments(DATABASE_ID, 'building_part_rates', [
        Query.equal('building_part_id', part.building_part_id)
    ]);
    // Calculate total using rates
}
```

### 2. Active Items Only
```typescript
// Get only active components
const activeComponents = await databases.listDocuments(
    DATABASE_ID,
    'building_components',
    [Query.equal('status', 'Active')]
);
```

### 3. Bulk Import from CSV
```typescript
// Import building components
const components = parseCSV(componentsCsv);
for (const comp of components) {
    await databases.createDocument(
        DATABASE_ID,
        'building_components',
        ID.unique(),
        comp
    );
}
```

## Permissions
All collections are created with:
- **Read**: `read("any")` - Anyone can read
- **Write**: `write("users")` - Only authenticated users can write

## Troubleshooting

### Error: "Document with the requested ID already exists"
- The unique indexes prevent duplicate IDs
- Use different values for `building_component_id`, `building_part_id`, or `building_part_rate_id`

### Error: "Unauthorized"
- Check that your API key has Database permissions
- Verify the API key is correctly set in `.env`

### Error: "Collection not found"
- Run the setup script first: `npm run setup:building`
- Verify the database ID in `.env`

### Error: "ECONNREFUSED"
- Ensure Appwrite server is running
- Check the endpoint URL in `.env`

## Maintenance

### Re-running the Setup
The script is idempotent - it will:
1. Delete existing collections
2. Create fresh collections with current schema
3. **WARNING**: This will delete all existing data!

### Backup Before Re-running
```bash
# Export data before re-running setup
# (Use Appwrite console or API to export)
```

## Next Steps
1. Create TypeScript interfaces for type safety
2. Create service layer for CRUD operations
3. Build UI components for managing these tables
4. Add validation rules
5. Implement audit logging

## Related Files
- Setup Script: `scripts/setup-building-tables.js`
- Package Script: `package.json` → `setup:building`
- Environment: `.env`

## Support
For issues or questions:
1. Check Appwrite logs
2. Verify `.env` configuration
3. Review console output for detailed error messages
