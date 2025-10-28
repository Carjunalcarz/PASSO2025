import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBuildingParts,
  getBuildingPartById,
  createBuildingPart,
  updateBuildingPart,
  deleteBuildingPart,
  getBuildingPartsByStatus,
  getBuildingPartsByComponentId,
  searchBuildingParts,
  type BuildingPartResponse,
  type BuildingPartData,
} from '../services/buildingPart';

// Query keys
export const buildingPartKeys = {
  all: ['buildingParts'] as const,
  lists: () => [...buildingPartKeys.all, 'list'] as const,
  list: (filters?: string) => [...buildingPartKeys.lists(), { filters }] as const,
  details: () => [...buildingPartKeys.all, 'detail'] as const,
  detail: (id: string) => [...buildingPartKeys.details(), id] as const,
  byStatus: (status: string) => [...buildingPartKeys.all, 'status', status] as const,
  byComponent: (componentId: string) => [...buildingPartKeys.all, 'component', componentId] as const,
  search: (term: string) => [...buildingPartKeys.all, 'search', term] as const,
};

// Get all building parts
export const useGetAllBuildingParts = () => {
  return useQuery({
    queryKey: buildingPartKeys.lists(),
    queryFn: async () => {
      const result = await getAllBuildingParts();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building parts');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get building part by ID
export const useGetBuildingPartById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: buildingPartKeys.detail(id),
    queryFn: async () => {
      const result = await getBuildingPartById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building part');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get building parts by status
export const useGetBuildingPartsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: buildingPartKeys.byStatus(status),
    queryFn: async () => {
      const result = await getBuildingPartsByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building parts by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Get building parts by component ID
export const useGetBuildingPartsByComponentId = (componentId: string, enabled = true) => {
  return useQuery({
    queryKey: buildingPartKeys.byComponent(componentId),
    queryFn: async () => {
      const result = await getBuildingPartsByComponentId(componentId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building parts by component');
      }
      return result.data || [];
    },
    enabled: enabled && !!componentId,
    staleTime: 5 * 60 * 1000,
  });
};

// Search building parts
export const useSearchBuildingParts = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: buildingPartKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchBuildingParts(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search building parts');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create building part mutation
export const useCreateBuildingPart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuildingPartData) => {
      const result = await createBuildingPart(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create building part');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all building parts queries
      queryClient.invalidateQueries({ queryKey: buildingPartKeys.all });
    },
  });
};

// Update building part mutation
export const useUpdateBuildingPart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BuildingPartData> }) => {
      const result = await updateBuildingPart(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update building part');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific part and all lists
      queryClient.invalidateQueries({ queryKey: buildingPartKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: buildingPartKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingPartKeys.all });
    },
  });
};

// Delete building part mutation
export const useDeleteBuildingPart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBuildingPart(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete building part');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific part from cache and invalidate lists
      queryClient.removeQueries({ queryKey: buildingPartKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: buildingPartKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingPartKeys.all });
    },
  });
};
