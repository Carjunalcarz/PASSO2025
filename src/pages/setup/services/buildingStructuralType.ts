import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for building structural types
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_STRUCTURAL_TYPES_COLLECTION_ID || 'building_structural_types';

/**
 * Building Structural Type Service
 * Handles all CRUD operations for building structural types
 */

// Types
export interface BuildingStructuralTypeData {
    name: string;
    description: string;
    status: string;
}

export interface BuildingStructuralTypeResponse {
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

// Create a new building structural type
export const createBuildingStructuralType = async (data: BuildingStructuralTypeData): Promise<ServiceResponse<BuildingStructuralTypeResponse>> => {
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
        return { success: true, data: response as unknown as BuildingStructuralTypeResponse };
    } catch (error: any) {
        console.error('Error creating building structural type:', error);
        return { success: false, error: error.message };
    }
};

// Get all building structural types
export const getAllBuildingStructuralTypes = async (): Promise<ServiceResponse<BuildingStructuralTypeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingStructuralTypeResponse[] };
    } catch (error: any) {
        console.error('Error fetching building structural types:', error);
        return { success: false, error: error.message };
    }
};

// Get a single building structural type by ID
export const getBuildingStructuralTypeById = async (id: string): Promise<ServiceResponse<BuildingStructuralTypeResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as BuildingStructuralTypeResponse };
    } catch (error: any) {
        console.error('Error fetching building structural type:', error);
        return { success: false, error: error.message };
    }
};

// Update a building structural type
export const updateBuildingStructuralType = async (id: string, data: Partial<BuildingStructuralTypeData>): Promise<ServiceResponse<BuildingStructuralTypeResponse>> => {
    try {
        const updateData: Partial<BuildingStructuralTypeData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as BuildingStructuralTypeResponse };
    } catch (error: any) {
        console.error('Error updating building structural type:', error);
        return { success: false, error: error.message };
    }
};

// Delete a building structural type
export const deleteBuildingStructuralType = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting building structural type:', error);
        return { success: false, error: error.message };
    }
};

// Get building structural types by status
export const getBuildingStructuralTypesByStatus = async (status: string): Promise<ServiceResponse<BuildingStructuralTypeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingStructuralTypeResponse[] };
    } catch (error: any) {
        console.error('Error fetching building structural types by status:', error);
        return { success: false, error: error.message };
    }
};

// Search building structural types by name
export const searchBuildingStructuralTypes = async (searchTerm: string): Promise<ServiceResponse<BuildingStructuralTypeResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingStructuralTypeResponse[] };
    } catch (error: any) {
        console.error('Error searching building structural types:', error);
        return { success: false, error: error.message };
    }
};

// Get active building structural types only
export const getActiveBuildingStructuralTypes = async (): Promise<ServiceResponse<BuildingStructuralTypeResponse[]>> => {
    return await getBuildingStructuralTypesByStatus('active');
};

// Get inactive building structural types only
export const getInactiveBuildingStructuralTypes = async (): Promise<ServiceResponse<BuildingStructuralTypeResponse[]>> => {
    return await getBuildingStructuralTypesByStatus('inactive');
};

export default {
    createBuildingStructuralType,
    getAllBuildingStructuralTypes,
    getBuildingStructuralTypeById,
    updateBuildingStructuralType,
    deleteBuildingStructuralType,
    getBuildingStructuralTypesByStatus,
    searchBuildingStructuralTypes,
    getActiveBuildingStructuralTypes,
    getInactiveBuildingStructuralTypes,
};
