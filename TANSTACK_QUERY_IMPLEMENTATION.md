# TanStack Query Implementation Summary

## Overview
Successfully integrated TanStack Query (React Query) into the Building Components and Building Parts modules for better data fetching, caching, and state management.

## Files Created

### 1. Custom Hooks

#### `src/pages/setup/hooks/useBuildingComponents.ts`
Custom hooks for Building Components:
- `useGetAllBuildingComponents()` - Fetch all building components
- `useGetBuildingComponentById(id)` - Fetch single component by ID
- `useGetBuildingComponentsByStatus(status)` - Filter by status
- `useSearchBuildingComponents(searchTerm)` - Search components
- `useCreateBuildingComponent()` - Create mutation
- `useUpdateBuildingComponent()` - Update mutation
- `useDeleteBuildingComponent()` - Delete mutation

#### `src/pages/setup/hooks/useBuildingParts.ts`
Custom hooks for Building Parts:
- `useGetAllBuildingParts()` - Fetch all building parts
- `useGetBuildingPartById(id)` - Fetch single part by ID
- `useGetBuildingPartsByStatus(status)` - Filter by status
- `useGetBuildingPartsByComponentId(componentId)` - Filter by component
- `useSearchBuildingParts(searchTerm)` - Search parts
- `useCreateBuildingPart()` - Create mutation
- `useUpdateBuildingPart()` - Update mutation
- `useDeleteBuildingPart()` - Delete mutation

#### `src/pages/setup/hooks/useBuildingPartRates.ts`
Custom hooks for Building Part Rates:
- `useGetAllBuildingPartRates()` - Fetch all building part rates
- `useGetBuildingPartRateById(id)` - Fetch single rate by ID
- `useGetBuildingPartRatesByStatus(status)` - Filter by status
- `useGetBuildingPartRatesByBuildingPartId(buildingPartId)` - Filter by building part
- `useCreateBuildingPartRate()` - Create mutation
- `useUpdateBuildingPartRate()` - Update mutation
- `useDeleteBuildingPartRate()` - Delete mutation

## Files Refactored

### 1. `src/pages/setup/pages/BuildingComponent.tsx`
**Changes:**
- Removed manual `useState` for data fetching (`initialRecords`, `loading`)
- Replaced `useEffect` data fetching with TanStack Query hooks
- Used `useMemo` for efficient filtering and pagination
- Added automatic loading states with `fetching` prop
- Mutations automatically invalidate and refetch data
- Better error handling with try-catch blocks

### 2. `src/pages/setup/pages/BuildingParts.tsx`
**Changes:**
- Removed manual state management for both parts and components
- Integrated both `useBuildingParts` and `useBuildingComponents` hooks
- Simplified data fetching logic
- Added loading state combination for both queries
- Improved mutation handling with automatic cache invalidation
- Better error handling

### 3. `src/pages/setup/pages/BuildingPartsRate.tsx`
**Changes:**
- Removed manual state management for rates and building parts
- Integrated both `useBuildingPartRates` and `useBuildingParts` hooks
- Used `useMemo` for efficient filtering and pagination
- Combined loading states from multiple queries
- Automatic cache invalidation on mutations
- Better error handling with try-catch blocks

## Key Benefits

### 1. **Automatic Caching**
- Data is cached for 5 minutes (configurable via `staleTime`)
- Reduces unnecessary API calls
- Improves performance

### 2. **Background Refetching**
- Stale data is automatically refetched in the background
- Users always see the latest data without manual refresh

### 3. **Optimistic Updates**
- UI updates immediately after mutations
- Cache is automatically invalidated and refetched

### 4. **Loading States**
- Built-in `isLoading` and `isPending` states
- No need for manual loading state management
- DataTable `fetching` prop shows loading indicator

### 5. **Error Handling**
- Centralized error management
- Automatic error state tracking
- Easy to display error messages

### 6. **Query Invalidation**
- Related queries automatically refresh after mutations
- Ensures data consistency across the application

### 7. **Developer Experience**
- Less boilerplate code
- Cleaner component logic
- Easier to maintain and test

## Query Keys Structure

### Building Components
```typescript
{
  all: ['buildingComponents'],
  lists: ['buildingComponents', 'list'],
  details: ['buildingComponents', 'detail'],
  detail: ['buildingComponents', 'detail', id],
  byStatus: ['buildingComponents', 'status', status],
  search: ['buildingComponents', 'search', term]
}
```

### Building Parts
```typescript
{
  all: ['buildingParts'],
  lists: ['buildingParts', 'list'],
  details: ['buildingParts', 'detail'],
  detail: ['buildingParts', 'detail', id],
  byStatus: ['buildingParts', 'status', status],
  byComponent: ['buildingParts', 'component', componentId],
  search: ['buildingParts', 'search', term]
}
```

### Building Part Rates
```typescript
{
  all: ['buildingPartRates'],
  lists: ['buildingPartRates', 'list'],
  details: ['buildingPartRates', 'detail'],
  detail: ['buildingPartRates', 'detail', id],
  byStatus: ['buildingPartRates', 'status', status],
  byBuildingPart: ['buildingPartRates', 'buildingPart', buildingPartId]
}
```

## Configuration

### Stale Time
- **Lists/Filters:** 5 minutes
- **Search Results:** 2 minutes
- Can be adjusted per query as needed

### Query Client Setup
Already configured in `src/main.tsx`:
```typescript
const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  {/* App content */}
</QueryClientProvider>
```

## Usage Examples

### Fetching Data
```typescript
const { data, isLoading, isError, error } = useGetAllBuildingComponents();
```

### Creating Data
```typescript
const createMutation = useCreateBuildingComponent();

await createMutation.mutateAsync({
  name: 'New Component',
  description: 'Description',
  status: 'active'
});
```

### Updating Data
```typescript
const updateMutation = useUpdateBuildingComponent();

await updateMutation.mutateAsync({
  id: 'component-id',
  data: { name: 'Updated Name' }
});
```

### Deleting Data
```typescript
const deleteMutation = useDeleteBuildingComponent();

await deleteMutation.mutateAsync('component-id');
```

## Summary

Successfully implemented TanStack Query for:
- ✅ Building Components
- ✅ Building Parts
- ✅ Building Part Rates

All three modules now benefit from automatic caching, background refetching, optimistic updates, and better error handling.

## Next Steps

Consider implementing TanStack Query for other modules:
1. User Management
2. Assessment Forms
3. Any other data-fetching components

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
