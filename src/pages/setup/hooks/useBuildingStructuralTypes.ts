import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBuildingStructuralTypes,
  getBuildingStructuralTypeById,
  createBuildingStructuralType,
  updateBuildingStructuralType,
  deleteBuildingStructuralType,
  getBuildingStructuralTypesByStatus,
  searchBuildingStructuralTypes,
  type BuildingStructuralTypeResponse,
  type BuildingStructuralTypeData,
} from '../services/buildingStructuralType';

// Query keys
export const buildingStructuralTypeKeys = {
  all: ['buildingStructuralTypes'] as const,
  lists: () => [...buildingStructuralTypeKeys.all, 'list'] as const,
  list: (filters?: string) => [...buildingStructuralTypeKeys.lists(), { filters }] as const,
  details: () => [...buildingStructuralTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...buildingStructuralTypeKeys.details(), id] as const,
  byStatus: (status: string) => [...buildingStructuralTypeKeys.all, 'status', status] as const,
  search: (term: string) => [...buildingStructuralTypeKeys.all, 'search', term] as const,
};

// Get all building structural types
export const useGetAllBuildingStructuralTypes = () => {
  return useQuery({
    queryKey: buildingStructuralTypeKeys.lists(),
    queryFn: async () => {
      const result = await getAllBuildingStructuralTypes();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building structural types');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get building structural type by ID
export const useGetBuildingStructuralTypeById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: buildingStructuralTypeKeys.detail(id),
    queryFn: async () => {
      const result = await getBuildingStructuralTypeById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building structural type');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get building structural types by status
export const useGetBuildingStructuralTypesByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: buildingStructuralTypeKeys.byStatus(status),
    queryFn: async () => {
      const result = await getBuildingStructuralTypesByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building structural types by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search building structural types
export const useSearchBuildingStructuralTypes = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: buildingStructuralTypeKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchBuildingStructuralTypes(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search building structural types');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create building structural type mutation
export const useCreateBuildingStructuralType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuildingStructuralTypeData) => {
      const result = await createBuildingStructuralType(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create building structural type');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all building structural types queries
      queryClient.invalidateQueries({ queryKey: buildingStructuralTypeKeys.all });
    },
  });
};

// Update building structural type mutation
export const useUpdateBuildingStructuralType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BuildingStructuralTypeData> }) => {
      const result = await updateBuildingStructuralType(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update building structural type');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific structural type and all lists
      queryClient.invalidateQueries({ queryKey: buildingStructuralTypeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: buildingStructuralTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingStructuralTypeKeys.all });
    },
  });
};

// Delete building structural type mutation
export const useDeleteBuildingStructuralType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBuildingStructuralType(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete building structural type');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific structural type from cache and invalidate lists
      queryClient.removeQueries({ queryKey: buildingStructuralTypeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: buildingStructuralTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingStructuralTypeKeys.all });
    },
  });
};
