import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for building codes
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_CODES_COLLECTION_ID || 'building_codes';

/**
 * Building Code Service
 * Handles all CRUD operations for building codes
 */

// Types
export interface BuildingCodeData {
    name: string;
    description: string;
    status: string;
}

export interface BuildingCodeResponse {
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

// Create a new building code
export const createBuildingCode = async (data: BuildingCodeData): Promise<ServiceResponse<BuildingCodeResponse>> => {
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
        return { success: true, data: response as unknown as BuildingCodeResponse };
    } catch (error: any) {
        console.error('Error creating building code:', error);
        return { success: false, error: error.message };
    }
};

// Get all building codes
export const getAllBuildingCodes = async (): Promise<ServiceResponse<BuildingCodeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingCodeResponse[] };
    } catch (error: any) {
        console.error('Error fetching building codes:', error);
        return { success: false, error: error.message };
    }
};

// Get a single building code by ID
export const getBuildingCodeById = async (id: string): Promise<ServiceResponse<BuildingCodeResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as BuildingCodeResponse };
    } catch (error: any) {
        console.error('Error fetching building code:', error);
        return { success: false, error: error.message };
    }
};

// Update a building code
export const updateBuildingCode = async (id: string, data: Partial<BuildingCodeData>): Promise<ServiceResponse<BuildingCodeResponse>> => {
    try {
        const updateData: Partial<BuildingCodeData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as BuildingCodeResponse };
    } catch (error: any) {
        console.error('Error updating building code:', error);
        return { success: false, error: error.message };
    }
};

// Delete a building code
export const deleteBuildingCode = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting building code:', error);
        return { success: false, error: error.message };
    }
};

// Get building codes by status
export const getBuildingCodesByStatus = async (status: string): Promise<ServiceResponse<BuildingCodeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingCodeResponse[] };
    } catch (error: any) {
        console.error('Error fetching building codes by status:', error);
        return { success: false, error: error.message };
    }
};

// Search building codes by name
export const searchBuildingCodes = async (searchTerm: string): Promise<ServiceResponse<BuildingCodeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingCodeResponse[] };
    } catch (error: any) {
        console.error('Error searching building codes:', error);
        return { success: false, error: error.message };
    }
};

// Get active building codes only
export const getActiveBuildingCodes = async (): Promise<ServiceResponse<BuildingCodeResponse[]>> => {
    return await getBuildingCodesByStatus('active');
};

// Get inactive building codes only
export const getInactiveBuildingCodes = async (): Promise<ServiceResponse<BuildingCodeResponse[]>> => {
    return await getBuildingCodesByStatus('inactive');
};

export default {
    createBuildingCode,
    getAllBuildingCodes,
    getBuildingCodeById,
    updateBuildingCode,
    deleteBuildingCode,
    getBuildingCodesByStatus,
    searchBuildingCodes,
    getActiveBuildingCodes,
    getInactiveBuildingCodes,
};
