import { databases, appwriteConfig, account } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

// Collection ID for user accounts
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID || 'user_accounts';

/**
 * User Account Service
 * Handles all CRUD operations for user accounts
 * Links persons with Appwrite authentication users and teams
 */

// Mapper functions to convert between database (snake_case) and frontend (camelCase)
const mapDbToFrontend = (dbData: any): UserAccountResponse => {
    return {
        $id: dbData.$id,
        personId: dbData.person_id || dbData.personId || '',
        teamId: dbData.team_id || dbData.teamId || '',
        appwriteUserId: dbData.appwrite_user_id || dbData.appwriteUserId || '',
        email: dbData.email || '',
        role: dbData.role || '',
        status: dbData.status || 'active',
        lastLogin: dbData.last_login || dbData.lastLogin || '',
        $createdAt: dbData.$createdAt,
        $updatedAt: dbData.$updatedAt,
    };
};

// Types
export interface UserAccountData {
    personId: string;
    teamId?: string;
    appwriteUserId: string;
    email: string;
    role: string;
    status?: string;
    lastLogin?: string;
}

export interface UserAccountResponse {
    $id: string;
    personId: string;
    teamId?: string;
    appwriteUserId: string;
    email: string;
    role: string;
    status: string;
    lastLogin?: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface CreateUserAccountInput {
    personId: string;
    teamId?: string;
    email: string;
    password: string;
    role: string;
    name: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create user account database record only (auth user should already exist)
export const createUserAccountRecord = async (
    personId: string,
    appwriteUserId: string,
    email: string,
    role: string
): Promise<ServiceResponse<UserAccountResponse>> => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                person_id: personId,
                team_id: '',
                appwrite_user_id: appwriteUserId,
                email: email,
                role: role,
                status: 'active',
                last_login: '',
            }
        );

        return { success: true, data: mapDbToFrontend(response) };
    } catch (error: any) {
        console.error('Error creating user account record:', error);
        return { success: false, error: error.message };
    }
};

// Create a new user account (creates both Appwrite auth user and database record)
export const createUserAccount = async (data: CreateUserAccountInput): Promise<ServiceResponse<UserAccountResponse>> => {
    try {
        // First, create the Appwrite authentication user
        const authUser = await account.create(
            ID.unique(),
            data.email,
            data.password,
            data.name
        );

        // Then create the database record linking to the person
        const recordResult = await createUserAccountRecord(
            data.personId,
            authUser.$id,
            data.email,
            data.role
        );

        if (!recordResult.success) {
            // Note: Auth user is created but record failed
            // This leaves an orphaned auth user
            throw new Error(recordResult.error || 'Failed to create user account record');
        }

        return { success: true, data: recordResult.data };
    } catch (error: any) {
        console.error('Error creating user account:', error);
        return { success: false, error: error.message };
    }
};

// Get all user accounts
export const getAllUserAccounts = async (): Promise<ServiceResponse<UserAccountResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(100)
            ]
        );
        return { success: true, data: response.documents.map(mapDbToFrontend) };
    } catch (error: any) {
        console.error('Error fetching user accounts:', error);
        return { success: false, error: error.message };
    }
};

// Get a single user account by ID
export const getUserAccountById = async (id: string): Promise<ServiceResponse<UserAccountResponse>> => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true, data: mapDbToFrontend(response) };
    } catch (error: any) {
        console.error('Error fetching user account:', error);
        return { success: false, error: error.message };
    }
};

// Get user account by person ID
export const getUserAccountByPersonId = async (personId: string): Promise<ServiceResponse<UserAccountResponse | null>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('person_id', personId),
                Query.limit(1)
            ]
        );
        
        if (response.documents.length === 0) {
            return { success: true, data: null };
        }
        
        return { success: true, data: mapDbToFrontend(response.documents[0]) };
    } catch (error: any) {
        console.error('Error fetching user account by person ID:', error);
        return { success: false, error: error.message };
    }
};

// Get user account by Appwrite user ID
export const getUserAccountByAppwriteUserId = async (appwriteUserId: string): Promise<ServiceResponse<UserAccountResponse | null>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('appwrite_user_id', appwriteUserId),
                Query.limit(1)
            ]
        );
        
        if (response.documents.length === 0) {
            return { success: true, data: null };
        }
        
        return { success: true, data: mapDbToFrontend(response.documents[0]) };
    } catch (error: any) {
        console.error('Error fetching user account by Appwrite user ID:', error);
        return { success: false, error: error.message };
    }
};

// Update a user account
export const updateUserAccount = async (id: string, data: Partial<UserAccountData>): Promise<ServiceResponse<UserAccountResponse>> => {
    try {
        const updateData: any = {};
        if (data.personId !== undefined) updateData.person_id = data.personId;
        if (data.teamId !== undefined) updateData.team_id = data.teamId;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.lastLogin !== undefined) updateData.last_login = data.lastLogin;

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id,
            updateData
        );
        return { success: true, data: mapDbToFrontend(response) };
    } catch (error: any) {
        console.error('Error updating user account:', error);
        return { success: false, error: error.message };
    }
};

// Update last login timestamp
export const updateLastLogin = async (id: string): Promise<ServiceResponse<UserAccountResponse>> => {
    try {
        const now = new Date().toISOString();
        return await updateUserAccount(id, { lastLogin: now });
    } catch (error: any) {
        console.error('Error updating last login:', error);
        return { success: false, error: error.message };
    }
};

// Delete a user account (only deletes the database record, not the Appwrite auth user)
export const deleteUserAccount = async (id: string): Promise<ServiceResponse> => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user account:', error);
        return { success: false, error: error.message };
    }
};

// Get user accounts by team
export const getUserAccountsByTeam = async (teamId: string): Promise<ServiceResponse<UserAccountResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('team_id', teamId),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents.map(mapDbToFrontend) };
    } catch (error: any) {
        console.error('Error fetching user accounts by team:', error);
        return { success: false, error: error.message };
    }
};

// Get user accounts by role
export const getUserAccountsByRole = async (role: string): Promise<ServiceResponse<UserAccountResponse[]>> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.equal('role', role),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents.map(mapDbToFrontend) };
    } catch (error: any) {
        console.error('Error fetching user accounts by role:', error);
        return { success: false, error: error.message };
    }
};

// Get user accounts by status
export const getUserAccountsByStatus = async (status: string): Promise<ServiceResponse<UserAccountResponse[]>> => {
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
        console.error('Error fetching user accounts by status:', error);
        return { success: false, error: error.message };
    }
};

// Get active user accounts only
export const getActiveUserAccounts = async (): Promise<ServiceResponse<UserAccountResponse[]>> => {
    return await getUserAccountsByStatus('active');
};

// Get inactive user accounts only
export const getInactiveUserAccounts = async (): Promise<ServiceResponse<UserAccountResponse[]>> => {
    return await getUserAccountsByStatus('inactive');
};

export default {
    createUserAccount,
    createUserAccountRecord,
    getAllUserAccounts,
    getUserAccountById,
    getUserAccountByPersonId,
    getUserAccountByAppwriteUserId,
    updateUserAccount,
    updateLastLogin,
    deleteUserAccount,
    getUserAccountsByTeam,
    getUserAccountsByRole,
    getUserAccountsByStatus,
    getActiveUserAccounts,
    getInactiveUserAccounts,
};
