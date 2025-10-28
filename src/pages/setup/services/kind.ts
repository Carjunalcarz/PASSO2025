import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for kinds
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_KINDS_COLLECTION_ID || 'kinds';

/**
 * Kind Service
 * Handles all CRUD operations for kinds
 */

// Types
export interface KindData {
    name: string;
    description: string;
    status: string;
}

export interface KindResponse {
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

// Create a new kind
export const createKind = async (data: KindData): Promise<ServiceResponse<KindResponse>> => {
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
        return { success: true, data: response as unknown as KindResponse };
    } catch (error: any) {
        console.error('Error creating kind:', error);
        return { success: false, error: error.message };
    }
};

// Get all kinds
export const getAllKinds = async (): Promise<ServiceResponse<KindResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as KindResponse[] };
    } catch (error: any) {
        console.error('Error fetching kinds:', error);
        return { success: false, error: error.message };
    }
};

// Get a single kind by ID
export const getKindById = async (id: string): Promise<ServiceResponse<KindResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as KindResponse };
    } catch (error: any) {
        console.error('Error fetching kind:', error);
        return { success: false, error: error.message };
    }
};

// Update a kind
export const updateKind = async (id: string, data: Partial<KindData>): Promise<ServiceResponse<KindResponse>> => {
    try {
        const updateData: Partial<KindData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as KindResponse };
    } catch (error: any) {
        console.error('Error updating kind:', error);
        return { success: false, error: error.message };
    }
};

// Delete a kind
export const deleteKind = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting kind:', error);
        return { success: false, error: error.message };
    }
};

// Get kinds by status
export const getKindsByStatus = async (status: string): Promise<ServiceResponse<KindResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as KindResponse[] };
    } catch (error: any) {
        console.error('Error fetching kinds by status:', error);
        return { success: false, error: error.message };
    }
};

// Search kinds by name
export const searchKinds = async (searchTerm: string): Promise<ServiceResponse<KindResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as KindResponse[] };
    } catch (error: any) {
        console.error('Error searching kinds:', error);
        return { success: false, error: error.message };
    }
};

// Get active kinds only
export const getActiveKinds = async (): Promise<ServiceResponse<KindResponse[]>> => {
    return await getKindsByStatus('active');
};

// Get inactive kinds only
export const getInactiveKinds = async (): Promise<ServiceResponse<KindResponse[]>> => {
    return await getKindsByStatus('inactive');
};

export default {
    createKind,
    getAllKinds,
    getKindById,
    updateKind,
    deleteKind,
    getKindsByStatus,
    searchKinds,
    getActiveKinds,
    getInactiveKinds,
};
