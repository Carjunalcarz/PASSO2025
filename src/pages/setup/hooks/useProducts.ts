import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByStatus,
    searchProducts,
    type ProductData,
    type ProductResponse,
} from '../services/products';

// Query keys
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: string) => [...productKeys.lists(), { filters }] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
    byStatus: (status: string) => [...productKeys.all, 'status', status] as const,
    search: (term: string) => [...productKeys.all, 'search', term] as const,
};

// Get all products
export const useGetAllProducts = () => {
    return useQuery({
        queryKey: productKeys.lists(),
        queryFn: async () => {
            const result = await getAllProducts();
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data || [];
        },
    });
};

// Get product by ID
export const useGetProductById = (id: string) => {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: async () => {
            const result = await getProductById(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        enabled: !!id,
    });
};

// Create product
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ProductData) => {
            const result = await createProduct(data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

// Update product
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ProductData> }) => {
            const result = await updateProduct(id, data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
        },
    });
};

// Delete product
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteProduct(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

// Get products by status
export const useGetProductsByStatus = (status: string) => {
    return useQuery({
        queryKey: productKeys.byStatus(status),
        queryFn: async () => {
            const result = await getProductsByStatus(status);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data || [];
        },
        enabled: !!status,
    });
};

// Search products
export const useSearchProducts = (searchTerm: string) => {
    return useQuery({
        queryKey: productKeys.search(searchTerm),
        queryFn: async () => {
            const result = await searchProducts(searchTerm);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data || [];
        },
        enabled: searchTerm.length > 0,
    });
};
