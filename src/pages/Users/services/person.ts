import { databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for persons
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PERSONS_COLLECTION_ID || 'persons';

/**
 * Person Service
 * Handles all CRUD operations for persons
 */

// Mapper functions to convert between database (snake_case) and frontend (camelCase)
const mapDbToFrontend = (dbData: any): PersonResponse => {
    return {
        $id: dbData.$id,
        firstName: dbData.first_name || dbData.firstName || '',
        lastName: dbData.last_name || dbData.lastName || '',
        middleName: dbData.middle_name || dbData.middleName || '',
        status: dbData.status || 'active',
        ownerTypeId: dbData.owner_type_id || dbData.ownerTypeId || '',
        barangayId: dbData.barangay_id || dbData.barangayId || '',
        street: dbData.street || '',
        tin: dbData.tin || '',
        contactNo: dbData.contact_no || dbData.contactNo || '',
        uid: dbData.uid || '',
        teamIds: Array.isArray(dbData.team_ids) ? dbData.team_ids : (Array.isArray(dbData.teamIds) ? dbData.teamIds : (dbData.team_id || dbData.teamId ? [dbData.team_id || dbData.teamId] : [])),
        userAccountId: dbData.user_account_id || dbData.userAccountId || '',
        accountVerified: dbData.account_verified || dbData.accountVerified || false,
        email: dbData.email || '',
        $createdAt: dbData.$createdAt,
        $updatedAt: dbData.$updatedAt,
    };
};

// Types
export interface PersonData {
    firstName: string;
    lastName: string;
    middleName?: string;
    status: string;
    ownerTypeId?: string;
    barangayId?: string;
    street?: string;
    tin?: string;
    contactNo?: string;
    uid?: string;
    teamIds?: string[];
    userAccountId?: string;
    accountVerified?: boolean;
}

export interface PersonResponse {
    $id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    status: string;
    ownerTypeId?: string;
    barangayId?: string;
    street?: string;
    tin?: string;
    contactNo?: string;
    uid?: string;
    teamIds?: string[];
    userAccountId?: string;
    accountVerified?: boolean;
    email?: string;
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
                first_name: data.firstName,
                last_name: data.lastName,
                middle_name: data.middleName || '',
                status: data.status || 'active',
                owner_type_id: data.ownerTypeId || '',
                barangay_id: data.barangayId || '',
                street: data.street || '',
                tin: data.tin || '',
                contact_no: data.contactNo || '',
                uid: data.uid || '',
                team_ids: data.teamIds || [],
                user_account_id: data.userAccountId || '',
            }
        );
        return { success: true, data: mapDbToFrontend(response) };
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
        
        // Fetch emails and verification status from user accounts for persons with userAccountId
        const USER_ACCOUNTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID || 'user_accounts';
        
        const personsWithEmails = await Promise.all(
            response.documents.map(async (doc) => {
                const person = mapDbToFrontend(doc);
                
                if (person.userAccountId) {
                    try {
                        // Query user account by appwrite_user_id
                        const userAccountResponse = await databases.listDocuments(
                            appwriteConfig.databaseId,
                            USER_ACCOUNTS_COLLECTION_ID,
                            [
                                Query.equal('appwrite_user_id', person.userAccountId),
                                Query.limit(1)
                            ]
                        );
                        
                        if (userAccountResponse.documents.length > 0) {
                            const userAccount = userAccountResponse.documents[0];
                            person.email = userAccount.email;
                            // Check if status is 'verified' in user account
                            person.accountVerified = userAccount.status === 'verified';
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch email for person ${person.$id}:`, error);
                    }
                }
                
                return person;
            })
        );
        
        return { success: true, data: personsWithEmails };
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
        return { success: true, data: mapDbToFrontend(response) };
    } catch (error: any) {
        console.error('Error fetching person:', error);
        return { success: false, error: error.message };
    }
};

// Update a person
export const updatePerson = async (id: string, data: Partial<PersonData>): Promise<ServiceResponse<PersonResponse>> => {
    try {
        const updateData: any = {};
        if (data.firstName !== undefined) updateData.first_name = data.firstName;
        if (data.lastName !== undefined) updateData.last_name = data.lastName;
        if (data.middleName !== undefined) updateData.middle_name = data.middleName;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.ownerTypeId !== undefined) updateData.owner_type_id = data.ownerTypeId;
        if (data.barangayId !== undefined) updateData.barangay_id = data.barangayId;
        if (data.street !== undefined) updateData.street = data.street;
        if (data.tin !== undefined) updateData.tin = data.tin;
        if (data.contactNo !== undefined) updateData.contact_no = data.contactNo;
        if (data.uid !== undefined) updateData.uid = data.uid;
        if (data.teamIds !== undefined) updateData.team_ids = data.teamIds;
        if (data.userAccountId !== undefined) updateData.user_account_id = data.userAccountId;
        if (data.accountVerified !== undefined) updateData.account_verified = data.accountVerified;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: mapDbToFrontend(response) };
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
        return { success: true, data: response.documents.map(mapDbToFrontend) };
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
                Query.search('first_name', searchTerm),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents.map(mapDbToFrontend) };
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
