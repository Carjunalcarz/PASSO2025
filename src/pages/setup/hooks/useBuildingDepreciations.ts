import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBuildingDepreciations,
  getBuildingDepreciationById,
  createBuildingDepreciation,
  updateBuildingDepreciation,
  deleteBuildingDepreciation,
  getBuildingDepreciationsByStatus,
  getBuildingDepreciationsByStructuralType,
  getBuildingDepreciationsByBuildingCode,
  searchBuildingDepreciations,
  type BuildingDepreciationResponse,
  type BuildingDepreciationData,
} from '../services/buildingDepreciation';

// Query keys
export const buildingDepreciationKeys = {
  all: ['buildingDepreciations'] as const,
  lists: () => [...buildingDepreciationKeys.all, 'list'] as const,
  list: (filters?: string) => [...buildingDepreciationKeys.lists(), { filters }] as const,
  details: () => [...buildingDepreciationKeys.all, 'detail'] as const,
  detail: (id: string) => [...buildingDepreciationKeys.details(), id] as const,
  byStatus: (status: string) => [...buildingDepreciationKeys.all, 'status', status] as const,
  byStructuralType: (structuralTypeId: string) => [...buildingDepreciationKeys.all, 'structuralType', structuralTypeId] as const,
  byBuildingCode: (buildingCodeId: string) => [...buildingDepreciationKeys.all, 'buildingCode', buildingCodeId] as const,
  search: (term: string) => [...buildingDepreciationKeys.all, 'search', term] as const,
};

// Get all building depreciations
export const useGetAllBuildingDepreciations = () => {
  return useQuery({
    queryKey: buildingDepreciationKeys.lists(),
    queryFn: async () => {
      const result = await getAllBuildingDepreciations();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building depreciations');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get building depreciation by ID
export const useGetBuildingDepreciationById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: buildingDepreciationKeys.detail(id),
    queryFn: async () => {
      const result = await getBuildingDepreciationById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building depreciation');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get building depreciations by status
export const useGetBuildingDepreciationsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: buildingDepreciationKeys.byStatus(status),
    queryFn: async () => {
      const result = await getBuildingDepreciationsByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building depreciations by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Get building depreciations by structural type
export const useGetBuildingDepreciationsByStructuralType = (structuralTypeId: string, enabled = true) => {
  return useQuery({
    queryKey: buildingDepreciationKeys.byStructuralType(structuralTypeId),
    queryFn: async () => {
      const result = await getBuildingDepreciationsByStructuralType(structuralTypeId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building depreciations by structural type');
      }
      return result.data || [];
    },
    enabled: enabled && !!structuralTypeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get building depreciations by building code
export const useGetBuildingDepreciationsByBuildingCode = (buildingCodeId: string, enabled = true) => {
  return useQuery({
    queryKey: buildingDepreciationKeys.byBuildingCode(buildingCodeId),
    queryFn: async () => {
      const result = await getBuildingDepreciationsByBuildingCode(buildingCodeId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building depreciations by building code');
      }
      return result.data || [];
    },
    enabled: enabled && !!buildingCodeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Search building depreciations
export const useSearchBuildingDepreciations = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: buildingDepreciationKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchBuildingDepreciations(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search building depreciations');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create building depreciation mutation
export const useCreateBuildingDepreciation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuildingDepreciationData) => {
      const result = await createBuildingDepreciation(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create building depreciation');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all building depreciations queries
      queryClient.invalidateQueries({ queryKey: buildingDepreciationKeys.all });
    },
  });
};

// Update building depreciation mutation
export const useUpdateBuildingDepreciation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BuildingDepreciationData> }) => {
      const result = await updateBuildingDepreciation(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update building depreciation');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific depreciation and all lists
      queryClient.invalidateQueries({ queryKey: buildingDepreciationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: buildingDepreciationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingDepreciationKeys.all });
    },
  });
};

// Delete building depreciation mutation
export const useDeleteBuildingDepreciation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBuildingDepreciation(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete building depreciation');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific depreciation from cache and invalidate lists
      queryClient.removeQueries({ queryKey: buildingDepreciationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: buildingDepreciationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingDepreciationKeys.all });
    },
  });
};
