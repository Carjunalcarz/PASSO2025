import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for building depreciation
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_DEPRECIATION_COLLECTION_ID || 'building_depreciation';

/**
 * Building Depreciation Service
 * Handles all CRUD operations for building depreciation
 */

// Types
export interface BuildingDepreciationData {
    name: string;
    age: number;
    rate: number;
    effectivity_date: string;
    status: string;
    building_structural_types_id: string;
    building_code_id: string;
}

export interface BuildingDepreciationResponse {
    $id: string;
    name: string;
    age: number;
    rate: number;
    effectivity_date: string;
    status: string;
    building_structural_types_id: string;
    building_code_id: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new building depreciation
export const createBuildingDepreciation = async (data: BuildingDepreciationData): Promise<ServiceResponse<BuildingDepreciationResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                name: data.name,
                age: data.age || 0,
                rate: data.rate || 0,
                effectivity_date: data.effectivity_date,
                status: data.status || 'active',
                building_structural_types_id: data.building_structural_types_id,
                building_code_id: data.building_code_id,
            }
        );
        return { success: true, data: response as unknown as BuildingDepreciationResponse };
    } catch (error: any) {
        console.error('Error creating building depreciation:', error);
        return { success: false, error: error.message };
    }
};

// Get all building depreciations
export const getAllBuildingDepreciations = async (): Promise<ServiceResponse<BuildingDepreciationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingDepreciationResponse[] };
    } catch (error: any) {
        console.error('Error fetching building depreciations:', error);
        return { success: false, error: error.message };
    }
};

// Get a single building depreciation by ID
export const getBuildingDepreciationById = async (id: string): Promise<ServiceResponse<BuildingDepreciationResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as BuildingDepreciationResponse };
    } catch (error: any) {
        console.error('Error fetching building depreciation:', error);
        return { success: false, error: error.message };
    }
};

// Update a building depreciation
export const updateBuildingDepreciation = async (id: string, data: Partial<BuildingDepreciationData>): Promise<ServiceResponse<BuildingDepreciationResponse>> => {
    try {
        const updateData: Partial<BuildingDepreciationData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.age !== undefined) updateData.age = data.age;
        if (data.rate !== undefined) updateData.rate = data.rate;
        if (data.effectivity_date !== undefined) updateData.effectivity_date = data.effectivity_date;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.building_structural_types_id !== undefined) updateData.building_structural_types_id = data.building_structural_types_id;
        if (data.building_code_id !== undefined) updateData.building_code_id = data.building_code_id;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as BuildingDepreciationResponse };
    } catch (error: any) {
        console.error('Error updating building depreciation:', error);
        return { success: false, error: error.message };
    }
};

// Delete a building depreciation
export const deleteBuildingDepreciation = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting building depreciation:', error);
        return { success: false, error: error.message };
    }
};

// Get building depreciations by status
export const getBuildingDepreciationsByStatus = async (status: string): Promise<ServiceResponse<BuildingDepreciationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingDepreciationResponse[] };
    } catch (error: any) {
        console.error('Error fetching building depreciations by status:', error);
        return { success: false, error: error.message };
    }
};

// Get building depreciations by structural type
export const getBuildingDepreciationsByStructuralType = async (structuralTypeId: string): Promise<ServiceResponse<BuildingDepreciationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('building_structural_types_id', structuralTypeId),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingDepreciationResponse[] };
    } catch (error: any) {
        console.error('Error fetching building depreciations by structural type:', error);
        return { success: false, error: error.message };
    }
};

// Get building depreciations by building code
export const getBuildingDepreciationsByBuildingCode = async (buildingCodeId: string): Promise<ServiceResponse<BuildingDepreciationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('building_code_id', buildingCodeId),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingDepreciationResponse[] };
    } catch (error: any) {
        console.error('Error fetching building depreciations by building code:', error);
        return { success: false, error: error.message };
    }
};

// Search building depreciations by name
export const searchBuildingDepreciations = async (searchTerm: string): Promise<ServiceResponse<BuildingDepreciationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingDepreciationResponse[] };
    } catch (error: any) {
        console.error('Error searching building depreciations:', error);
        return { success: false, error: error.message };
    }
};

// Get active building depreciations only
export const getActiveBuildingDepreciations = async (): Promise<ServiceResponse<BuildingDepreciationResponse[]>> => {
    return await getBuildingDepreciationsByStatus('active');
};

// Get inactive building depreciations only
export const getInactiveBuildingDepreciations = async (): Promise<ServiceResponse<BuildingDepreciationResponse[]>> => {
    return await getBuildingDepreciationsByStatus('inactive');
};

export default {
    createBuildingDepreciation,
    getAllBuildingDepreciations,
    getBuildingDepreciationById,
    updateBuildingDepreciation,
    deleteBuildingDepreciation,
    getBuildingDepreciationsByStatus,
    getBuildingDepreciationsByStructuralType,
    getBuildingDepreciationsByBuildingCode,
    searchBuildingDepreciations,
    getActiveBuildingDepreciations,
    getInactiveBuildingDepreciations,
};
