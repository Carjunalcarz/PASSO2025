import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBuildingCodes,
  getBuildingCodeById,
  createBuildingCode,
  updateBuildingCode,
  deleteBuildingCode,
  getBuildingCodesByStatus,
  searchBuildingCodes,
  type BuildingCodeResponse,
  type BuildingCodeData,
} from '../services/buildingCode';

// Query keys
export const buildingCodeKeys = {
  all: ['buildingCodes'] as const,
  lists: () => [...buildingCodeKeys.all, 'list'] as const,
  list: (filters?: string) => [...buildingCodeKeys.lists(), { filters }] as const,
  details: () => [...buildingCodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...buildingCodeKeys.details(), id] as const,
  byStatus: (status: string) => [...buildingCodeKeys.all, 'status', status] as const,
  search: (term: string) => [...buildingCodeKeys.all, 'search', term] as const,
};

// Get all building codes
export const useGetAllBuildingCodes = () => {
  return useQuery({
    queryKey: buildingCodeKeys.lists(),
    queryFn: async () => {
      const result = await getAllBuildingCodes();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building codes');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get building code by ID
export const useGetBuildingCodeById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: buildingCodeKeys.detail(id),
    queryFn: async () => {
      const result = await getBuildingCodeById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building code');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get building codes by status
export const useGetBuildingCodesByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: buildingCodeKeys.byStatus(status),
    queryFn: async () => {
      const result = await getBuildingCodesByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building codes by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search building codes
export const useSearchBuildingCodes = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: buildingCodeKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchBuildingCodes(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search building codes');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create building code mutation
export const useCreateBuildingCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuildingCodeData) => {
      const result = await createBuildingCode(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create building code');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all building codes queries
      queryClient.invalidateQueries({ queryKey: buildingCodeKeys.all });
    },
  });
};

// Update building code mutation
export const useUpdateBuildingCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BuildingCodeData> }) => {
      const result = await updateBuildingCode(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update building code');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific code and all lists
      queryClient.invalidateQueries({ queryKey: buildingCodeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: buildingCodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingCodeKeys.all });
    },
  });
};

// Delete building code mutation
export const useDeleteBuildingCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBuildingCode(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete building code');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific code from cache and invalidate lists
      queryClient.removeQueries({ queryKey: buildingCodeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: buildingCodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingCodeKeys.all });
    },
  });
};
