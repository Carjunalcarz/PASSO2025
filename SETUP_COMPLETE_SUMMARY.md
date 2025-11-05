# ✅ User Management Setup Complete

## What Was Done

### 1. ✅ Updated Setup Script
**File:** `scripts/Users/setup-person.js`

The script now creates **3 collections** instead of just 1:
- **teams** - Team management
- **persons** - Person records (already existed, now enhanced)
- **user_accounts** - Links persons with Appwrite auth users and teams

### 2. ✅ Updated Environment Variables
**File:** `.env`

Added new collection IDs:
```env
VITE_APPWRITE_TEAMS_COLLECTION_ID=teams
VITE_APPWRITE_PERSONS_COLLECTION_ID=persons
VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID=user_accounts
```

### 3. ✅ Created Service Files

#### Team Service
**File:** `src/pages/Users/services/team.ts`
- `createTeam()` - Create new team
- `getAllTeams()` - Get all teams
- `getTeamById()` - Get team by ID
- `updateTeam()` - Update team
- `deleteTeam()` - Delete team
- `getActiveTeams()` - Get active teams

#### User Account Service
**File:** `src/pages/Users/services/userAccount.ts`
- `createUserAccount()` - Create user account (creates Appwrite auth user + DB record)
- `getAllUserAccounts()` - Get all user accounts
- `getUserAccountById()` - Get user account by ID
- `getUserAccountByPersonId()` - Get user account for a person
- `updateUserAccount()` - Update user account
- `deleteUserAccount()` - Delete user account
- `getUserAccountsByTeam()` - Get users in a team
- `getUserAccountsByRole()` - Get users by role

### 4. ✅ Created TanStack Query Hooks

#### Team Hooks
**File:** `src/pages/Users/hooks/useTeams.ts`
- `useGetAllTeams()` - Query all teams
- `useGetActiveTeams()` - Query active teams
- `useGetTeamById()` - Query team by ID
- `useCreateTeam()` - Mutation to create team
- `useUpdateTeam()` - Mutation to update team
- `useDeleteTeam()` - Mutation to delete team

#### User Account Hooks
**File:** `src/pages/Users/hooks/useUserAccounts.ts`
- `useGetAllUserAccounts()` - Query all user accounts
- `useGetActiveUserAccounts()` - Query active user accounts
- `useGetUserAccountById()` - Query user account by ID
- `useGetUserAccountByPersonId()` - Query user account by person
- `useGetUserAccountsByTeam()` - Query user accounts by team
- `useGetUserAccountsByRole()` - Query user accounts by role
- `useCreateUserAccount()` - Mutation to create user account
- `useUpdateUserAccount()` - Mutation to update user account
- `useDeleteUserAccount()` - Mutation to delete user account

### 5. ✅ Created Documentation

#### Main Documentation
**File:** `docs/USER_MANAGEMENT_SETUP.md`
- Complete schema details
- Relationship diagrams
- API reference
- Security considerations
- Integration examples

#### Script README
**File:** `scripts/Users/README.md`
- Quick start guide
- Setup instructions
- Usage examples
- Troubleshooting

## Database Schema

```
┌─────────────────┐
│     TEAMS       │
├─────────────────┤
│ $id (PK)        │
│ team_name       │
│ description     │
│ status          │
└─────────────────┘
         ▲
         │
         │ team_id (FK)
         │
┌─────────────────┐         ┌─────────────────┐
│ USER_ACCOUNTS   │────────►│    PERSONS      │
├─────────────────┤         ├─────────────────┤
│ $id (PK)        │         │ $id (PK)        │
│ person_id (FK)  │─────────│ first_name      │
│ team_id (FK)    │         │ middle_name     │
│ appwrite_user_id│         │ last_name       │
│ email (unique)  │         │ contact_no      │
│ role            │         │ tin             │
│ status          │         │ street          │
│ last_login      │         │ status          │
└─────────────────┘         └─────────────────┘
         │
         │ appwrite_user_id
         ▼
┌─────────────────┐
│  APPWRITE AUTH  │
│     USERS       │
└─────────────────┘
```

## How to Run

### Step 1: Run the Setup Script

```bash
node scripts/Users/setup-person.js
```

This will:
1. Delete existing collections (if any)
2. Create `teams` collection with attributes and indexes
3. Create `persons` collection with attributes and indexes
4. Create `user_accounts` collection with attributes and indexes

### Step 2: Verify in Appwrite Console

Go to your Appwrite console → Database → Collections

You should see:
- ✅ teams
- ✅ persons
- ✅ user_accounts

## Usage Examples

### Example 1: Create a Team

```typescript
import { useCreateTeam } from '@/pages/Users/hooks/useTeams';

function MyComponent() {
    const createTeamMutation = useCreateTeam();
    
    const handleCreateTeam = async () => {
        await createTeamMutation.mutateAsync({
            teamName: 'Assessor Team',
            description: 'Property assessment team',
            status: 'active'
        });
    };
}
```

