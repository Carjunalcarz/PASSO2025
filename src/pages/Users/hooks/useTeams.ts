import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    getActiveTeams,
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
