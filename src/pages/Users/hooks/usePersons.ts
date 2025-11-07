import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  getPersonsByStatus,
  searchPersons,
  type PersonResponse,
  type PersonData,
} from '../services/person';

// Query keys
export const personKeys = {
  all: ['persons'] as const,
  lists: () => [...personKeys.all, 'list'] as const,
  list: (filters?: any) => [...personKeys.lists(), { filters }] as const,
  details: () => [...personKeys.all, 'detail'] as const,
  detail: (id: string) => [...personKeys.details(), id] as const,
  byStatus: (status: string) => [...personKeys.all, 'status', status] as const,
  search: (term: string) => [...personKeys.all, 'search', term] as const,
};

// Pagination params interface
export interface PaginationParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Get all persons with pagination
export const useGetAllPersons = (params?: PaginationParams) => {
  const { limit = 25, offset = 0, orderBy = '$createdAt', orderDirection = 'desc' } = params || {};
  
  return useQuery({
    queryKey: personKeys.list({ limit, offset, orderBy, orderDirection }),
    queryFn: async () => {
      const result = await getAllPersons(limit, offset, orderBy, orderDirection);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch persons');
      }
      return {
        data: result.data || [],
        total: result.total || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get person by ID
export const useGetPersonById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: personKeys.detail(id),
    queryFn: async () => {
      const result = await getPersonById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch person');
      }
      return result.data;
    },
    enabled: enabled && !!id,
  });
};

// Get persons by status
export const useGetPersonsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: personKeys.byStatus(status),
    queryFn: async () => {
      const result = await getPersonsByStatus(status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch persons by status');
      }
      return result.data || [];
    },
    enabled: enabled && !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// Search persons
export const useSearchPersons = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: personKeys.search(searchTerm),
    queryFn: async () => {
      const result = await searchPersons(searchTerm);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search persons');
      }
      return result.data || [];
    },
    enabled: enabled && !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create person mutation with permissions
export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, adminTeamId }: { data: PersonData; adminTeamId?: string }) => {
      const result = await createPerson(data, adminTeamId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create person');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch all persons queries
      queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
};

// Update person mutation
export const useUpdatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PersonData> }) => {
      const result = await updatePerson(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update person');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific person and all lists
      queryClient.invalidateQueries({ queryKey: personKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
      queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
};

// Delete person mutation
export const useDeletePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePerson(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete person');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove the specific person from cache and invalidate lists
      queryClient.removeQueries({ queryKey: personKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
      queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
};
