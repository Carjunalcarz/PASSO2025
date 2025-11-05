# Appwrite Teams Integration Guide

## Overview

This project now uses **Appwrite's built-in Teams feature** instead of a custom teams table. This provides better integration, built-in permissions, and membership management.

## What Changed

### Before (Custom Teams Table)
- Custom `teams` collection in database
- Manual team management
- Custom fields: `team_name`, `description`, `status`

### After (Appwrite Teams)
- Built-in Appwrite Teams API
- Native team memberships and roles
- Automatic permission management
- No custom table needed

## Setup Instructions

### 1. Run the Updated Setup Script

```bash
npm run setup:persons
```

This will:
- Skip creating a custom teams table
- Create `persons` collection with `team_ids` array field
- Create `user_accounts` collection
- Display instructions for using Appwrite Teams

### 2. Create Teams via Appwrite Console

**Option A: Using Appwrite Console**
1. Go to your Appwrite Console
2. Navigate to **Teams** section
3. Click **Create Team**
4. Enter team name
5. Copy the Team ID for use in your app

**Option B: Using the Teams Service**
```typescript
import { createTeam } from './services/team';

const result = await createTeam({ teamName: 'Development Team' });
if (result.success) {
  console.log('Team created:', result.data);
}
```

### 3. Update Environment Variables

Remove the old teams collection ID from `.env`:
```bash
# Remove this line (no longer needed)
# VITE_APPWRITE_TEAMS_COLLECTION_ID=teams

# Keep these
VITE_APPWRITE_PERSONS_COLLECTION_ID=persons
VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID=user_accounts
```

## Using Appwrite Teams

### Team Service API

The `team.ts` service provides these methods:

#### Create Team
```typescript
import { createTeam } from '@/pages/Users/services/team';

const result = await createTeam({ 
  teamName: 'Marketing Team' 
});
```

#### Get All Teams
```typescript
import { getAllTeams } from '@/pages/Users/services/team';

const result = await getAllTeams();
const teams = result.data; // Array of teams
```

#### Get Team by ID
```typescript
import { getTeamById } from '@/pages/Users/services/team';

const result = await getTeamById('team_id_here');
const team = result.data;
```

#### Update Team
```typescript
import { updateTeam } from '@/pages/Users/services/team';

const result = await updateTeam('team_id', { 
  teamName: 'New Team Name' 
});
```

#### Delete Team
```typescript
import { deleteTeam } from '@/pages/Users/services/team';

await deleteTeam('team_id');
```

#### Add Team Member
```typescript
import { addTeamMember } from '@/pages/Users/services/team';

await addTeamMember(
  'team_id',
  'user@example.com',
  ['member'], // roles
  'https://yourapp.com/join' // optional redirect URL
);
```

#### Get Team Memberships
```typescript
import { getTeamMemberships } from '@/pages/Users/services/team';

const result = await getTeamMemberships('team_id');
const memberships = result.data;
```

### Using React Hooks

```typescript
import { 
  useGetAllTeams, 
  useGetActiveTeams,
  useCreateTeam 
} from '@/pages/Users/hooks/useTeams';

function MyComponent() {
  // Get all teams
  const { data: teams, isLoading } = useGetAllTeams();
  
  // Create team mutation
  const createMutation = useCreateTeam();
  
  const handleCreateTeam = async () => {
    await createMutation.mutateAsync({ 
      teamName: 'New Team' 
    });
  };
  
  return (
    <div>
      {teams?.map(team => (
        <div key={team.$id}>{team.name}</div>
      ))}
    </div>
  );
}
```

## Person-Team Relationship

### Multiple Teams per Person

Persons can now be assigned to multiple teams:

```typescript
// Person data structure
{
  $id: 'person_id',
  firstName: 'John',
  lastName: 'Doe',
  teamIds: ['team1_id', 'team2_id', 'team3_id'], // Array of team IDs
  // ... other fields
}
```

### Assigning Teams in PersonForm

The PersonForm component now supports:
- **Checkbox selection** for multiple teams
- **Visual team list** showing all assigned teams
- **Individual remove buttons** for each team
- **Bulk team management** via modal

## Team Response Structure

Appwrite Teams return this structure:

```typescript
{
  $id: string;           // Team ID
  name: string;          // Team name
  total: number;         // Number of members
  $createdAt: string;    // Creation timestamp
}
```

## Benefits of Appwrite Teams

1. **Built-in Permissions** - Use team-based permissions in your database rules
2. **Membership Management** - Add/remove members with roles
3. **No Custom Tables** - Less maintenance and complexity
4. **Native Integration** - Works seamlessly with Appwrite Auth
5. **Scalability** - Optimized for performance

## Migration from Custom Teams

If you have existing data in a custom teams table:

1. Export team data from custom table
2. Create teams using Appwrite Teams API
3. Map old team IDs to new Appwrite team IDs
4. Update person records with new team IDs
5. Delete custom teams table

## Troubleshooting

### Teams Not Loading
- Check that you're logged in with proper permissions
- Verify Appwrite endpoint and project ID in `.env`
- Check browser console for errors

### Cannot Create Teams
- Ensure you have admin/owner permissions
- Check API key permissions if using server-side

### Person Team Assignment Not Saving
- Verify `team_ids` field exists in persons collection
- Check that it's configured as an array of strings
- Ensure team IDs are valid Appwrite team IDs

## Additional Resources

- [Appwrite Teams Documentation](https://appwrite.io/docs/client/teams)
- [Appwrite Teams API Reference](https://appwrite.io/docs/server/teams)
- [Team-based Permissions](https://appwrite.io/docs/permissions)
