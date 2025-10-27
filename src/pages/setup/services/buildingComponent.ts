import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for building components
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_COMPONENTS_COLLECTION_ID || 'building_components';

/**
 * Building Component Service
 * Handles all CRUD operations for building components
 */

// Types
export interface BuildingComponentData {
    name: string;
    description: string;
    status: string;
}

export interface BuildingComponentResponse {
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

// Create a new building component
export const createBuildingComponent = async (data: BuildingComponentData): Promise<ServiceResponse<BuildingComponentResponse>> => {
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
        return { success: true, data: response as unknown as BuildingComponentResponse };
    } catch (error: any) {
        console.error('Error creating building component:', error);
        return { success: false, error: error.message };
    }
};

// Get all building components
export const getAllBuildingComponents = async (): Promise<ServiceResponse<BuildingComponentResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingComponentResponse[] };
    } catch (error: any) {
        console.error('Error fetching building components:', error);
        return { success: false, error: error.message };
    }
};

// Get a single building component by ID
export const getBuildingComponentById = async (id: string): Promise<ServiceResponse<BuildingComponentResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as BuildingComponentResponse };
    } catch (error: any) {
        console.error('Error fetching building component:', error);
        return { success: false, error: error.message };
    }
};

// Update a building component
export const updateBuildingComponent = async (id: string, data: Partial<BuildingComponentData>): Promise<ServiceResponse<BuildingComponentResponse>> => {
    try {
        const updateData: Partial<BuildingComponentData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as BuildingComponentResponse };
    } catch (error: any) {
        console.error('Error updating building component:', error);
        return { success: false, error: error.message };
    }
};

// Delete a building component
export const deleteBuildingComponent = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting building component:', error);
        return { success: false, error: error.message };
    }
};

// Get building components by status
export const getBuildingComponentsByStatus = async (status: string): Promise<ServiceResponse<BuildingComponentResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingComponentResponse[] };
    } catch (error: any) {
        console.error('Error fetching building components by status:', error);
        return { success: false, error: error.message };
    }
};

// Search building components by name
export const searchBuildingComponents = async (searchTerm: string): Promise<ServiceResponse<BuildingComponentResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingComponentResponse[] };
    } catch (error: any) {
        console.error('Error searching building components:', error);
        return { success: false, error: error.message };
    }
};

// Get active building components only
export const getActiveBuildingComponents = async (): Promise<ServiceResponse<BuildingComponentResponse[]>> => {
    return await getBuildingComponentsByStatus('active');
};

// Get inactive building components only
export const getInactiveBuildingComponents = async (): Promise<ServiceResponse<BuildingComponentResponse[]>> => {
    return await getBuildingComponentsByStatus('inactive');
};

export default {
    createBuildingComponent,
    getAllBuildingComponents,
    getBuildingComponentById,
    updateBuildingComponent,
    deleteBuildingComponent,
    getBuildingComponentsByStatus,
    searchBuildingComponents,
    getActiveBuildingComponents,
    getInactiveBuildingComponents,
};
