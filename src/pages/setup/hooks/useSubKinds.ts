import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllSubKinds,
  getSubKindById,
  createSubKind,
  updateSubKind,
  deleteSubKind,
  getSubKindsByStatus,
  getSubKindsByKindId,
  searchSubKinds,
  type SubKindResponse,
  type SubKindData,
} from '../services/subKind';

// Query keys
export const subKindKeys = {
  all: ['subKinds'] as const,
  lists: () => [...subKindKeys.all, 'list'] as const,
  list: (filters?: string) => [...subKindKeys.lists(), { filters }] as const,
  details: () => [...subKindKeys.all, 'detail'] as const,
  detail: (id: string) => [...subKindKeys.details(), id] as const,
  byStatus: (status: string) => [...subKindKeys.all, 'status', status] as const,
  byKind: (kindId: string) => [...subKindKeys.all, 'kind', kindId] as const,
  search: (term: string) => [...subKindKeys.all, 'search', term] as const,
};

// Get all sub-kinds
export const useGetAllSubKinds = () => {
  return useQuery({
    queryKey: subKindKeys.lists(),
    queryFn: async () => {
      const result = await getAllSubKinds();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sub-kinds');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get sub-kind by ID
export const useGetSubKindById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: subKindKeys.detail(id),
    queryFn: async () => {
      const result = await getSubKindById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sub-kind');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get sub-kinds by kind ID
export const useGetSubKindsByKindId = (kindId: string, enabled = true) => {
  return useQuery({
    queryKey: subKindKeys.byKind(kindId),
    queryFn: async () => {
      const result = await getSubKindsByKindId(kindId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sub-kinds by kind');
      }
      return result.data || [];
    },
    enabled: enabled && !!kindId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get sub-kinds by status
export const useGetSubKindsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: subKindKeys.byStatus(status),
    queryFn: async () => {
      const result = await getSubKindsByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sub-kinds by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search sub-kinds
export const useSearchSubKinds = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: subKindKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchSubKinds(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search sub-kinds');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create sub-kind mutation
export const useCreateSubKind = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubKindData) => {
      const result = await createSubKind(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create sub-kind');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all sub-kinds queries
      queryClient.invalidateQueries({ queryKey: subKindKeys.all });
    },
  });
};

// Update sub-kind mutation
export const useUpdateSubKind = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubKindData> }) => {
      const result = await updateSubKind(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update sub-kind');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific sub-kind and all lists
      queryClient.invalidateQueries({ queryKey: subKindKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: subKindKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subKindKeys.all });
    },
  });
};

// Delete sub-kind mutation
export const useDeleteSubKind = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSubKind(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete sub-kind');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific sub-kind from cache and invalidate lists
      queryClient.removeQueries({ queryKey: subKindKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subKindKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subKindKeys.all });
    },
  });
};
