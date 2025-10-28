import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllClassifications,
  getClassificationById,
  createClassification,
  updateClassification,
  deleteClassification,
  getClassificationsByStatus,
  searchClassifications,
  type ClassificationResponse,
  type ClassificationData,
} from '../services/classification';

// Query keys
export const classificationKeys = {
  all: ['classifications'] as const,
  lists: () => [...classificationKeys.all, 'list'] as const,
  list: (filters?: string) => [...classificationKeys.lists(), { filters }] as const,
  details: () => [...classificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...classificationKeys.details(), id] as const,
  byStatus: (status: string) => [...classificationKeys.all, 'status', status] as const,
  search: (term: string) => [...classificationKeys.all, 'search', term] as const,
};

// Get all classifications
export const useGetAllClassifications = () => {
  return useQuery({
    queryKey: classificationKeys.lists(),
    queryFn: async () => {
      const result = await getAllClassifications();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch classifications');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get classification by ID
export const useGetClassificationById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: classificationKeys.detail(id),
    queryFn: async () => {
      const result = await getClassificationById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch classification');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get classifications by status
export const useGetClassificationsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: classificationKeys.byStatus(status),
    queryFn: async () => {
      const result = await getClassificationsByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch classifications by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search classifications
export const useSearchClassifications = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: classificationKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchClassifications(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search classifications');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create classification mutation
export const useCreateClassification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClassificationData) => {
      const result = await createClassification(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create classification');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all classifications queries
      queryClient.invalidateQueries({ queryKey: classificationKeys.all });
    },
  });
};

// Update classification mutation
export const useUpdateClassification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClassificationData> }) => {
      const result = await updateClassification(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update classification');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific classification and all lists
      queryClient.invalidateQueries({ queryKey: classificationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: classificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classificationKeys.all });
    },
  });
};

// Delete classification mutation
export const useDeleteClassification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteClassification(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete classification');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific classification from cache and invalidate lists
      queryClient.removeQueries({ queryKey: classificationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: classificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classificationKeys.all });
    },
  });
};
