import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllMachineryTypes,
  getMachineryTypeById,
  createMachineryType,
  updateMachineryType,
  deleteMachineryType,
  getMachineryTypesByStatus,
  searchMachineryTypes,
  type MachineryTypeResponse,
  type MachineryTypeData,
} from '../services/machineryTypes';

// Query keys
export const machineryTypeKeys = {
  all: ['machineryTypes'] as const,
  lists: () => [...machineryTypeKeys.all, 'list'] as const,
  list: (filters?: string) => [...machineryTypeKeys.lists(), { filters }] as const,
  details: () => [...machineryTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...machineryTypeKeys.details(), id] as const,
  byStatus: (status: string) => [...machineryTypeKeys.all, 'status', status] as const,
  search: (term: string) => [...machineryTypeKeys.all, 'search', term] as const,
};

// Get all machinery types
export const useGetAllMachineryTypes = () => {
  return useQuery({
    queryKey: machineryTypeKeys.lists(),
    queryFn: async () => {
      const result = await getAllMachineryTypes();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch machinery types');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get machinery type by ID
export const useGetMachineryTypeById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: machineryTypeKeys.detail(id),
    queryFn: async () => {
      const result = await getMachineryTypeById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch machinery type');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get machinery types by status
export const useGetMachineryTypesByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: machineryTypeKeys.byStatus(status),
    queryFn: async () => {
      const result = await getMachineryTypesByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch machinery types by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search machinery types
export const useSearchMachineryTypes = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: machineryTypeKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchMachineryTypes(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search machinery types');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create machinery type mutation
export const useCreateMachineryType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MachineryTypeData) => {
      const result = await createMachineryType(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create machinery type');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all machinery types queries
      queryClient.invalidateQueries({ queryKey: machineryTypeKeys.all });
    },
  });
};

// Update machinery type mutation
export const useUpdateMachineryType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MachineryTypeData> }) => {
      const result = await updateMachineryType(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update machinery type');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific type and all lists
      queryClient.invalidateQueries({ queryKey: machineryTypeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: machineryTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: machineryTypeKeys.all });
    },
  });
};

// Delete machinery type mutation
export const useDeleteMachineryType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteMachineryType(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete machinery type');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific type from cache and invalidate lists
      queryClient.removeQueries({ queryKey: machineryTypeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: machineryTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: machineryTypeKeys.all });
    },
  });
};
