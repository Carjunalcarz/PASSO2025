import { teams } from '../../../lib/appwrite';
import { updatePerson, getPersonById } from './person';
import { ServiceResponse } from './team';

/**
 * Team Membership Service
 * Binds Person table with Appwrite Teams using Memberships API
 * 
 * Strategy:
 * 1. Store teamIds in Person table for quick queries
 * 2. Use Appwrite Memberships for authentication & permissions
 * 3. Keep both in sync
 */

export interface MembershipData {
    teamId: string;
    personId: string;
    roles?: string[];
    email?: string;
}

export interface TeamMembershipResponse {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    userId: string;
    userName: string;
    userEmail: string;
    teamId: string;
    roles: string[];
    joined: string;
    confirm: boolean;
}

/**
 * Add a person to a team
 * Updates both Person table and Appwrite Memberships
 */
export const addPersonToTeam = async (data: MembershipData): Promise<ServiceResponse> => {
    try {
        const { teamId, personId, roles = ['member'], email } = data;

        // 1. Get person details
        const personResult = await getPersonById(personId);
        if (!personResult.success || !personResult.data) {
            return { success: false, error: 'Person not found' };
        }

        const person = personResult.data;

        // 2. Update person's teamIds array
        const currentTeamIds = person.teamIds || [];
        if (!currentTeamIds.includes(teamId)) {
            const updatedTeamIds = [...currentTeamIds, teamId];
            const updateResult = await updatePerson(personId, { teamIds: updatedTeamIds });
            
            if (!updateResult.success) {
                return { success: false, error: 'Failed to update person teamIds' };
            }
        }

        // 3. If person has userAccountId, create Appwrite membership
        if (person.userAccountId) {
            try {
                await teams.createMembership(
                    teamId,
                    roles,
                    email || person.contactNo || '', // Use email or contact
                    person.userAccountId,
                    undefined,
                    undefined
                );
            } catch (membershipError: any) {
                // If membership already exists, that's okay
                if (!membershipError.message?.includes('already exists')) {
                    console.warn('Failed to create Appwrite membership:', membershipError);
                }
            }
        }

        return { success: true, data: { teamId, personId } };
    } catch (error: any) {
        console.error('Error adding person to team:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Remove a person from a team
 * Updates both Person table and Appwrite Memberships
 */
export const removePersonFromTeam = async (
    teamId: string,
    personId: string
): Promise<ServiceResponse> => {
    try {
        // 1. Get person details
        const personResult = await getPersonById(personId);
        if (!personResult.success || !personResult.data) {
            return { success: false, error: 'Person not found' };
        }

        const person = personResult.data;

        // 2. Update person's teamIds array
        const currentTeamIds = person.teamIds || [];
        const updatedTeamIds = currentTeamIds.filter(id => id !== teamId);
        const updateResult = await updatePerson(personId, { teamIds: updatedTeamIds });
        
        if (!updateResult.success) {
            return { success: false, error: 'Failed to update person teamIds' };
        }

        // 3. If person has userAccountId, remove Appwrite membership
        if (person.userAccountId) {
            try {
                // Get memberships to find the membership ID
                const memberships = await teams.listMemberships(teamId);
                const membership = memberships.memberships.find(
                    m => m.userId === person.userAccountId
                );
                
                if (membership) {
                    await teams.deleteMembership(teamId, membership.$id);
                }
            } catch (membershipError: any) {
                console.warn('Failed to delete Appwrite membership:', membershipError);
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error removing person from team:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all persons in a team
 * Queries Person table by teamIds
 */
export const getTeamMembers = async (teamId: string): Promise<ServiceResponse> => {
    try {
        const { databases, appwriteConfig } = await import('../../../lib/appwrite');
        const { Query } = await import('appwrite');
        
        const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PERSONS_COLLECTION_ID || 'persons';
        
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            COLLECTION_ID,
            [
                Query.contains('team_ids', teamId),
                Query.orderDesc('$createdAt')
            ]
        );

        return { success: true, data: response.documents };
    } catch (error: any) {
        console.error('Error fetching team members:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all teams a person belongs to
 * Returns team details from teamIds array
 */
export const getPersonTeams = async (personId: string): Promise<ServiceResponse> => {
    try {
        const personResult = await getPersonById(personId);
        if (!personResult.success || !personResult.data) {
            return { success: false, error: 'Person not found' };
        }

        const teamIds = personResult.data.teamIds || [];
        
        // Fetch team details for each teamId
        const teamPromises = teamIds.map(async (teamId) => {
            try {
                return await teams.get(teamId);
            } catch (error) {
                console.warn(`Failed to fetch team ${teamId}:`, error);
                return null;
            }
        });

        const teamResults = await Promise.all(teamPromises);
        const validTeams = teamResults.filter(team => team !== null);

        return { success: true, data: validTeams };
    } catch (error: any) {
        console.error('Error fetching person teams:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sync person's teamIds with Appwrite memberships
 * Useful for data consistency checks
 */
export const syncPersonTeamMemberships = async (personId: string): Promise<ServiceResponse> => {
    try {
        const personResult = await getPersonById(personId);
        if (!personResult.success || !personResult.data) {
            return { success: false, error: 'Person not found' };
        }

        const person = personResult.data;
        if (!person.userAccountId) {
            return { success: true, data: { message: 'Person has no user account, nothing to sync' } };
        }

        // Get all teams from Appwrite memberships
        const allTeams = await teams.list();
        const membershipTeamIds: string[] = [];

        for (const team of allTeams.teams) {
            try {
                const memberships = await teams.listMemberships(team.$id);
                const isMember = memberships.memberships.some(
                    m => m.userId === person.userAccountId
                );
                if (isMember) {
                    membershipTeamIds.push(team.$id);
                }
            } catch (error) {
                console.warn(`Failed to check membership for team ${team.$id}:`, error);
            }
        }

        // Update person's teamIds to match memberships
        await updatePerson(personId, { teamIds: membershipTeamIds });

        return { 
            success: true, 
            data: { 
                synced: true, 
                teamIds: membershipTeamIds 
            } 
        };
    } catch (error: any) {
        console.error('Error syncing person team memberships:', error);
        return { success: false, error: error.message };
    }
};

export default {
    addPersonToTeam,
    removePersonFromTeam,
    getTeamMembers,
    getPersonTeams,
    syncPersonTeamMemberships,
};
