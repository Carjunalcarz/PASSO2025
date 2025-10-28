import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for machinery types
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_MACHINERY_TYPES_COLLECTION_ID || 'machinery_types';

/**
 * Machinery Types Service
 * Handles all CRUD operations for machinery types
 */

// Types
export interface MachineryTypeData {
    name: string;
    description: string;
    status: string;
}

export interface MachineryTypeResponse {
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

// Create a new machinery type
export const createMachineryType = async (data: MachineryTypeData): Promise<ServiceResponse<MachineryTypeResponse>> => {
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
        return { success: true, data: response as unknown as MachineryTypeResponse };
    } catch (error: any) {
        console.error('Error creating machinery type:', error);
        return { success: false, error: error.message };
    }
};

// Get all machinery types
export const getAllMachineryTypes = async (): Promise<ServiceResponse<MachineryTypeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as MachineryTypeResponse[] };
    } catch (error: any) {
        console.error('Error fetching machinery types:', error);
        return { success: false, error: error.message };
    }
};

// Get a single machinery type by ID
export const getMachineryTypeById = async (id: string): Promise<ServiceResponse<MachineryTypeResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as MachineryTypeResponse };
    } catch (error: any) {
        console.error('Error fetching machinery type:', error);
        return { success: false, error: error.message };
    }
};

// Update a machinery type
export const updateMachineryType = async (id: string, data: Partial<MachineryTypeData>): Promise<ServiceResponse<MachineryTypeResponse>> => {
    try {
        const updateData: Partial<MachineryTypeData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as MachineryTypeResponse };
    } catch (error: any) {
        console.error('Error updating machinery type:', error);
        return { success: false, error: error.message };
    }
};

// Delete a machinery type
export const deleteMachineryType = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting machinery type:', error);
        return { success: false, error: error.message };
    }
};

// Get machinery types by status
export const getMachineryTypesByStatus = async (status: string): Promise<ServiceResponse<MachineryTypeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as MachineryTypeResponse[] };
    } catch (error: any) {
        console.error('Error fetching machinery types by status:', error);
        return { success: false, error: error.message };
    }
};

// Search machinery types by name
export const searchMachineryTypes = async (searchTerm: string): Promise<ServiceResponse<MachineryTypeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as MachineryTypeResponse[] };
    } catch (error: any) {
        console.error('Error searching machinery types:', error);
        return { success: false, error: error.message };
    }
};

// Get active machinery types only
export const getActiveMachineryTypes = async (): Promise<ServiceResponse<MachineryTypeResponse[]>> => {
    return await getMachineryTypesByStatus('active');
};

// Get inactive machinery types only
export const getInactiveMachineryTypes = async (): Promise<ServiceResponse<MachineryTypeResponse[]>> => {
    return await getMachineryTypesByStatus('inactive');
};

export default {
    createMachineryType,
    getAllMachineryTypes,
    getMachineryTypeById,
    updateMachineryType,
    deleteMachineryType,
    getMachineryTypesByStatus,
    searchMachineryTypes,
    getActiveMachineryTypes,
    getInactiveMachineryTypes,
};
