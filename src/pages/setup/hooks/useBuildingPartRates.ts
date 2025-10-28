import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBuildingPartRates,
  getBuildingPartRateById,
  createBuildingPartRate,
  updateBuildingPartRate,
  deleteBuildingPartRate,
  getBuildingPartRatesByStatus,
  getBuildingPartRatesByBuildingPartsId,
  type BuildingPartRateResponse,
  type BuildingPartRateData,
} from '../services/buildingPartRate';

// Query keys
export const buildingPartRateKeys = {
  all: ['buildingPartRates'] as const,
  lists: () => [...buildingPartRateKeys.all, 'list'] as const,
  list: (filters?: string) => [...buildingPartRateKeys.lists(), { filters }] as const,
  details: () => [...buildingPartRateKeys.all, 'detail'] as const,
  detail: (id: string) => [...buildingPartRateKeys.details(), id] as const,
  byStatus: (status: string) => [...buildingPartRateKeys.all, 'status', status] as const,
  byBuildingPart: (buildingPartId: string) => [...buildingPartRateKeys.all, 'buildingPart', buildingPartId] as const,
};

// Get all building part rates
export const useGetAllBuildingPartRates = () => {
  return useQuery({
    queryKey: buildingPartRateKeys.lists(),
    queryFn: async () => {
      const result = await getAllBuildingPartRates();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building part rates');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get building part rate by ID
export const useGetBuildingPartRateById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: buildingPartRateKeys.detail(id),
    queryFn: async () => {
      const result = await getBuildingPartRateById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building part rate');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get building part rates by status
export const useGetBuildingPartRatesByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: buildingPartRateKeys.byStatus(status),
    queryFn: async () => {
      const result = await getBuildingPartRatesByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building part rates by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Get building part rates by building part ID
export const useGetBuildingPartRatesByBuildingPartId = (buildingPartId: string, enabled = true) => {
  return useQuery({
    queryKey: buildingPartRateKeys.byBuildingPart(buildingPartId),
    queryFn: async () => {
      const result = await getBuildingPartRatesByBuildingPartsId(buildingPartId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch building part rates by building part');
      }
      return result.data || [];
    },
    enabled: enabled && !!buildingPartId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create building part rate mutation
export const useCreateBuildingPartRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuildingPartRateData) => {
      const result = await createBuildingPartRate(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create building part rate');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all building part rates queries
      queryClient.invalidateQueries({ queryKey: buildingPartRateKeys.all });
    },
  });
};

// Update building part rate mutation
export const useUpdateBuildingPartRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BuildingPartRateData> }) => {
      const result = await updateBuildingPartRate(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update building part rate');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific rate and all lists
      queryClient.invalidateQueries({ queryKey: buildingPartRateKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: buildingPartRateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingPartRateKeys.all });
    },
  });
};

// Delete building part rate mutation
export const useDeleteBuildingPartRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBuildingPartRate(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete building part rate');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific rate from cache and invalidate lists
      queryClient.removeQueries({ queryKey: buildingPartRateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: buildingPartRateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingPartRateKeys.all });
    },
  });
};
