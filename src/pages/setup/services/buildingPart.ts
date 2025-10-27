import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for building parts
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_PARTS_COLLECTION_ID || 'building_parts';

/**
 * Building Part Service
 * Handles all CRUD operations for building parts
 */

// Types
export interface BuildingPartData {
    name: string;
    description?: string;
    status: string;
    building_components_id: string;
}

export interface BuildingPartResponse {
    $id: string;
    name: string;
    description?: string;
    status: string;
    building_components_id: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new building part
export const createBuildingPart = async (data: BuildingPartData): Promise<ServiceResponse<BuildingPartResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                name: data.name,
                description: data.description || '',
                status: data.status || 'active',
                building_components_id: data.building_components_id,
            }
        );
        return { success: true, data: response as unknown as BuildingPartResponse };
    } catch (error: any) {
        console.error('Error creating building part:', error);
        return { success: false, error: error.message };
    }
};

// Get all building parts
export const getAllBuildingParts = async (): Promise<ServiceResponse<BuildingPartResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingPartResponse[] };
    } catch (error: any) {
        console.error('Error fetching building parts:', error);
        return { success: false, error: error.message };
    }
};

// Get a single building part by ID
export const getBuildingPartById = async (id: string): Promise<ServiceResponse<BuildingPartResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as BuildingPartResponse };
    } catch (error: any) {
        console.error('Error fetching building part:', error);
        return { success: false, error: error.message };
    }
};

// Update a building part
export const updateBuildingPart = async (id: string, data: Partial<BuildingPartData>): Promise<ServiceResponse<BuildingPartResponse>> => {
    try {
        const updateData: Partial<BuildingPartData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.building_components_id !== undefined) updateData.building_components_id = data.building_components_id;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as BuildingPartResponse };
    } catch (error: any) {
        console.error('Error updating building part:', error);
        return { success: false, error: error.message };
    }
};

// Delete a building part
export const deleteBuildingPart = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting building part:', error);
        return { success: false, error: error.message };
    }
};

// Get building parts by status
export const getBuildingPartsByStatus = async (status: string): Promise<ServiceResponse<BuildingPartResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingPartResponse[] };
    } catch (error: any) {
        console.error('Error fetching building parts by status:', error);
        return { success: false, error: error.message };
    }
};

// Get building parts by component ID
export const getBuildingPartsByComponentId = async (componentId: string): Promise<ServiceResponse<BuildingPartResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('building_components_id', componentId),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingPartResponse[] };
    } catch (error: any) {
        console.error('Error fetching building parts by component ID:', error);
        return { success: false, error: error.message };
    }
};

// Search building parts by name or code
export const searchBuildingParts = async (searchTerm: string): Promise<ServiceResponse<BuildingPartResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingPartResponse[] };
    } catch (error: any) {
        console.error('Error searching building parts:', error);
        return { success: false, error: error.message };
    }
};

// Get active building parts only
export const getActiveBuildingParts = async (): Promise<ServiceResponse<BuildingPartResponse[]>> => {
    return await getBuildingPartsByStatus('active');
};

// Get inactive building parts only
export const getInactiveBuildingParts = async (): Promise<ServiceResponse<BuildingPartResponse[]>> => {
    return await getBuildingPartsByStatus('inactive');
};

export default {
    createBuildingPart,
    getAllBuildingParts,
    getBuildingPartById,
    updateBuildingPart,
    deleteBuildingPart,
    getBuildingPartsByStatus,
    getBuildingPartsByComponentId,
    searchBuildingParts,
    getActiveBuildingParts,
    getInactiveBuildingParts,
};
