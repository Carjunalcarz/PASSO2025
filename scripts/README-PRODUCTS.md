# Products Table Setup

## Schema

```
products
├── product_id (PK) - Auto-generated as $id
├── name (string, required, 500 chars)
├── description (string, optional, 2000 chars)
└── status (string, optional, 50 chars)
```

## Auto-Generated Fields
- `$id` - Primary Key (product_id)
- `$createdAt` - Timestamp
- `$updatedAt` - Timestamp

## Setup Instructions

### 1. Ensure API Key is Set
Add to your `.env` file:
```env
APPWRITE_API_KEY=your_admin_api_key_here
```

### 2. Run Setup Script
```bash
npm run setup:products
```

### 3. Add Collection ID to .env
After successful setup, add:
```env
VITE_APPWRITE_PRODUCTS_COLLECTION_ID=products
```

## What the Script Does

1. ✅ Deletes existing `products` collection (if exists)
2. ✅ Creates new `products` collection
3. ✅ Creates attributes:
   - `name` (string, required)
   - `description` (string, optional)
   - `status` (string, optional)
4. ✅ Creates indexes:
   - `name_index` (for searching by name)
   - `status_index` (for filtering by status)

## Usage in Code

### Service Layer Example
```typescript
// src/pages/setup/services/products.ts
import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products';

export interface ProductData {
    name: string;
    description?: string;
    status?: string;
}

export const createProduct = async (data: ProductData) => {
    const response = await databases.createDocument(
        appwriteConfig.databaseId,
        COLLECTION_ID,
        ID.unique(),
        {
            name: data.name,
            description: data.description || '',
            status: data.status || 'active',
        }
    );
    return response;
};

export const getAllProducts = async () => {
    const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
    );
    return response.documents;
};
```

## Troubleshooting

### Error: Missing API Key
- Go to Appwrite Console → Overview → API Keys
- Create new key with Database permissions
- Add to `.env` as `APPWRITE_API_KEY`

### Error: Collection Already Exists
- The script automatically deletes existing collection
- If error persists, manually delete from Appwrite Console

### Error: fetch is not defined
- Use Node.js 18+ (has built-in fetch)
- Or install: `npm install node-fetch`
