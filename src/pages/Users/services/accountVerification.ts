import { account } from '../../../lib/appwrite';
import { getUserAccountByPersonId } from './userAccount';

/**
 * Account Verification Service
 * Handles manual verification of user accounts in Appwrite
 */

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Manually verify a user account in Appwrite
 * This requires admin privileges
 * @param personId - The person ID to verify their account
 */
export const verifyUserAccount = async (personId: string): Promise<ServiceResponse> => {
    try {
        // 1. Get the user account for this person
        const userAccountResult = await getUserAccountByPersonId(personId);
        
        if (!userAccountResult.success || !userAccountResult.data) {
            return { success: false, error: 'User account not found for this person' };
        }

        const userAccount = userAccountResult.data;
        const appwriteUserId = userAccount.appwriteUserId;

        // 2. Update phone verification in Appwrite (as a workaround for email verification)
        // Note: Direct email verification requires admin SDK
        // For now, we'll mark it as verified in our system
        
        // Update the user account status in our database
        const { updateUserAccount } = await import('./userAccount');
        const updateResult = await updateUserAccount(userAccount.$id, {
            status: 'verified'
        });

        if (!updateResult.success) {
            return { success: false, error: 'Failed to update verification status' };
        }

        // Also update the person record to mark as verified
        const { updatePerson } = await import('./person');
        await updatePerson(personId, {
            accountVerified: true
        });

        return { 
            success: true, 
            data: { 
                message: 'Account verified successfully',
                userId: appwriteUserId 
            } 
        };
    } catch (error: any) {
        console.error('Error verifying user account:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if a person's account is verified
 * @param personId - The person ID to check
 */
export const checkAccountVerification = async (personId: string): Promise<ServiceResponse<boolean>> => {
    try {
        const userAccountResult = await getUserAccountByPersonId(personId);
        
        if (!userAccountResult.success || !userAccountResult.data) {
            return { success: true, data: false };
        }

        const isVerified = userAccountResult.data.status === 'verified';
        return { success: true, data: isVerified };
    } catch (error: any) {
        console.error('Error checking verification:', error);
        return { success: false, error: error.message };
    }
};

export default {
    verifyUserAccount,
    checkAccountVerification,
};
