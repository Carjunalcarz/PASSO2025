import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    getActiveTeams,
    getTeamMemberships,
    createTeamMembership,
    updateTeamMembership,
    deleteTeamMembership,
    type TeamData,
} from '../services/team';

// Query keys
export const teamKeys = {
    all: ['teams'] as const,
    lists: () => [...teamKeys.all, 'list'] as const,
    list: (filters?: string) => [...teamKeys.lists(), { filters }] as const,
    details: () => [...teamKeys.all, 'detail'] as const,
    detail: (id: string) => [...teamKeys.details(), id] as const,
    active: () => [...teamKeys.all, 'active'] as const,
    memberships: (teamId: string) => [...teamKeys.all, 'memberships', teamId] as const,
};

// Get all teams
export const useGetAllTeams = () => {
    return useQuery({
        queryKey: teamKeys.lists(),
        queryFn: async () => {
            const result = await getAllTeams();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch teams');
            }
            return result.data || [];
        },
    });
};

// Get active teams only
export const useGetActiveTeams = () => {
    return useQuery({
        queryKey: teamKeys.active(),
        queryFn: async () => {
            const result = await getActiveTeams();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch active teams');
            }
            return result.data || [];
        },
    });
};

// Get team by ID
export const useGetTeamById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: teamKeys.detail(id),
        queryFn: async () => {
            const result = await getTeamById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch team');
            }
            return result.data;
        },
        enabled: enabled && !!id,
    });
};

// Create team mutation
export const useCreateTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: TeamData) => {
            const result = await createTeam(data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to create team');
            }
            return result.data;
        },
        onSuccess: () => {
            // Invalidate and refetch teams list
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            queryClient.invalidateQueries({ queryKey: teamKeys.active() });
        },
    });
};

// Update team mutation
export const useUpdateTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<TeamData> }) => {
            const result = await updateTeam(id, data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update team');
            }
            return result.data;
        },
        onSuccess: (_, variables) => {
            // Invalidate specific team and lists
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            queryClient.invalidateQueries({ queryKey: teamKeys.active() });
        },
    });
};

// Delete team mutation
export const useDeleteTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteTeam(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete team');
            }
            return result;
        },
        onSuccess: () => {
            // Invalidate teams list
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            queryClient.invalidateQueries({ queryKey: teamKeys.active() });
        },
    });
};

// Get team memberships
export const useGetTeamMemberships = (teamId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: teamKeys.memberships(teamId),
        queryFn: async () => {
            const result = await getTeamMemberships(teamId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch team memberships');
            }
            return result.data || [];
        },
        enabled: enabled && !!teamId,
    });
};

// Create team membership (send email invitation)
export const useCreateTeamMembership = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            teamId, 
            email, 
            roles = ['member'], 
            url,
            name 
        }: { 
            teamId: string; 
            email: string; 
            roles?: string[]; 
            url?: string;
            name?: string;
        }) => {
            const result = await createTeamMembership(teamId, email, roles, url, name);
            if (!result.success) {
                throw new Error(result.error || 'Failed to create membership');
            }
            return result.data;
        },
        onSuccess: (_, variables) => {
            // Invalidate memberships and team details
            queryClient.invalidateQueries({ queryKey: teamKeys.memberships(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
        },
    });
};

// Update team membership roles
export const useUpdateTeamMembership = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            teamId, 
            membershipId, 
            roles 
        }: { 
            teamId: string; 
            membershipId: string; 
            roles: string[];
        }) => {
            const result = await updateTeamMembership(teamId, membershipId, roles);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update membership');
            }
            return result.data;
        },
        onSuccess: (_, variables) => {
            // Invalidate memberships
            queryClient.invalidateQueries({ queryKey: teamKeys.memberships(variables.teamId) });
        },
    });
};

// Delete team membership
export const useDeleteTeamMembership = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            teamId, 
            membershipId 
        }: { 
            teamId: string; 
            membershipId: string;
        }) => {
            const result = await deleteTeamMembership(teamId, membershipId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete membership');
            }
            return result;
        },
        onSuccess: (_, variables) => {
            // Invalidate memberships and team details
            queryClient.invalidateQueries({ queryKey: teamKeys.memberships(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
        },
    });
};
