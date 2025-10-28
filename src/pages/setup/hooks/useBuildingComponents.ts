import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBuildingComponents,
  getBuildingComponentById,
  createBuildingComponent,
  updateBuildingComponent,
  deleteBuildingComponent,
  getBuildingComponentsByStatus,
  searchBuildingComponents,
  type BuildingComponentResponse,
  type BuildingComponentData,
} from '../services/buildingComponent';

// Query keys
export const buildingComponentKeys = {
  all: ['buildingComponents'] as const,
  lists: () => [...buildingComponentKeys.all, 'list'] as const,
  list: (filters?: string) => [...buildingComponentKeys.lists(), { filters }] as const,
  details: () => [...buildingComponentKeys.all, 'detail'] as const,
  detail: (id: string) => [...buildingComponentKeys.details(), id] as const,
  byStatus: (status: string) => [...buildingComponentKeys.all, 'status', status] as const,
  search: (term: string) => [...buildingComponentKeys.all, 'search', term] as const,
};

// Get all building components
export const useGetAllBuildingComponents = () => {
  return useQuery({
    queryKey: buildingComponentKeys.lists(),
    queryFn: async () => {
      const result = await getAllBuildingComponents();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building components');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get building component by ID
export const useGetBuildingComponentById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: buildingComponentKeys.detail(id),
    queryFn: async () => {
      const result = await getBuildingComponentById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building component');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get building components by status
export const useGetBuildingComponentsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: buildingComponentKeys.byStatus(status),
    queryFn: async () => {
      const result = await getBuildingComponentsByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building components by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search building components
export const useSearchBuildingComponents = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: buildingComponentKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchBuildingComponents(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search building components');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create building component mutation
export const useCreateBuildingComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuildingComponentData) => {
      const result = await createBuildingComponent(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create building component');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all building components queries
      queryClient.invalidateQueries({ queryKey: buildingComponentKeys.all });
    },
  });
};

// Update building component mutation
export const useUpdateBuildingComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BuildingComponentData> }) => {
      const result = await updateBuildingComponent(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update building component');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific component and all lists
      queryClient.invalidateQueries({ queryKey: buildingComponentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: buildingComponentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingComponentKeys.all });
    },
  });
};

// Delete building component mutation
export const useDeleteBuildingComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBuildingComponent(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete building component');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific component from cache and invalidate lists
      queryClient.removeQueries({ queryKey: buildingComponentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: buildingComponentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingComponentKeys.all });
    },
  });
};
