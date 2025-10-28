import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllKinds,
  getKindById,
  createKind,
  updateKind,
  deleteKind,
  getKindsByStatus,
  searchKinds,
  type KindResponse,
  type KindData,
} from '../services/kind';

// Query keys
export const kindKeys = {
  all: ['kinds'] as const,
  lists: () => [...kindKeys.all, 'list'] as const,
  list: (filters?: string) => [...kindKeys.lists(), { filters }] as const,
  details: () => [...kindKeys.all, 'detail'] as const,
  detail: (id: string) => [...kindKeys.details(), id] as const,
  byStatus: (status: string) => [...kindKeys.all, 'status', status] as const,
  search: (term: string) => [...kindKeys.all, 'search', term] as const,
};

// Get all kinds
export const useGetAllKinds = () => {
  return useQuery({
    queryKey: kindKeys.lists(),
    queryFn: async () => {
      const result = await getAllKinds();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch kinds');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get kind by ID
export const useGetKindById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: kindKeys.detail(id),
    queryFn: async () => {
      const result = await getKindById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch kind');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get kinds by status
export const useGetKindsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: kindKeys.byStatus(status),
    queryFn: async () => {
      const result = await getKindsByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch kinds by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search kinds
export const useSearchKinds = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: kindKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchKinds(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search kinds');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create kind mutation
export const useCreateKind = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: KindData) => {
      const result = await createKind(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create kind');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all kinds queries
      queryClient.invalidateQueries({ queryKey: kindKeys.all });
    },
  });
};

// Update kind mutation
export const useUpdateKind = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<KindData> }) => {
      const result = await updateKind(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update kind');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific kind and all lists
      queryClient.invalidateQueries({ queryKey: kindKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: kindKeys.lists() });
      queryClient.invalidateQueries({ queryKey: kindKeys.all });
    },
  });
};

// Delete kind mutation
export const useDeleteKind = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteKind(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete kind');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific kind from cache and invalidate lists
      queryClient.removeQueries({ queryKey: kindKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: kindKeys.lists() });
      queryClient.invalidateQueries({ queryKey: kindKeys.all });
    },
  });
};
