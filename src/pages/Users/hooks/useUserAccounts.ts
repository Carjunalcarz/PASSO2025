import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllUserAccounts,
    getUserAccountById,
    getUserAccountByPersonId,
    createUserAccount,
    updateUserAccount,
    deleteUserAccount,
    getUserAccountsByTeam,
    getUserAccountsByRole,
    getActiveUserAccounts,
    type CreateUserAccountInput,
    type UserAccountData,
} from '../services/userAccount';

// Query keys
export const userAccountKeys = {
    all: ['userAccounts'] as const,
    lists: () => [...userAccountKeys.all, 'list'] as const,
    list: (filters?: string) => [...userAccountKeys.lists(), { filters }] as const,
    details: () => [...userAccountKeys.all, 'detail'] as const,
    detail: (id: string) => [...userAccountKeys.details(), id] as const,
    byPerson: (personId: string) => [...userAccountKeys.all, 'person', personId] as const,
    byTeam: (teamId: string) => [...userAccountKeys.all, 'team', teamId] as const,
    byRole: (role: string) => [...userAccountKeys.all, 'role', role] as const,
    active: () => [...userAccountKeys.all, 'active'] as const,
};

// Get all user accounts
export const useGetAllUserAccounts = () => {
    return useQuery({
        queryKey: userAccountKeys.lists(),
        queryFn: async () => {
            const result = await getAllUserAccounts();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user accounts');
            }
            return result.data || [];
        },
    });
};

// Get active user accounts only
export const useGetActiveUserAccounts = () => {
    return useQuery({
        queryKey: userAccountKeys.active(),
        queryFn: async () => {
            const result = await getActiveUserAccounts();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch active user accounts');
            }
            return result.data || [];
        },
    });
};

// Get user account by ID
export const useGetUserAccountById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: userAccountKeys.detail(id),
        queryFn: async () => {
            const result = await getUserAccountById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user account');
            }
            return result.data;
        },
        enabled: enabled && !!id,
    });
};

// Get user account by person ID
export const useGetUserAccountByPersonId = (personId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: userAccountKeys.byPerson(personId),
        queryFn: async () => {
            const result = await getUserAccountByPersonId(personId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user account by person');
            }
            return result.data;
        },
        enabled: enabled && !!personId,
    });
};

// Get user accounts by team
export const useGetUserAccountsByTeam = (teamId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: userAccountKeys.byTeam(teamId),
        queryFn: async () => {
            const result = await getUserAccountsByTeam(teamId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user accounts by team');
            }
            return result.data || [];
        },
        enabled: enabled && !!teamId,
    });
};

// Get user accounts by role
export const useGetUserAccountsByRole = (role: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: userAccountKeys.byRole(role),
        queryFn: async () => {
            const result = await getUserAccountsByRole(role);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user accounts by role');
            }
            return result.data || [];
        },
        enabled: enabled && !!role,
    });
};

// Create user account mutation
export const useCreateUserAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateUserAccountInput) => {
            const result = await createUserAccount(data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to create user account');
            }
            return result.data;
        },
        onSuccess: (data) => {
            // Invalidate and refetch user accounts list
            queryClient.invalidateQueries({ queryKey: userAccountKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userAccountKeys.active() });
            
            // Invalidate person-specific query
            if (data?.personId) {
                queryClient.invalidateQueries({ queryKey: userAccountKeys.byPerson(data.personId) });
            }
            
            // Invalidate team-specific query
            if (data?.teamId) {
                queryClient.invalidateQueries({ queryKey: userAccountKeys.byTeam(data.teamId) });
            }
        },
    });
};

// Update user account mutation
export const useUpdateUserAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<UserAccountData> }) => {
            const result = await updateUserAccount(id, data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update user account');
            }
            return result.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate specific user account and lists
            queryClient.invalidateQueries({ queryKey: userAccountKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: userAccountKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userAccountKeys.active() });
            
            // Invalidate person-specific query
            if (data?.personId) {
                queryClient.invalidateQueries({ queryKey: userAccountKeys.byPerson(data.personId) });
            }
            
            // Invalidate team-specific query
            if (data?.teamId) {
                queryClient.invalidateQueries({ queryKey: userAccountKeys.byTeam(data.teamId) });
            }
        },
    });
};

// Delete user account mutation
export const useDeleteUserAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteUserAccount(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete user account');
            }
            return result;
        },
        onSuccess: () => {
            // Invalidate user accounts list
            queryClient.invalidateQueries({ queryKey: userAccountKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userAccountKeys.active() });
        },
    });
};
