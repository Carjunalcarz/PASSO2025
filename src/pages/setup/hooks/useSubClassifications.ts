import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllSubClassifications,
  getSubClassificationById,
  getSubClassificationsByClassificationId,
  createSubClassification,
  updateSubClassification,
  deleteSubClassification,
  getSubClassificationsByStatus,
  searchSubClassifications,
  type SubClassificationResponse,
  type SubClassificationData,
} from '../services/subClassification';

// Query keys
export const subClassificationKeys = {
  all: ['subClassifications'] as const,
  lists: () => [...subClassificationKeys.all, 'list'] as const,
  list: (filters?: string) => [...subClassificationKeys.lists(), { filters }] as const,
  details: () => [...subClassificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...subClassificationKeys.details(), id] as const,
  byClassification: (classificationId: string) => [...subClassificationKeys.all, 'classification', classificationId] as const,
  byStatus: (status: string) => [...subClassificationKeys.all, 'status', status] as const,
  search: (term: string) => [...subClassificationKeys.all, 'search', term] as const,
};

// Get all sub-classifications
export const useGetAllSubClassifications = () => {
  return useQuery({
    queryKey: subClassificationKeys.lists(),
    queryFn: async () => {
      const result = await getAllSubClassifications();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sub-classifications');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get sub-classification by ID
export const useGetSubClassificationById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: subClassificationKeys.detail(id),
    queryFn: async () => {
      const result = await getSubClassificationById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sub-classification');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get sub-classifications by classification ID
export const useGetSubClassificationsByClassificationId = (classificationId: string, enabled = true) => {
  return useQuery({
    queryKey: subClassificationKeys.byClassification(classificationId),
    queryFn: async () => {
      const result = await getSubClassificationsByClassificationId(classificationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sub-classifications by classification');
      }
      return result.data || [];
    },
    enabled: enabled && !!classificationId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get sub-classifications by status
export const useGetSubClassificationsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: subClassificationKeys.byStatus(status),
    queryFn: async () => {
      const result = await getSubClassificationsByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sub-classifications by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search sub-classifications
export const useSearchSubClassifications = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: subClassificationKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchSubClassifications(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search sub-classifications');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create sub-classification mutation
export const useCreateSubClassification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubClassificationData) => {
      const result = await createSubClassification(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create sub-classification');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all sub-classifications queries
      queryClient.invalidateQueries({ queryKey: subClassificationKeys.all });
    },
  });
};

// Update sub-classification mutation
export const useUpdateSubClassification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubClassificationData> }) => {
      const result = await updateSubClassification(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update sub-classification');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific sub-classification and all lists
      queryClient.invalidateQueries({ queryKey: subClassificationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: subClassificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subClassificationKeys.all });
    },
  });
};

// Delete sub-classification mutation
export const useDeleteSubClassification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSubClassification(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete sub-classification');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific sub-classification from cache and invalidate lists
      queryClient.removeQueries({ queryKey: subClassificationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subClassificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subClassificationKeys.all });
    },
  });
};
