# User Management Setup - Teams & User Accounts

## Overview
This document describes the enhanced user management system with Teams and User Accounts integration.

## Database Schema

### 1. Teams Table (`teams`)
Manages organizational teams that users can be assigned to.

**Attributes:**
- `$id` (PK) - Auto-generated unique identifier
- `team_name` (required) - Name of the team
- `description` - Team description
- `status` - Team status (active/inactive)

**Indexes:**
- `team_name_index` - For searching teams by name
- `status_index` - For filtering by status

### 2. Persons Table (`persons`)
Stores person information (already existed, now enhanced).

**Attributes:**
- `$id` (PK) - Auto-generated unique identifier
- `first_name` (required)
- `middle_name`
- `last_name` (required)
- `owner_type_id` (FK → owner_types)
- `barangay_id` (FK → barangays)
- `street`
- `tin`
- `contact_no`
- `status`
- `uid`

### 3. User Accounts Table (`user_accounts`)
Links persons with Appwrite authentication users and teams.

**Attributes:**
- `$id` (PK) - Auto-generated unique identifier
- `person_id` (FK → persons, required) - Links to person record
- `team_id` (FK → teams) - Team assignment
- `appwrite_user_id` (required, unique) - Appwrite Auth User ID
- `email` (required, unique) - User email
- `role` (required) - User role (admin, assessor, collector, viewer)
- `status` - Account status (active/inactive)
- `last_login` - Last login timestamp

**Indexes:**
- `person_id_fk_index` - Foreign key index
- `team_id_fk_index` - Foreign key index
- `appwrite_user_id_unique` - Unique constraint
- `email_unique` - Unique constraint
- `role_index` - For filtering by role
- `status_index` - For filtering by status

## Relationships

```
┌─────────┐         ┌─────────────┐         ┌──────────┐
│  Teams  │◄────────│User Accounts│────────►│ Persons  │
└─────────┘         └─────────────┘         └──────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Appwrite   │
                    │Auth Users   │
                    └─────────────┘
```

- One Person can have one User Account
- One Team can have many User Accounts
- One User Account links to one Appwrite Auth User

## Setup Instructions

### 1. Run the Setup Script

```bash
cd scripts/Users
node setup-person.js
```

This will create all three tables:
1. `teams`
2. `persons`
3. `user_accounts`

### 2. Environment Variables

Already added to `.env`:
```env
VITE_APPWRITE_TEAMS_COLLECTION_ID=teams
VITE_APPWRITE_PERSONS_COLLECTION_ID=persons
VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID=user_accounts
```

### 3. Service Files Created

- **`src/pages/Users/services/team.ts`** - Team CRUD operations
- **`src/pages/Users/services/person.ts`** - Person CRUD operations (already existed)
- **`src/pages/Users/services/userAccount.ts`** - User Account CRUD operations

## Service Usage Examples

### Creating a Team

```typescript
import { createTeam } from '@/pages/Users/services/team';

const result = await createTeam({
    teamName: 'Assessor Team',
    description: 'Property assessment team',
    status: 'active'
});
```

### Creating a User Account

```typescript
import { createUserAccount } from '@/pages/Users/services/userAccount';

const result = await createUserAccount({
    personId: 'person_id_here',
    teamId: 'team_id_here',
    email: 'user@example.com',
    password: 'secure_password',
    role: 'assessor',
    name: 'John Doe'
});
```

This will:
1. Create an Appwrite authentication user
2. Create a database record linking the person to the auth user
3. Assign the user to a team

### Getting User Account by Person

```typescript
import { getUserAccountByPersonId } from '@/pages/Users/services/userAccount';

const result = await getUserAccountByPersonId('person_id_here');
if (result.success && result.data) {
    console.log('User account found:', result.data);
} else {
    console.log('No user account for this person');
}
```

## Integration with PersonForm

The `PersonForm.tsx` already has UI placeholders for:
1. **Team Assignment** - Shows in edit mode
2. **User Account Creation** - Shows in edit mode

### Next Steps for Full Integration:

1. **Create TanStack Query hooks** for teams and user accounts:
   - `src/pages/Users/hooks/useTeams.ts`
   - `src/pages/Users/hooks/useUserAccounts.ts`

2. **Update PersonForm.tsx** to:
   - Load existing team assignments
   - Load existing user accounts
   - Implement real team assignment functionality
   - Implement real user account creation

3. **Create Team Management Pages**:
   - `src/pages/Users/pages/team/Team.tsx` - List teams
   - `src/pages/Users/pages/team/TeamForm.tsx` - Create/edit teams

4. **Create User Account Management Pages**:
   - `src/pages/Users/pages/userAccount/UserAccount.tsx` - List user accounts
   - `src/pages/Users/pages/userAccount/UserAccountForm.tsx` - Manage accounts

## Security Considerations

1. **User Account Creation**: Currently uses admin API to create auth users. In production, consider:
   - Email verification
   - Password strength requirements
   - Role-based access control

2. **Permissions**: Update Appwrite collection permissions to:
   - Allow users to read their own account
   - Restrict user account creation to admins
   - Restrict team management to admins

3. **Data Validation**: Add validation for:
   - Email format
   - Password strength
   - Role values
   - Team assignments

## Available Roles

Suggested roles (can be customized):
- `admin` - Full system access
- `assessor` - Property assessment functions
- `collector` - Tax collection functions
- `viewer` - Read-only access

## Status Values

- `active` - Account is active
- `inactive` - Account is disabled
- `pending` - Account awaiting activation
- `suspended` - Account temporarily suspended

## API Reference

### Team Service
- `createTeam(data)` - Create new team
- `getAllTeams()` - Get all teams
- `getTeamById(id)` - Get team by ID
- `updateTeam(id, data)` - Update team
- `deleteTeam(id)` - Delete team
- `getActiveTeams()` - Get active teams only

### User Account Service
- `createUserAccount(data)` - Create user account (includes Appwrite auth user)
- `getAllUserAccounts()` - Get all user accounts
- `getUserAccountById(id)` - Get user account by ID
- `getUserAccountByPersonId(personId)` - Get user account for a person
- `getUserAccountByAppwriteUserId(userId)` - Get user account by auth user ID
- `updateUserAccount(id, data)` - Update user account
- `updateLastLogin(id)` - Update last login timestamp
- `deleteUserAccount(id)` - Delete user account
- `getUserAccountsByTeam(teamId)` - Get all users in a team
- `getUserAccountsByRole(role)` - Get all users with a role
- `getActiveUserAccounts()` - Get active user accounts only

## Troubleshooting

### Script Fails to Run
- Ensure Node.js 18+ is installed
- Check that `APPWRITE_API_KEY` is set in `.env`
- Verify Appwrite server is accessible

### Cannot Create User Account
- Check that person_id exists
- Verify email is unique
- Ensure Appwrite auth is enabled in project settings

### Team Assignment Not Working
- Verify team_id exists
- Check collection permissions
- Ensure user has proper role
