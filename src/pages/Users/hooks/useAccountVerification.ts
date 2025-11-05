import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verifyUserAccount } from '../services/accountVerification';

/**
 * Verify user account mutation
 */
export const useVerifyUserAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (personId: string) => {
            const result = await verifyUserAccount(personId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to verify account');
            }
            return result.data;
        },
        onSuccess: () => {
            // Invalidate persons list to refresh the data
            queryClient.invalidateQueries({ queryKey: ['persons'] });
        },
    });
};
