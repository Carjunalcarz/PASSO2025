import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for products
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products';

/**
 * Products Service
 * Handles all CRUD operations for products
 */

// Types
export interface ProductData {
    name: string;
    description?: string;
    status?: string;
}

export interface ProductResponse {
    $id: string;
    name: string;
    description: string;
    status: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new product
export const createProduct = async (data: ProductData): Promise<ServiceResponse<ProductResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                name: data.name,
                description: data.description || '',
                status: data.status || 'active',
            }
        );
        return { success: true, data: response as unknown as ProductResponse };
    } catch (error: any) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
    }
};

// Get all products
export const getAllProducts = async (): Promise<ServiceResponse<ProductResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [Query.orderDesc('$createdAt')]
        );
        return { success: true, data: response.documents as unknown as ProductResponse[] };
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return { success: false, error: error.message };
    }
};

// Get product by ID
export const getProductById = async (id: string): Promise<ServiceResponse<ProductResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as ProductResponse };
    } catch (error: any) {
        console.error('Error fetching product:', error);
        return { success: false, error: error.message };
    }
};

// Update product
export const updateProduct = async (id: string, data: Partial<ProductData>): Promise<ServiceResponse<ProductResponse>> => {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.status && { status: data.status }),
            }
        );
        return { success: true, data: response as unknown as ProductResponse };
    } catch (error: any) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
};

// Delete product
export const deleteProduct = async (id: string): Promise<ServiceResponse<void>> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }
};

// Get products by status
export const getProductsByStatus = async (status: string): Promise<ServiceResponse<ProductResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as ProductResponse[] };
    } catch (error: any) {
        console.error('Error fetching products by status:', error);
        return { success: false, error: error.message };
    }
};

// Search products by name
export const searchProducts = async (searchTerm: string): Promise<ServiceResponse<ProductResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as ProductResponse[] };
    } catch (error: any) {
        console.error('Error searching products:', error);
        return { success: false, error: error.message };
    }
};
