# Building Tables Setup - Quick Start Guide

## 🚀 Quick Setup

Run this command to create all three building tables in Appwrite:

```bash
npm run setup:building
```

Or directly:

```bash
node scripts/setup-building-tables.js
```

## 📊 Tables Created

### 1. building_components
- **building_component_id** (PK) - Unique identifier
- **description** - Component description
- **status** - Active/Inactive
- **uid** - User ID

### 2. building_parts
- **building_part_id** (PK) - Unique identifier
- **description** - Part description
- **status** - Active/Inactive
- **uid** - User ID
- **building_component_id** (FK) - Links to building_components

### 3. building_part_rates
- **building_part_rate_id** (PK) - Unique identifier
- **unit_value** - Price/rate value
- **status** - Active/Inactive
- **uid** - User ID
- **building_part_id** (FK) - Links to building_parts

## 🔗 Relationships

```
building_components (1) ──> (N) building_parts (1) ──> (N) building_part_rates
```

## 📝 Usage in Code

```typescript
import buildingService from '@/services/buildingService';

// Create a component
const component = await buildingService.createComponent({
    building_component_id: 'COMP001',
    description: 'Foundation',
    status: 'Active',
    uid: currentUser.id
});

// Create a part
const part = await buildingService.createPart({
    building_part_id: 'PART001',
    description: 'Concrete Foundation',
    status: 'Active',
    uid: currentUser.id,
    building_component_id: 'COMP001'
});

// Create a rate
const rate = await buildingService.createRate({
    building_part_rate_id: 'RATE001',
    unit_value: 1500.50,
    status: 'Active',
    uid: currentUser.id,
    building_part_id: 'PART001'
});

// Get complete hierarchy
const hierarchy = await buildingService.getComponentHierarchy('COMP001');
```

## 📚 Documentation

See full documentation: `docs/BUILDING_TABLES_SETUP.md`

## ⚙️ Prerequisites

1. Node.js 18+
2. Appwrite server running
3. API key in `.env`:
   ```
   APPWRITE_API_KEY=your-api-key-here
   ```

## ✅ What the Script Does

1. ✅ Deletes existing collections (if any)
2. ✅ Creates three new collections
3. ✅ Creates all attributes
4. ✅ Creates indexes for performance
5. ✅ Sets up foreign key relationships

## 🎯 Files Created

- `scripts/setup-building-tables.js` - Setup script
- `src/services/buildingService.ts` - TypeScript service
- `docs/BUILDING_TABLES_SETUP.md` - Full documentation
- `package.json` - Added `setup:building` script
