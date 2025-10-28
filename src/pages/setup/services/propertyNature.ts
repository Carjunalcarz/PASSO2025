import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for property nature
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROPERTY_NATURE_COLLECTION_ID || 'property_nature';

/**
 * Property Nature Service
 * Handles all CRUD operations for property nature
 */

// Types
export interface PropertyNatureData {
    name: string;
    building_part_rate_id?: string;
    building_depreciation_id?: string;
    machinery_type_id?: string;
    product_id?: string;
    subclass_id?: string;
    subkind_id?: string;
    status?: string;
}

export interface PropertyNatureResponse {
    $id: string;
    name: string;
    building_part_rate_id: string;
    building_depreciation_id: string;
    machinery_type_id: string;
    product_id: string;
    subclass_id: string;
    subkind_id: string;
    status: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new property nature
export const createPropertyNature = async (data: PropertyNatureData): Promise<ServiceResponse<PropertyNatureResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                name: data.name,
                building_part_rate_id: data.building_part_rate_id || '',
                building_depreciation_id: data.building_depreciation_id || '',
                machinery_type_id: data.machinery_type_id || '',
                product_id: data.product_id || '',
                subclass_id: data.subclass_id || '',
                subkind_id: data.subkind_id || '',
                status: data.status || 'active',
            }
        );
        return { success: true, data: response as unknown as PropertyNatureResponse };
    } catch (error: any) {
        console.error('Error creating property nature:', error);
        return { success: false, error: error.message };
    }
};

// Get all property natures
export const getAllPropertyNatures = async (): Promise<ServiceResponse<PropertyNatureResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [Query.orderDesc('$createdAt')]
        );
        return { success: true, data: response.documents as unknown as PropertyNatureResponse[] };
    } catch (error: any) {
        console.error('Error fetching property natures:', error);
        return { success: false, error: error.message };
    }
};

// Get property nature by ID
export const getPropertyNatureById = async (id: string): Promise<ServiceResponse<PropertyNatureResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as PropertyNatureResponse };
    } catch (error: any) {
        console.error('Error fetching property nature:', error);
        return { success: false, error: error.message };
    }
};

// Update property nature
export const updatePropertyNature = async (id: string, data: Partial<PropertyNatureData>): Promise<ServiceResponse<PropertyNatureResponse>> => {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            {
                ...(data.name && { name: data.name }),
                ...(data.building_part_rate_id !== undefined && { building_part_rate_id: data.building_part_rate_id }),
                ...(data.building_depreciation_id !== undefined && { building_depreciation_id: data.building_depreciation_id }),
                ...(data.machinery_type_id !== undefined && { machinery_type_id: data.machinery_type_id }),
                ...(data.product_id !== undefined && { product_id: data.product_id }),
                ...(data.subclass_id !== undefined && { subclass_id: data.subclass_id }),
                ...(data.subkind_id !== undefined && { subkind_id: data.subkind_id }),
                ...(data.status && { status: data.status }),
            }
        );
        return { success: true, data: response as unknown as PropertyNatureResponse };
    } catch (error: any) {
        console.error('Error updating property nature:', error);
        return { success: false, error: error.message };
    }
};

// Delete property nature
export const deletePropertyNature = async (id: string): Promise<ServiceResponse<void>> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting property nature:', error);
        return { success: false, error: error.message };
    }
};

// Get property natures by status
export const getPropertyNaturesByStatus = async (status: string): Promise<ServiceResponse<PropertyNatureResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as PropertyNatureResponse[] };
    } catch (error: any) {
        console.error('Error fetching property natures by status:', error);
        return { success: false, error: error.message };
    }
};

// Search property natures by name
export const searchPropertyNatures = async (searchTerm: string): Promise<ServiceResponse<PropertyNatureResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as PropertyNatureResponse[] };
    } catch (error: any) {
        console.error('Error searching property natures:', error);
        return { success: false, error: error.message };
    }
};
