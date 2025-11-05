import { teams, databases, appwriteConfig } from '../../../lib/appwrite';
import { ID, Query } from 'appwrite';

/**
 * Team Service
 * Uses Appwrite's built-in Teams API
 * 
 * Appwrite Teams provide:
 * - Built-in team management
 * - Team memberships with roles
 * - Team-based permissions
 * - No need for custom tables
 */

// Types matching Appwrite's native Teams API
export interface TeamData {
    name: string; // Team name (Appwrite uses 'name', not 'teamName')
}

export interface TeamMember {
    $id: string;
    firstName: string;
    lastName: string;
    contactNo?: string;
    status?: string;
}

export interface TeamResponse {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    total: number; // Total number of team members
    members?: TeamMember[]; // Array of member details
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Create a new team using Appwrite Teams API
export const createTeam = async (data: TeamData): Promise<ServiceResponse<TeamResponse>> => {
    try {
        const response = await teams.create(ID.unique(), data.name);
        return { success: true, data: response as TeamResponse };
    } catch (error: any) {
        console.error('Error creating team:', error);
        return { success: false, error: error.message };
    }
};

// Get all teams with actual member counts and details from Person table
export const getAllTeams = async (): Promise<ServiceResponse<TeamResponse[]>> => {
    try {
        const response = await teams.list();
        const teamsData = response.teams as TeamResponse[];
        
        // Get actual member counts and details from Person table
        const PERSONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PERSONS_COLLECTION_ID || 'persons';
        
        const teamsWithMembers = await Promise.all(
            teamsData.map(async (team) => {
                try {
                    // Query persons that have this team in their teamIds array
                    const personsResponse = await databases.listDocuments(
                        appwriteConfig.databaseId,
                        PERSONS_COLLECTION_ID,
                        [
                            Query.contains('team_ids', team.$id),
                            Query.limit(1000) // Adjust if you have more members
                        ]
                    );
                    
                    // Map person documents to member objects
                    const members: TeamMember[] = personsResponse.documents.map((doc: any) => ({
                        $id: doc.$id,
                        firstName: doc.first_name || doc.firstName || '',
                        lastName: doc.last_name || doc.lastName || '',
                        contactNo: doc.contact_no || doc.contactNo || '',
                        status: doc.status || 'active',
                    }));
                    
                    // Update the total with actual member count and include members
                    return {
                        ...team,
                        total: personsResponse.total,
                        members
                    };
                } catch (error) {
                    console.warn(`Failed to get members for team ${team.$id}:`, error);
                    return { ...team, members: [] }; // Return empty members array if query fails
                }
            })
        );
        
        return { success: true, data: teamsWithMembers };
    } catch (error: any) {
        console.error('Error fetching teams:', error);
        return { success: false, error: error.message };
    }
};

// Get a single team by ID with actual member count
export const getTeamById = async (id: string): Promise<ServiceResponse<TeamResponse>> => {
    try {
        const response = await teams.get(id);
        const team = response as TeamResponse;
        
        // Get actual member count from Person table
        const PERSONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PERSONS_COLLECTION_ID || 'persons';
        
        try {
            const personsResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                PERSONS_COLLECTION_ID,
                [
                    Query.contains('team_ids', id),
                    Query.limit(1000)
                ]
            );
            
            team.total = personsResponse.total;
        } catch (error) {
            console.warn(`Failed to get member count for team ${id}:`, error);
        }
        
        return { success: true, data: team };
    } catch (error: any) {
        console.error('Error fetching team:', error);
        return { success: false, error: error.message };
    }
};

// Update a team
export const updateTeam = async (id: string, data: Partial<TeamData>): Promise<ServiceResponse<TeamResponse>> => {
    try {
        const response = await teams.updateName(id, data.name || '');
        return { success: true, data: response as TeamResponse };
    } catch (error: any) {
        console.error('Error updating team:', error);
        return { success: false, error: error.message };
    }
};

// Delete a team
export const deleteTeam = async (id: string): Promise<ServiceResponse> => {
    try {
        await teams.delete(id);
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting team:', error);
        return { success: false, error: error.message };
    }
};

// Get active teams (all teams in Appwrite are considered active)
export const getActiveTeams = async (): Promise<ServiceResponse<TeamResponse[]>> => {
    return await getAllTeams();
};

// Create team membership (add user to team)
export const addTeamMember = async (
    teamId: string,
    email: string,
    roles: string[] = ['member'],
    url?: string
): Promise<ServiceResponse> => {
    try {
        await teams.createMembership(teamId, roles, email, undefined, undefined, url);
        return { success: true };
    } catch (error: any) {
        console.error('Error adding team member:', error);
        return { success: false, error: error.message };
    }
};

// Remove team membership
export const removeTeamMember = async (teamId: string, membershipId: string): Promise<ServiceResponse> => {
    try {
        await teams.deleteMembership(teamId, membershipId);
        return { success: true };
    } catch (error: any) {
        console.error('Error removing team member:', error);
        return { success: false, error: error.message };
    }
};

// Get team memberships
export const getTeamMemberships = async (teamId: string): Promise<ServiceResponse> => {
    try {
        const response = await teams.listMemberships(teamId);
        return { success: true, data: response.memberships };
    } catch (error: any) {
        console.error('Error fetching team memberships:', error);
        return { success: false, error: error.message };
    }
};

export default {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getActiveTeams,
    addTeamMember,
    removeTeamMember,
    getTeamMemberships,
};
