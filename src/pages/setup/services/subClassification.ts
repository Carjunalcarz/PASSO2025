import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for sub-classifications
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_SUB_CLASSIFICATIONS_COLLECTION_ID || 'sub_classifications';

/**
 * Sub-Classification Service
 * Handles all CRUD operations for sub-classifications
 */

// Types
export interface SubClassificationData {
    name: string;
    description: string;
    status: string;
    classification_id: string;
}

export interface SubClassificationResponse {
    $id: string;
    name: string;
    description: string;
    status: string;
    classification_id: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new sub-classification
export const createSubClassification = async (data: SubClassificationData): Promise<ServiceResponse<SubClassificationResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                name: data.name,
                description: data.description || '',
                status: data.status || 'active',
                classification_id: data.classification_id,
            }
        );
        return { success: true, data: response as unknown as SubClassificationResponse };
    } catch (error: any) {
        console.error('Error creating sub-classification:', error);
        return { success: false, error: error.message };
    }
};

// Get all sub-classifications
export const getAllSubClassifications = async (): Promise<ServiceResponse<SubClassificationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as SubClassificationResponse[] };
    } catch (error: any) {
        console.error('Error fetching sub-classifications:', error);
        return { success: false, error: error.message };
    }
};

// Get a single sub-classification by ID
export const getSubClassificationById = async (id: string): Promise<ServiceResponse<SubClassificationResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as SubClassificationResponse };
    } catch (error: any) {
        console.error('Error fetching sub-classification:', error);
        return { success: false, error: error.message };
    }
};

// Get sub-classifications by classification ID
export const getSubClassificationsByClassificationId = async (classificationId: string): Promise<ServiceResponse<SubClassificationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('classification_id', classificationId),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as SubClassificationResponse[] };
    } catch (error: any) {
        console.error('Error fetching sub-classifications by classification:', error);
        return { success: false, error: error.message };
    }
};

// Update a sub-classification
export const updateSubClassification = async (id: string, data: Partial<SubClassificationData>): Promise<ServiceResponse<SubClassificationResponse>> => {
    try {
        const updateData: Partial<SubClassificationData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.classification_id !== undefined) updateData.classification_id = data.classification_id;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as SubClassificationResponse };
    } catch (error: any) {
        console.error('Error updating sub-classification:', error);
        return { success: false, error: error.message };
    }
};

// Delete a sub-classification
export const deleteSubClassification = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting sub-classification:', error);
        return { success: false, error: error.message };
    }
};

// Get sub-classifications by status
export const getSubClassificationsByStatus = async (status: string): Promise<ServiceResponse<SubClassificationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as SubClassificationResponse[] };
    } catch (error: any) {
        console.error('Error fetching sub-classifications by status:', error);
        return { success: false, error: error.message };
    }
};

// Search sub-classifications by name
export const searchSubClassifications = async (searchTerm: string): Promise<ServiceResponse<SubClassificationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as SubClassificationResponse[] };
    } catch (error: any) {
        console.error('Error searching sub-classifications:', error);
        return { success: false, error: error.message };
    }
};

// Get active sub-classifications only
export const getActiveSubClassifications = async (): Promise<ServiceResponse<SubClassificationResponse[]>> => {
    return await getSubClassificationsByStatus('active');
};

// Get inactive sub-classifications only
export const getInactiveSubClassifications = async (): Promise<ServiceResponse<SubClassificationResponse[]>> => {
    return await getSubClassificationsByStatus('inactive');
};

export default {
    createSubClassification,
    getAllSubClassifications,
    getSubClassificationById,
    getSubClassificationsByClassificationId,
    updateSubClassification,
    deleteSubClassification,
    getSubClassificationsByStatus,
    searchSubClassifications,
    getActiveSubClassifications,
    getInactiveSubClassifications,
};
