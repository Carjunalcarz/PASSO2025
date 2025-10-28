import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for machinery rates
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_MACHINERY_RATES_COLLECTION_ID || 'machinery_rates';

/**
 * Machinery Rates Service
 * Handles all CRUD operations for machinery rates
 */

// Types
export interface MachineryRateData {
    name: string;
    rate: number;
    effectivity_date: string;
    status: string;
    machinery_type_id: string;
}

export interface MachineryRateResponse {
    $id: string;
    name: string;
    rate: number;
    effectivity_date: string;
    status: string;
    machinery_type_id: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new machinery rate
export const createMachineryRate = async (data: MachineryRateData): Promise<ServiceResponse<MachineryRateResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                name: data.name,
                rate: data.rate || 0,
                effectivity_date: data.effectivity_date,
                status: data.status || 'active',
                machinery_type_id: data.machinery_type_id,
            }
        );
        return { success: true, data: response as unknown as MachineryRateResponse };
    } catch (error: any) {
        console.error('Error creating machinery rate:', error);
        return { success: false, error: error.message };
    }
};

// Get all machinery rates
export const getAllMachineryRates = async (): Promise<ServiceResponse<MachineryRateResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as MachineryRateResponse[] };
    } catch (error: any) {
        console.error('Error fetching machinery rates:', error);
        return { success: false, error: error.message };
    }
};

// Get a single machinery rate by ID
export const getMachineryRateById = async (id: string): Promise<ServiceResponse<MachineryRateResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as MachineryRateResponse };
    } catch (error: any) {
        console.error('Error fetching machinery rate:', error);
        return { success: false, error: error.message };
    }
};

// Update a machinery rate
export const updateMachineryRate = async (id: string, data: Partial<MachineryRateData>): Promise<ServiceResponse<MachineryRateResponse>> => {
    try {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.rate !== undefined) updateData.rate = data.rate;
        if (data.effectivity_date !== undefined) updateData.effectivity_date = data.effectivity_date;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.machinery_type_id !== undefined) updateData.machinery_type_id = data.machinery_type_id;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as MachineryRateResponse };
    } catch (error: any) {
        console.error('Error updating machinery rate:', error);
        return { success: false, error: error.message };
    }
};

// Delete a machinery rate
export const deleteMachineryRate = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting machinery rate:', error);
        return { success: false, error: error.message };
    }
};

// Get machinery rates by status
export const getMachineryRatesByStatus = async (status: string): Promise<ServiceResponse<MachineryRateResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as MachineryRateResponse[] };
    } catch (error: any) {
        console.error('Error fetching machinery rates by status:', error);
        return { success: false, error: error.message };
    }
};

// Get machinery rates by machinery type
export const getMachineryRatesByType = async (machineryTypeId: string): Promise<ServiceResponse<MachineryRateResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('machinery_type_id', machineryTypeId),
                Query.orderDesc('effectivity_date')
            ]
        );
        return { success: true, data: response.documents as unknown as MachineryRateResponse[] };
    } catch (error: any) {
        console.error('Error fetching machinery rates by type:', error);
        return { success: false, error: error.message };
    }
};

// Search machinery rates by name
export const searchMachineryRates = async (searchTerm: string): Promise<ServiceResponse<MachineryRateResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as MachineryRateResponse[] };
    } catch (error: any) {
        console.error('Error searching machinery rates:', error);
        return { success: false, error: error.message };
    }
};

// Get active machinery rates only
export const getActiveMachineryRates = async (): Promise<ServiceResponse<MachineryRateResponse[]>> => {
    return await getMachineryRatesByStatus('active');
};

// Get inactive machinery rates only
export const getInactiveMachineryRates = async (): Promise<ServiceResponse<MachineryRateResponse[]>> => {
    return await getMachineryRatesByStatus('inactive');
};

export default {
    createMachineryRate,
    getAllMachineryRates,
    getMachineryRateById,
    updateMachineryRate,
    deleteMachineryRate,
    getMachineryRatesByStatus,
    getMachineryRatesByType,
    searchMachineryRates,
    getActiveMachineryRates,
    getInactiveMachineryRates,
};
