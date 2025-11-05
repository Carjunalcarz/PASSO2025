import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    bindUserAccountToPerson,
    unbindUserAccountFromPerson,
    personHasUserAccount,
    getPersonWithUserAccount,
    type BindUserAccountInput,
} from '../services/personUserBinding';

// Query keys
export const personUserBindingKeys = {
    all: ['personUserBinding'] as const,
    hasAccount: (personId: string) => [...personUserBindingKeys.all, 'hasAccount', personId] as const,
    withAccount: (personId: string) => [...personUserBindingKeys.all, 'withAccount', personId] as const,
};

/**
 * Check if person has a user account
 */
export const usePersonHasUserAccount = (personId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: personUserBindingKeys.hasAccount(personId),
        queryFn: async () => {
            const result = await personHasUserAccount(personId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to check user account');
            }
            return result.data || false;
        },
        enabled: enabled && !!personId,
    });
};

/**
 * Get person with user account details
 */
export const useGetPersonWithUserAccount = (personId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: personUserBindingKeys.withAccount(personId),
        queryFn: async () => {
            const result = await getPersonWithUserAccount(personId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to get person with user account');
            }
            return result.data;
        },
        enabled: enabled && !!personId,
    });
};

/**
 * Bind user account to person
 */
export const useBindUserAccountToPerson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: BindUserAccountInput) => {
            const result = await bindUserAccountToPerson(data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to bind user account');
            }
            return result.data;
        },
        onSuccess: (_, variables) => {
            // Invalidate queries
            queryClient.invalidateQueries({ 
                queryKey: personUserBindingKeys.hasAccount(variables.personId) 
            });
            queryClient.invalidateQueries({ 
                queryKey: personUserBindingKeys.withAccount(variables.personId) 
            });
        },
    });
};

/**
 * Unbind user account from person
 */
export const useUnbindUserAccountFromPerson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (personId: string) => {
            const result = await unbindUserAccountFromPerson(personId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to unbind user account');
            }
            return result;
        },
        onSuccess: (_, personId) => {
            // Invalidate queries
            queryClient.invalidateQueries({ 
                queryKey: personUserBindingKeys.hasAccount(personId) 
            });
            queryClient.invalidateQueries({ 
                queryKey: personUserBindingKeys.withAccount(personId) 
            });
        },
    });
};
