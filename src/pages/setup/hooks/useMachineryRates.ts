import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllMachineryRates,
  getMachineryRateById,
  createMachineryRate,
  updateMachineryRate,
  deleteMachineryRate,
  getMachineryRatesByStatus,
  getMachineryRatesByType,
  searchMachineryRates,
  type MachineryRateResponse,
  type MachineryRateData,
} from '../services/machineryRates';

// Query keys
export const machineryRateKeys = {
  all: ['machineryRates'] as const,
  lists: () => [...machineryRateKeys.all, 'list'] as const,
  list: (filters?: string) => [...machineryRateKeys.lists(), { filters }] as const,
  details: () => [...machineryRateKeys.all, 'detail'] as const,
  detail: (id: string) => [...machineryRateKeys.details(), id] as const,
  byStatus: (status: string) => [...machineryRateKeys.all, 'status', status] as const,
  byType: (typeId: string) => [...machineryRateKeys.all, 'type', typeId] as const,
  search: (term: string) => [...machineryRateKeys.all, 'search', term] as const,
};

// Get all machinery rates
export const useGetAllMachineryRates = () => {
  return useQuery({
    queryKey: machineryRateKeys.lists(),
    queryFn: async () => {
      const result = await getAllMachineryRates();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch machinery rates');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get machinery rate by ID
export const useGetMachineryRateById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: machineryRateKeys.detail(id),
    queryFn: async () => {
      const result = await getMachineryRateById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch machinery rate');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get machinery rates by status
export const useGetMachineryRatesByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: machineryRateKeys.byStatus(status),
    queryFn: async () => {
      const result = await getMachineryRatesByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch machinery rates by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Get machinery rates by type
export const useGetMachineryRatesByType = (typeId: string, enabled = true) => {
  return useQuery({
    queryKey: machineryRateKeys.byType(typeId),
    queryFn: async () => {
      const result = await getMachineryRatesByType(typeId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch machinery rates by type');
      }
      return result.data || [];
    },
    enabled: enabled && !!typeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Search machinery rates
export const useSearchMachineryRates = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: machineryRateKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchMachineryRates(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search machinery rates');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create machinery rate mutation
export const useCreateMachineryRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MachineryRateData) => {
      const result = await createMachineryRate(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create machinery rate');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all machinery rates queries
      queryClient.invalidateQueries({ queryKey: machineryRateKeys.all });
    },
  });
};

// Update machinery rate mutation
export const useUpdateMachineryRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MachineryRateData> }) => {
      const result = await updateMachineryRate(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update machinery rate');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific rate and all lists
      queryClient.invalidateQueries({ queryKey: machineryRateKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: machineryRateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: machineryRateKeys.all });
    },
  });
};

// Delete machinery rate mutation
export const useDeleteMachineryRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteMachineryRate(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete machinery rate');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific rate from cache and invalidate lists
      queryClient.removeQueries({ queryKey: machineryRateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: machineryRateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: machineryRateKeys.all });
    },
  });
};
