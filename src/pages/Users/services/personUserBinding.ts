import { account } from '../../../lib/appwrite';
import { ID } from 'appwrite';
import { updatePerson, getPersonById } from './person';
import { 
    createUserAccountRecord, 
    getUserAccountByPersonId,
    type ServiceResponse 
} from './userAccount';

/**
 * Person-User Account Binding Service
 * Handles binding Appwrite user accounts to Person records
 */

export interface BindUserAccountInput {
    personId: string;
    email: string;
    password: string;
    role: string;
}

/**
 * Create a user account and bind it to a person
 * This creates an Appwrite auth user and links it to the person
 */
export const bindUserAccountToPerson = async (data: BindUserAccountInput): Promise<ServiceResponse> => {
    try {
        // 1. Get person details
        const personResult = await getPersonById(data.personId);
        if (!personResult.success || !personResult.data) {
            return { success: false, error: 'Person not found' };
        }

        const person = personResult.data;

        // 2. Check if person already has a user account
        const existingAccount = await getUserAccountByPersonId(data.personId);
        if (existingAccount.success && existingAccount.data) {
            return { success: false, error: 'This person already has a user account' };
        }

        // 3. Create Appwrite auth user
        let authUser;
        try {
            authUser = await account.create(
                ID.unique(),
                data.email,
                data.password,
                `${person.firstName} ${person.lastName}`
            );
        } catch (authError: any) {
            // Handle specific Appwrite errors
            if (authError.message?.includes('already exists')) {
                return { 
                    success: false, 
                    error: 'This email address is already registered. Please use a different email.' 
                };
            }
            throw authError; // Re-throw if it's a different error
        }

        // 4. Create user account record in database (only the record, auth user already created)
        let accountResult;
        try {
            accountResult = await createUserAccountRecord(
                data.personId,
                authUser.$id,
                data.email,
                data.role
            );
            
            if (!accountResult.success) {
                throw new Error(accountResult.error || 'Failed to create user account record');
            }
        } catch (dbError: any) {
            // Rollback: Delete the Appwrite auth user we just created
            console.error('Failed to create user account record, rolling back auth user:', dbError);
            // Note: We can't easily delete the auth user from here without admin SDK
            // The user will exist in Appwrite but won't be linked to a person
            return { 
                success: false, 
                error: 'Failed to create user account record. The email may now be reserved. Please contact administrator.' 
            };
        }

        // 5. Update person with userAccountId
        try {
            const updateResult = await updatePerson(data.personId, {
                userAccountId: authUser.$id,
            });
            
            if (!updateResult.success) {
                throw new Error('Failed to update person with user account ID');
            }
        } catch (updateError: any) {
            console.error('Failed to update person, but auth user and account record created:', updateError);
            // At this point, auth user and account record exist, but person isn't linked
            // This is recoverable - admin can manually link them
            return {
                success: false,
                error: 'User account created but failed to link to person. Please contact administrator.'
            };
        }

        return { 
            success: true, 
            data: {
                userId: authUser.$id,
                userAccountId: accountResult.data?.$id,
                email: data.email,
            }
        };
    } catch (error: any) {
        console.error('Error binding user account to person:', error);
        
        // Provide user-friendly error messages
        let errorMessage = error.message || 'Failed to create user account';
        
        if (errorMessage.includes('already exists')) {
            errorMessage = 'This email address is already registered. Please use a different email.';
        } else if (errorMessage.includes('Invalid email')) {
            errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('password')) {
            errorMessage = 'Password does not meet requirements. Please use at least 8 characters.';
        }
        
        return { success: false, error: errorMessage };
    }
};

/**
 * Unbind user account from person
 * Removes the link but doesn't delete the Appwrite auth user
 */
export const unbindUserAccountFromPerson = async (personId: string): Promise<ServiceResponse> => {
    try {
        // Update person to remove userAccountId
        await updatePerson(personId, {
            userAccountId: '',
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error unbinding user account from person:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if person has a user account
 */
export const personHasUserAccount = async (personId: string): Promise<ServiceResponse<boolean>> => {
    try {
        const result = await getUserAccountByPersonId(personId);
        return { 
            success: true, 
            data: result.success && result.data !== null 
        };
    } catch (error: any) {
        console.error('Error checking if person has user account:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get person with user account details
 */
export const getPersonWithUserAccount = async (personId: string): Promise<ServiceResponse> => {
    try {
        const personResult = await getPersonById(personId);
        if (!personResult.success || !personResult.data) {
            return { success: false, error: 'Person not found' };
        }

        const userAccountResult = await getUserAccountByPersonId(personId);
        
        return {
            success: true,
            data: {
                person: personResult.data,
                userAccount: userAccountResult.data,
                hasAccount: userAccountResult.success && userAccountResult.data !== null,
            }
        };
    } catch (error: any) {
        console.error('Error getting person with user account:', error);
        return { success: false, error: error.message };
    }
};

export default {
    bindUserAccountToPerson,
    unbindUserAccountFromPerson,
    personHasUserAccount,
    getPersonWithUserAccount,
};