### Example 2: Create a Person

```typescript
import { useCreatePerson } from '@/pages/Users/hooks/usePersons';

function MyComponent() {
    const createPersonMutation = useCreatePerson();
    
    const handleCreatePerson = async () => {
        await createPersonMutation.mutateAsync({
            firstName: 'John',
            lastName: 'Doe',
            contactNo: '123-456-7890',
            status: 'active'
        });
    };
}
```

### Example 3: Create a User Account

```typescript
import { useCreateUserAccount } from '@/pages/Users/hooks/useUserAccounts';

function MyComponent() {
    const createUserAccountMutation = useCreateUserAccount();
    
    const handleCreateUserAccount = async (personId: string, teamId: string) => {
        await createUserAccountMutation.mutateAsync({
            personId: personId,
            teamId: teamId,
            email: 'john@example.com',
            password: 'SecurePassword123!',
            role: 'assessor',
            name: 'John Doe'
        });
    };
}
```

### Example 4: Get User Account for a Person

```typescript
import { useGetUserAccountByPersonId } from '@/pages/Users/hooks/useUserAccounts';

function PersonDetails({ personId }: { personId: string }) {
    const { data: userAccount, isLoading } = useGetUserAccountByPersonId(personId);
    
    if (isLoading) return <div>Loading...</div>;
    
    if (!userAccount) {
        return <div>No user account for this person</div>;
    }
    
    return (
        <div>
            <p>Email: {userAccount.email}</p>
            <p>Role: {userAccount.role}</p>
            <p>Status: {userAccount.status}</p>
        </div>
    );
}
```

## Next Steps (Optional Enhancements)

### 1. Update PersonForm.tsx
The form already has UI placeholders. You can now integrate real functionality:

```typescript
// In PersonForm.tsx
import { useGetUserAccountByPersonId } from '../../hooks/useUserAccounts';
import { useGetActiveTeams } from '../../hooks/useTeams';
import { useCreateUserAccount } from '../../hooks/useUserAccounts';

// Inside component
const { data: userAccount } = useGetUserAccountByPersonId(formData.$id || '');
const { data: teams = [] } = useGetActiveTeams();
const createUserAccountMutation = useCreateUserAccount();
```

### 2. Create Team Management Pages
- `src/pages/Users/pages/team/Team.tsx` - List teams
- `src/pages/Users/pages/team/TeamForm.tsx` - Create/edit teams

### 3. Create User Account Management Pages
- `src/pages/Users/pages/userAccount/UserAccount.tsx` - List user accounts
- `src/pages/Users/pages/userAccount/UserAccountForm.tsx` - Manage accounts

### 4. Add Routes
Update `src/router/routes.tsx` to include team and user account routes.

### 5. Add Permissions
Configure Appwrite collection permissions for security:
- Users can read their own account
- Only admins can create/update/delete user accounts
- Only admins can manage teams

## Available Roles

You can use these role values (or customize):
- `admin` - Full system access
- `assessor` - Property assessment functions
- `collector` - Tax collection functions
- `viewer` - Read-only access

## Status Values

- `active` - Active/enabled
- `inactive` - Disabled
- `pending` - Awaiting activation
- `suspended` - Temporarily suspended

## Files Created/Modified

### Modified
- ✅ `scripts/Users/setup-person.js` - Enhanced with teams and user_accounts
- ✅ `.env` - Added new collection IDs

### Created
- ✅ `src/pages/Users/services/team.ts` - Team service
- ✅ `src/pages/Users/services/userAccount.ts` - User account service
- ✅ `src/pages/Users/hooks/useTeams.ts` - Team hooks
- ✅ `src/pages/Users/hooks/useUserAccounts.ts` - User account hooks
- ✅ `docs/USER_MANAGEMENT_SETUP.md` - Detailed documentation
- ✅ `scripts/Users/README.md` - Script documentation
- ✅ `SETUP_COMPLETE_SUMMARY.md` - This file

## Troubleshooting

### Script fails with "fetch is not defined"
**Solution:** Use Node.js 18 or higher

### "Unauthorized" error
**Solution:** Check `APPWRITE_API_KEY` in `.env` has Database permissions

### Collections already exist
**Solution:** The script automatically deletes and recreates them

### Cannot create user account
**Solution:** 
- Verify person_id exists
- Check email is unique
- Ensure Appwrite auth is enabled in project settings

## Support

For detailed information, see:
- `docs/USER_MANAGEMENT_SETUP.md` - Complete documentation
- `scripts/Users/README.md` - Script usage guide

---

## ✨ Summary

You now have a complete user management system with:
- ✅ Teams for organizing users
- ✅ Persons for storing individual information
- ✅ User Accounts linking persons to Appwrite auth users and teams
- ✅ Full CRUD services for all entities
- ✅ TanStack Query hooks for React integration
- ✅ Comprehensive documentation

**Ready to run:** `node scripts/Users/setup-person.js`
