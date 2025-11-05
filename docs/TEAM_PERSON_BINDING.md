# Team-Person Binding with Appwrite

## Overview
This document explains how the Person table is bound to Appwrite Teams using a hybrid approach.

## Architecture

### Hybrid Approach (Implemented)
We use **both** the Person table and Appwrite's native Teams/Memberships API:

```
Person Table (Database)          Appwrite Teams API
┌─────────────────┐             ┌──────────────────┐
│ $id             │             │ Team             │
│ firstName       │             │ - $id            │
│ lastName        │             │ - name           │
│ teamIds: []     │◄───sync────►│ - total          │
│ userAccountId   │             │                  │
└─────────────────┘             │ Memberships      │
                                │ - userId         │
                                │ - teamId         │
                                │ - roles          │
                                └──────────────────┘
```

## Why This Approach?

### ✅ Benefits
1. **Fast Queries**: Query persons by team using `teamIds` array (no API calls)
2. **Permissions**: Use Appwrite memberships for authentication/authorization
3. **Flexibility**: Person table stores additional data (contact, address, etc.)
4. **Sync**: Both systems stay in sync automatically

### ❌ Alternative Rejected
**Appwrite Memberships Only**: Would require API calls for every query, slower performance

## Implementation

### 1. Service Layer (`teamMembership.ts`)

#### Add Person to Team
```typescript
await addPersonToTeam({
    teamId: 'team123',
    personId: 'person456',
    roles: ['member']
});
```

**What happens:**
1. Updates `person.teamIds` array in database
2. Creates Appwrite membership (if person has `userAccountId`)
3. Both stay in sync

#### Remove Person from Team
```typescript
await removePersonFromTeam('team123', 'person456');
```

**What happens:**
1. Removes teamId from `person.teamIds` array
2. Deletes Appwrite membership
3. Both stay in sync

#### Get Team Members
```typescript
const members = await getTeamMembers('team123');
```

**What happens:**
- Queries Person table: `Query.contains('team_ids', teamId)`
- Returns all persons with that teamId
- Fast, no API calls to Appwrite

### 2. Hooks Layer (`useTeamMemberships.ts`)

#### React Query Hooks
```typescript
// Get team members
const { data: members } = useGetTeamMembers(teamId);

// Get person's teams
const { data: teams } = useGetPersonTeams(personId);

// Add member (with auto-refetch)
const addMutation = useAddPersonToTeam();
await addMutation.mutateAsync({ teamId, personId, roles });

// Remove member (with auto-refetch)
const removeMutation = useRemovePersonFromTeam();
await removeMutation.mutateAsync({ teamId, personId });
```

### 3. UI Layer (`TeamForm.tsx`)

#### Features Implemented
- ✅ View all team members
- ✅ Add person to team (with role selection)
- ✅ Remove person from team
- ✅ Real-time member count
- ✅ Active member stats
- ✅ Loading states

## Data Flow

### Adding a Member
```
User clicks "Add Member"
    ↓
Select person from dropdown (filtered: not already in team)
    ↓
Select role (member/leader/admin)
    ↓
addPersonToTeam() service
    ↓
1. Update person.teamIds in database
2. Create Appwrite membership (if userAccountId exists)
    ↓
React Query auto-refetches:
    - Team members list
    - Person teams list
    - Team details (member count)
    ↓
UI updates automatically
```

### Removing a Member
```
User clicks trash icon
    ↓
Confirmation dialog
    ↓
removePersonFromTeam() service
    ↓
1. Remove teamId from person.teamIds
2. Delete Appwrite membership
    ↓
React Query auto-refetches
    ↓
UI updates automatically
```

## Database Schema

### Person Table Fields
```typescript
{
    $id: string;
    firstName: string;
    lastName: string;
    teamIds: string[];        // Array of team IDs
    userAccountId?: string;   // Link to Appwrite user account
    status: 'active' | 'inactive';
    contactNo?: string;
    // ... other fields
}
```

### Appwrite Team
```typescript
{
    $id: string;
    name: string;
    total: number;  // Auto-calculated member count
    $createdAt: string;
    $updatedAt: string;
}
```

### Appwrite Membership
```typescript
{
    $id: string;
    userId: string;      // Appwrite user account ID
    teamId: string;
    roles: string[];     // ['member', 'leader', 'admin']
    joined: string;
    confirm: boolean;
}
```

## Key Points

### 1. teamIds Array
- Stored in Person table as `team_ids` (snake_case in DB)
- Mapped to `teamIds` (camelCase in frontend)
- Allows fast queries: `Query.contains('team_ids', teamId)`

### 2. userAccountId
- Optional field linking Person to Appwrite user account
- If present: Creates Appwrite membership for permissions
- If absent: Only stores teamIds in Person table

### 3. Synchronization
- Both systems updated in same transaction
- If Appwrite membership fails, Person table still updated
- Use `syncPersonTeamMemberships()` to fix inconsistencies

### 4. Roles
- Stored in Appwrite memberships
- Options: `member`, `leader`, `admin`
- Can be used for permissions/authorization

## Usage Examples

### In TeamForm Component
```tsx
// Get team members
const { data: teamMembers, isLoading } = useGetTeamMembers(teamId);

// Add member
const addMutation = useAddPersonToTeam();
await addMutation.mutateAsync({
    teamId: formData.$id,
    personId: selectedPersonId,
    roles: ['member']
});

// Remove member
const removeMutation = useRemovePersonFromTeam();
await removeMutation.mutateAsync({
    teamId: formData.$id,
    personId: memberId
});
```

### In Person Component (Future)
```tsx
// Get person's teams
const { data: teams } = useGetPersonTeams(personId);

// Display team badges
teams.map(team => (
    <span className="badge">{team.name}</span>
));
```

## API Reference

### Services
- `addPersonToTeam(data)` - Add person to team
- `removePersonFromTeam(teamId, personId)` - Remove person from team
- `getTeamMembers(teamId)` - Get all members of a team
- `getPersonTeams(personId)` - Get all teams a person belongs to
- `syncPersonTeamMemberships(personId)` - Sync data consistency

### Hooks
- `useGetTeamMembers(teamId)` - Query team members
- `useGetPersonTeams(personId)` - Query person's teams
- `useAddPersonToTeam()` - Mutation to add member
- `useRemovePersonFromTeam()` - Mutation to remove member
- `useSyncPersonTeamMemberships()` - Mutation to sync data

## Future Enhancements

1. **Bulk Operations**: Add/remove multiple persons at once
2. **Role Management**: Update member roles
3. **Team Invitations**: Send email invites via Appwrite
4. **Activity Log**: Track membership changes
5. **Team Permissions**: Use Appwrite roles for access control
