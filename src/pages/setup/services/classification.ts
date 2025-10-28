import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for classifications
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_CLASSIFICATIONS_COLLECTION_ID || 'classifications';

/**
 * Classification Service
 * Handles all CRUD operations for classifications
 */

// Types
export interface ClassificationData {
    name: string;
    description: string;
    status: string;
}

export interface ClassificationResponse {
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

// Create a new classification
export const createClassification = async (data: ClassificationData): Promise<ServiceResponse<ClassificationResponse>> => {
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
        return { success: true, data: response as unknown as ClassificationResponse };
    } catch (error: any) {
        console.error('Error creating classification:', error);
        return { success: false, error: error.message };
    }
};

// Get all classifications
export const getAllClassifications = async (): Promise<ServiceResponse<ClassificationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as ClassificationResponse[] };
    } catch (error: any) {
        console.error('Error fetching classifications:', error);
        return { success: false, error: error.message };
    }
};

// Get a single classification by ID
export const getClassificationById = async (id: string): Promise<ServiceResponse<ClassificationResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as ClassificationResponse };
    } catch (error: any) {
        console.error('Error fetching classification:', error);
        return { success: false, error: error.message };
    }
};

// Update a classification
export const updateClassification = async (id: string, data: Partial<ClassificationData>): Promise<ServiceResponse<ClassificationResponse>> => {
    try {
        const updateData: Partial<ClassificationData> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as ClassificationResponse };
    } catch (error: any) {
        console.error('Error updating classification:', error);
        return { success: false, error: error.message };
    }
};

// Delete a classification
export const deleteClassification = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting classification:', error);
        return { success: false, error: error.message };
    }
};

// Get classifications by status
export const getClassificationsByStatus = async (status: string): Promise<ServiceResponse<ClassificationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as ClassificationResponse[] };
    } catch (error: any) {
        console.error('Error fetching classifications by status:', error);
        return { success: false, error: error.message };
    }
};

// Search classifications by name
export const searchClassifications = async (searchTerm: string): Promise<ServiceResponse<ClassificationResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as ClassificationResponse[] };
    } catch (error: any) {
        console.error('Error searching classifications:', error);
        return { success: false, error: error.message };
    }
};

// Get active classifications only
export const getActiveClassifications = async (): Promise<ServiceResponse<ClassificationResponse[]>> => {
    return await getClassificationsByStatus('active');
};

// Get inactive classifications only
export const getInactiveClassifications = async (): Promise<ServiceResponse<ClassificationResponse[]>> => {
    return await getClassificationsByStatus('inactive');
};

export default {
    createClassification,
    getAllClassifications,
    getClassificationById,
    updateClassification,
    deleteClassification,
    getClassificationsByStatus,
    searchClassifications,
    getActiveClassifications,
    getInactiveClassifications,
};
