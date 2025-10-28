import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for sub-kinds
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_SUB_KINDS_COLLECTION_ID || 'sub_kinds';

/**
 * Sub-Kind Service
 * Handles all CRUD operations for sub-kinds
 */

// Types
export interface SubKindData {
    name: string;
    description: string;
    status: string;
    kind_id: string;
}

export interface SubKindResponse {
    $id: string;
    name: string;
    description: string;
    status: string;
    kind_id: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new sub-kind
export const createSubKind = async (data: SubKindData): Promise<ServiceResponse<SubKindResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                name: data.name,
                description: data.description || '',
                status: data.status || 'active',
                kind_id: data.kind_id,
            }
        );
        return { success: true, data: response as unknown as SubKindResponse };
    } catch (error: any) {
        console.error('Error creating sub-kind:', error);
        return { success: false, error: error.message };
    }
};

// Get all sub-kinds
export const getAllSubKinds = async (): Promise<ServiceResponse<SubKindResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as SubKindResponse[] };
    } catch (error: any) {
        console.error('Error fetching sub-kinds:', error);
        return { success: false, error: error.message };
    }
};

// Get a single sub-kind by ID
export const getSubKindById = async (id: string): Promise<ServiceResponse<SubKindResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as SubKindResponse };
    } catch (error: any) {
        console.error('Error fetching sub-kind:', error);
        return { success: false, error: error.message };
    }
};

// Get sub-kinds by kind ID
export const getSubKindsByKindId = async (kindId: string): Promise<ServiceResponse<SubKindResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('kind_id', kindId),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as SubKindResponse[] };
    } catch (error: any) {
        console.error('Error fetching sub-kinds by kind:', error);
        return { success: false, error: error.message };
    }
};

// Update a sub-kind
export const updateSubKind = async (id: string, data: Partial<SubKindData>): Promise<ServiceResponse<SubKindResponse>> => {
    try {
        const updateData: Partial<SubKindData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.kind_id !== undefined) updateData.kind_id = data.kind_id;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as SubKindResponse };
    } catch (error: any) {
        console.error('Error updating sub-kind:', error);
        return { success: false, error: error.message };
    }
};

// Delete a sub-kind
export const deleteSubKind = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting sub-kind:', error);
        return { success: false, error: error.message };
    }
};

// Get sub-kinds by status
export const getSubKindsByStatus = async (status: string): Promise<ServiceResponse<SubKindResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as SubKindResponse[] };
    } catch (error: any) {
        console.error('Error fetching sub-kinds by status:', error);
        return { success: false, error: error.message };
    }
};

// Search sub-kinds by name
export const searchSubKinds = async (searchTerm: string): Promise<ServiceResponse<SubKindResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as SubKindResponse[] };
    } catch (error: any) {
        console.error('Error searching sub-kinds:', error);
        return { success: false, error: error.message };
    }
};

// Get active sub-kinds only
export const getActiveSubKinds = async (): Promise<ServiceResponse<SubKindResponse[]>> => {
    return await getSubKindsByStatus('active');
};

// Get inactive sub-kinds only
export const getInactiveSubKinds = async (): Promise<ServiceResponse<SubKindResponse[]>> => {
    return await getSubKindsByStatus('inactive');
};

export default {
    createSubKind,
    getAllSubKinds,
    getSubKindById,
    getSubKindsByKindId,
    updateSubKind,
    deleteSubKind,
    getSubKindsByStatus,
    searchSubKinds,
    getActiveSubKinds,
    getInactiveSubKinds,
};
