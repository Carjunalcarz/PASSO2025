import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for persons
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PERSONS_COLLECTION_ID || 'persons';

/**
 * Person Service
 * Handles all CRUD operations for persons
 */

// Types
export interface PersonData {
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    status: string;
    ownerTypeId?: string;
    barangayId?: string;
    street?: string;
    tin?: string;
    contactNo?: string;
    uid?: string;
}

export interface PersonResponse {
    $id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    status: string;
    ownerTypeId?: string;
    barangayId?: string;
    street?: string;
    tin?: string;
    contactNo?: string;
    uid?: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new person
export const createPerson = async (data: PersonData): Promise<ServiceResponse<PersonResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                firstName: data.firstName,
                lastName: data.lastName,
                middleName: data.middleName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                dateOfBirth: data.dateOfBirth || '',
                status: data.status || 'active',
                ownerTypeId: data.ownerTypeId || '',
                barangayId: data.barangayId || '',
                street: data.street || '',
                tin: data.tin || '',
                contactNo: data.contactNo || '',
                uid: data.uid || '',
            }
        );
        return { success: true, data: response as unknown as PersonResponse };
    } catch (error: any) {
        console.error('Error creating person:', error);
        return { success: false, error: error.message };
    }
};

// Get all persons
export const getAllPersons = async (): Promise<ServiceResponse<PersonResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100) // Adjust limit as needed
            ]
        );
        return { success: true, data: response.documents as unknown as PersonResponse[] };
    } catch (error: any) {
        console.error('Error fetching persons:', error);
        return { success: false, error: error.message };
    }
};

// Get a single person by ID
export const getPersonById = async (id: string): Promise<ServiceResponse<PersonResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: response as unknown as PersonResponse };
    } catch (error: any) {
        console.error('Error fetching person:', error);
        return { success: false, error: error.message };
    }
};

// Update a person
export const updatePerson = async (id: string, data: Partial<PersonData>): Promise<ServiceResponse<PersonResponse>> => {
    try {
        const updateData: any = {};
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.middleName !== undefined) updateData.middleName = data.middleName;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.ownerTypeId !== undefined) updateData.ownerTypeId = data.ownerTypeId;
        if (data.barangayId !== undefined) updateData.barangayId = data.barangayId;
        if (data.street !== undefined) updateData.street = data.street;
        if (data.tin !== undefined) updateData.tin = data.tin;
        if (data.contactNo !== undefined) updateData.contactNo = data.contactNo;
        if (data.uid !== undefined) updateData.uid = data.uid;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: response as unknown as PersonResponse };
    } catch (error: any) {
        console.error('Error updating person:', error);
        return { success: false, error: error.message };
    }
};

// Delete a person
export const deletePerson = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting person:', error);
        return { success: false, error: error.message };
    }
};

// Get persons by status
export const getPersonsByStatus = async (status: string): Promise<ServiceResponse<PersonResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('status', status),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as PersonResponse[] };
    } catch (error: any) {
        console.error('Error fetching persons by status:', error);
        return { success: false, error: error.message };
    }
};

// Search persons by name
export const searchPersons = async (searchTerm: string): Promise<ServiceResponse<PersonResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.search('firstName', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents as unknown as PersonResponse[] };
    } catch (error: any) {
        console.error('Error searching persons:', error);
        return { success: false, error: error.message };
    }
};

// Get active persons only
export const getActivePersons = async (): Promise<ServiceResponse<PersonResponse[]>> => {
    return await getPersonsByStatus('active');
};

// Get inactive persons only
export const getInactivePersons = async (): Promise<ServiceResponse<PersonResponse[]>> => {
    return await getPersonsByStatus('inactive');
};

export default {
    createPerson,
    getAllPersons,
    getPersonById,
    updatePerson,
    deletePerson,
    getPersonsByStatus,
    searchPersons,
    getActivePersons,
    getInactivePersons,
};
