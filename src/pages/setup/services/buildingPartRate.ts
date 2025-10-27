import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for building part rates
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_PART_RATES_COLLECTION_ID || 'building_part_rates';

/**
 * Building Part Rate Service
 * Handles all CRUD operations for building part rates
 */

// Types
export interface BuildingPartRateData {
    building_part_rate_id?: string;
    unit_value: number;
    status: string;
    building_parts_id: string;
}

export interface BuildingPartRateResponse {
    $id: string;
    building_part_rate_id: string;
    unit_value: number;
    status: string;
    building_parts_id: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new building part rate
export const createBuildingPartRate = async (data: BuildingPartRateData): Promise<ServiceResponse<BuildingPartRateResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                building_part_rate_id: data.building_part_rate_id,
                unit_value: data.unit_value || 0,
                status: data.status || 'active',
                building_parts_id: data.building_parts_id,
            }
        );
        return { success: true, data: response as unknown as BuildingPartRateResponse };
    } catch (error: any) {
        console.error('Error creating building part rate:', error);
        return { success: false, error: error.message };
    }
};

// Get all building part rates
export const getAllBuildingPartRates = async (): Promise<ServiceResponse<BuildingPartRateResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingPartRateResponse[] };
    } catch (error: any) {
        console.error('Error fetching building part rates:', error);
        return { success: false, error: error.message };
    }
};

// Get a single building part rate by ID
export const getBuildingPartRateById = async (id: string): Promise<ServiceResponse<BuildingPartRateResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as BuildingPartRateResponse };
    } catch (error: any) {
        console.error('Error fetching building part rate:', error);
        return { success: false, error: error.message };
    }
};

// Update a building part rate
export const updateBuildingPartRate = async (id: string, data: Partial<BuildingPartRateData>): Promise<ServiceResponse<BuildingPartRateResponse>> => {
    try {
        const updateData: Partial<BuildingPartRateData> = {};
        if (data.building_part_rate_id !== undefined) updateData.building_part_rate_id = data.building_part_rate_id;
        if (data.unit_value !== undefined) updateData.unit_value = data.unit_value;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.building_parts_id !== undefined) updateData.building_parts_id = data.building_parts_id;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as BuildingPartRateResponse };
    } catch (error: any) {
        console.error('Error updating building part rate:', error);
        return { success: false, error: error.message };
    }
};

// Delete a building part rate
export const deleteBuildingPartRate = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting building part rate:', error);
        return { success: false, error: error.message };
    }
};

// Get building part rates by status
export const getBuildingPartRatesByStatus = async (status: string): Promise<ServiceResponse<BuildingPartRateResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingPartRateResponse[] };
    } catch (error: any) {
        console.error('Error fetching building part rates by status:', error);
        return { success: false, error: error.message };
    }
};

// Get building part rates by building parts ID
export const getBuildingPartRatesByBuildingPartsId = async (buildingPartsId: string): Promise<ServiceResponse<BuildingPartRateResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('building_parts_id', buildingPartsId),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as BuildingPartRateResponse[] };
    } catch (error: any) {
        console.error('Error fetching building part rates by building parts ID:', error);
        return { success: false, error: error.message };
    }
};

// Get active building part rates only
export const getActiveBuildingPartRates = async (): Promise<ServiceResponse<BuildingPartRateResponse[]>> => {
    return await getBuildingPartRatesByStatus('active');
};

// Get inactive building part rates only
export const getInactiveBuildingPartRates = async (): Promise<ServiceResponse<BuildingPartRateResponse[]>> => {
    return await getBuildingPartRatesByStatus('inactive');
};

export default {
    createBuildingPartRate,
    getAllBuildingPartRates,
    getBuildingPartRateById,
    updateBuildingPartRate,
    deleteBuildingPartRate,
    getBuildingPartRatesByStatus,
    getBuildingPartRatesByBuildingPartsId,
    getActiveBuildingPartRates,
    getInactiveBuildingPartRates,
};
