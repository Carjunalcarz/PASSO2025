import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    addPersonToTeam,
    removePersonFromTeam,
    getTeamMembers,
    getPersonTeams,
    syncPersonTeamMemberships,
    type MembershipData,
} from '../services/teamMembership';
import { teamKeys } from './useTeams';

// Query keys
export const membershipKeys = {
    all: ['memberships'] as const,
    teamMembers: (teamId: string) => [...membershipKeys.all, 'team', teamId] as const,
    personTeams: (personId: string) => [...membershipKeys.all, 'person', personId] as const,
};

/**
 * Get all members of a team
 */
export const useGetTeamMembers = (teamId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: membershipKeys.teamMembers(teamId),
        queryFn: async () => {
            const result = await getTeamMembers(teamId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch team members');
            }
            return result.data || [];
        },
        enabled: enabled && !!teamId,
    });
};

/**
 * Get all teams a person belongs to
 */
export const useGetPersonTeams = (personId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: membershipKeys.personTeams(personId),
        queryFn: async () => {
            const result = await getPersonTeams(personId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch person teams');
            }
            return result.data || [];
        },
        enabled: enabled && !!personId,
    });
};

/**
 * Add a person to a team
 */
export const useAddPersonToTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: MembershipData) => {
            const result = await addPersonToTeam(data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to add person to team');
            }
            return result.data;
        },
        onSuccess: (_, variables) => {
            // Invalidate team members list
            queryClient.invalidateQueries({ 
                queryKey: membershipKeys.teamMembers(variables.teamId) 
            });
            // Invalidate person teams list
            queryClient.invalidateQueries({ 
                queryKey: membershipKeys.personTeams(variables.personId) 
            });
            // Invalidate team details (to update member count)
            queryClient.invalidateQueries({ 
                queryKey: teamKeys.detail(variables.teamId) 
            });
            queryClient.invalidateQueries({ 
                queryKey: teamKeys.lists() 
            });
        },
    });
};

/**
 * Remove a person from a team
 */
export const useRemovePersonFromTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teamId, personId }: { teamId: string; personId: string }) => {
            const result = await removePersonFromTeam(teamId, personId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to remove person from team');
            }
            return result;
        },
        onSuccess: (_, variables) => {
            // Invalidate team members list
            queryClient.invalidateQueries({ 
                queryKey: membershipKeys.teamMembers(variables.teamId) 
            });
            // Invalidate person teams list
            queryClient.invalidateQueries({ 
                queryKey: membershipKeys.personTeams(variables.personId) 
            });
            // Invalidate team details (to update member count)
            queryClient.invalidateQueries({ 
                queryKey: teamKeys.detail(variables.teamId) 
            });
            queryClient.invalidateQueries({ 
                queryKey: teamKeys.lists() 
            });
        },
    });
};

/**
 * Sync person's teamIds with Appwrite memberships
 */
export const useSyncPersonTeamMemberships = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (personId: string) => {
            const result = await syncPersonTeamMemberships(personId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to sync memberships');
            }
            return result.data;
        },
        onSuccess: (_, personId) => {
            // Invalidate person teams list
            queryClient.invalidateQueries({ 
                queryKey: membershipKeys.personTeams(personId) 
            });
        },
    });
};
