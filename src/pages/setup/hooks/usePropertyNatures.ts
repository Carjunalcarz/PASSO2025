import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllPropertyNatures,
    getPropertyNatureById,
    createPropertyNature,
    updatePropertyNature,
    deletePropertyNature,
    getPropertyNaturesByStatus,
    searchPropertyNatures,
    type PropertyNatureData,
    type PropertyNatureResponse,
} from '../services/propertyNature';

// Query keys
export const propertyNatureKeys = {
    all: ['propertyNatures'] as const,
    lists: () => [...propertyNatureKeys.all, 'list'] as const,
    list: (filters: string) => [...propertyNatureKeys.lists(), { filters }] as const,
    details: () => [...propertyNatureKeys.all, 'detail'] as const,
    detail: (id: string) => [...propertyNatureKeys.details(), id] as const,
    byStatus: (status: string) => [...propertyNatureKeys.all, 'status', status] as const,
    search: (term: string) => [...propertyNatureKeys.all, 'search', term] as const,
};

// Get all property natures
export const useGetAllPropertyNatures = () => {
    return useQuery({
        queryKey: propertyNatureKeys.lists(),
        queryFn: async () => {
            const result = await getAllPropertyNatures();
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data || [];
        },
    });
};

// Get property nature by ID
export const useGetPropertyNatureById = (id: string) => {
    return useQuery({
        queryKey: propertyNatureKeys.detail(id),
        queryFn: async () => {
            const result = await getPropertyNatureById(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        enabled: !!id,
    });
};

// Create property nature
export const useCreatePropertyNature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: PropertyNatureData) => {
            const result = await createPropertyNature(data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyNatureKeys.lists() });
        },
    });
};

// Update property nature
export const useUpdatePropertyNature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<PropertyNatureData> }) => {
            const result = await updatePropertyNature(id, data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: propertyNatureKeys.lists() });
            queryClient.invalidateQueries({ queryKey: propertyNatureKeys.detail(variables.id) });
        },
    });
};

// Delete property nature
export const useDeletePropertyNature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deletePropertyNature(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyNatureKeys.lists() });
        },
    });
};

// Get property natures by status
export const useGetPropertyNaturesByStatus = (status: string) => {
    return useQuery({
        queryKey: propertyNatureKeys.byStatus(status),
        queryFn: async () => {
            const result = await getPropertyNaturesByStatus(status);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data || [];
        },
        enabled: !!status,
    });
};

// Search property natures
export const useSearchPropertyNatures = (searchTerm: string) => {
    return useQuery({
        queryKey: propertyNatureKeys.search(searchTerm),
        queryFn: async () => {
            const result = await searchPropertyNatures(searchTerm);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data || [];
        },
        enabled: searchTerm.length > 0,
    });
};
