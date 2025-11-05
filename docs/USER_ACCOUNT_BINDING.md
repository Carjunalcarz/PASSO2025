# User Account Binding to Persons

## Overview
This document explains how to bind Appwrite user accounts to Person records, enabling team membership functionality.

## Why User Accounts Are Required for Teams

**Team membership requires a user account** because:
1. Appwrite Teams use authentication-based memberships
2. Team permissions and roles require authenticated users
3. Security and access control need user accounts

## Architecture

```
Person Record                 User Account                Appwrite Auth User
┌─────────────────┐          ┌──────────────────┐       ┌──────────────────┐
│ $id             │          │ $id              │       │ $id              │
│ firstName       │◄────────►│ personId         │◄─────►│ email            │
│ lastName        │          │ appwriteUserId   │       │ name             │
│ userAccountId   │          │ email            │       │ password (hash)  │
│ teamIds[]       │          │ role             │       └──────────────────┘
└─────────────────┘          │ status           │
                             └──────────────────┘
```

## Implementation

### 1. Services

#### `personUserBinding.ts`
Handles the binding logic between persons and user accounts.

**Key Functions:**
- `bindUserAccountToPerson()` - Creates Appwrite auth user and links to person
- `unbindUserAccountFromPerson()` - Removes the link
- `personHasUserAccount()` - Checks if person has account
- `getPersonWithUserAccount()` - Gets person with account details

#### `userAccount.ts`
Manages user account records in the database.

**Key Functions:**
- `createUserAccount()` - Creates user account record
- `getUserAccountByPersonId()` - Gets account by person ID
- `getUserAccountByAppwriteUserId()` - Gets account by Appwrite user ID

### 2. Hooks

#### `usePersonUserBinding.ts`
React Query hooks for user account binding.

**Available Hooks:**
- `usePersonHasUserAccount(personId)` - Query if person has account
- `useGetPersonWithUserAccount(personId)` - Query person with account details
- `useBindUserAccountToPerson()` - Mutation to bind account
- `useUnbindUserAccountFromPerson()` - Mutation to unbind account

### 3. UI Components

#### PersonForm - User Account Section
Located in edit mode, shows:
- ✅ Account status indicator
- ✅ "Create User Account" button (if no account)
- ✅ Account creation dialog with email, password, role
- ✅ Visual feedback for account status

#### TeamForm - Member Selection
Updated to:
- ✅ Only show persons with user accounts
- ✅ Display helpful message if no eligible persons
- ✅ Filter out persons without `userAccountId`

## Usage Flow

### Creating a User Account for a Person

1. **Navigate to Person Edit Page**
   ```
   /users/person/edit/{personId}
   ```

2. **Scroll to "User Account" Section**
   - Green card at bottom of form
   - Shows account status

3. **Click "Create User Account"**
   - Dialog appears with form fields:
     - Email (required, pre-filled from contact)
     - Password (required, min 8 characters)
     - Role (required: admin/assessor/collector/viewer)

4. **Submit**
   - Creates Appwrite authentication user
   - Creates user account record in database
   - Updates person with `userAccountId`
   - Person can now be added to teams

### Adding Person to Team

1. **Navigate to Team Edit Page**
   ```
   /users/team/edit/{teamId}
   ```

2. **Click "Add Member"**
   - Only persons with user accounts appear in dropdown
   - Select person and role
   - Submit

3. **System Actions**
   - Updates person's `teamIds` array
   - Creates Appwrite team membership
   - Both stay in sync

## Data Flow

### Binding User Account
```
User clicks "Create User Account"
    ↓
Enter email, password, role
    ↓
bindUserAccountToPerson() service
    ↓
1. Create Appwrite auth user (account.create)
2. Create user account record in database
3. Update person.userAccountId
    ↓
Person now has user account
    ↓
Can be added to teams
```

### Adding to Team (with account)
```
Select person from dropdown (filtered: has userAccountId)
    ↓
addPersonToTeam() service
    ↓
1. Update person.teamIds array
2. Create Appwrite membership (uses userAccountId)
    ↓
Person is team member
```

### Attempting to Add (without account)
```
Click "Add Member"
    ↓
Filter persons: only those with userAccountId
    ↓
No eligible persons?
    ↓
Show message: "Create user account first"
```

## Database Schema

### Person Table
```typescript
{
    $id: string;
    firstName: string;
    lastName: string;
    userAccountId?: string;  // Links to Appwrite user
    teamIds?: string[];      // Array of team IDs
    // ... other fields
}
```

### User Account Table
```typescript
{
    $id: string;
    personId: string;         // Links to Person
    appwriteUserId: string;   // Links to Appwrite auth user
    email: string;
    role: string;             // admin, assessor, collector, viewer
    status: string;           // active, inactive
    lastLogin?: string;
}
```

### Appwrite Auth User
```typescript
{
    $id: string;              // Referenced as userAccountId
    email: string;
    name: string;
    password: string;         // Hashed by Appwrite
}
```

## Security Considerations

1. **Password Requirements**
   - Minimum 8 characters
   - Validated before submission
   - Hashed by Appwrite (never stored plain text)

2. **Role-Based Access**
   - Roles stored in user account record
   - Can be used for permissions
   - Options: admin, assessor, collector, viewer

3. **Account Status**
   - Active/inactive status
   - Can disable accounts without deletion
   - Maintains audit trail

## Validation Rules

### Creating User Account
- ✅ Email must be valid format
- ✅ Email must be unique (Appwrite enforces)
- ✅ Password minimum 8 characters
- ✅ Role must be selected
- ✅ Person must not already have account

### Adding to Team
- ✅ Person must have user account
- ✅ Person must not already be in team
- ✅ Team must exist

## Error Handling

### Common Errors

**"Person already has a user account"**
- Person already linked to account
- Check User Account section in PersonForm

**"No persons available to add"**
- All persons either in team or lack user accounts
- Create user accounts for persons first

**"Failed to create user account"**
- Email may already be in use
- Check Appwrite console for details
- Verify environment variables

## API Reference

### Services

```typescript
// Bind user account to person
bindUserAccountToPerson({
    personId: string,
    email: string,
    password: string,
    role: string
}): Promise<ServiceResponse>

// Check if person has account
personHasUserAccount(personId: string): Promise<ServiceResponse<boolean>>

// Get person with account details
getPersonWithUserAccount(personId: string): Promise<ServiceResponse>
```

### Hooks

```typescript
// Query hooks
const { data: hasAccount } = usePersonHasUserAccount(personId);
const { data: personWithAccount } = useGetPersonWithUserAccount(personId);

// Mutation hooks
const bindMutation = useBindUserAccountToPerson();
await bindMutation.mutateAsync({ personId, email, password, role });
```

## Environment Variables Required

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID=user_accounts
VITE_APPWRITE_PERSONS_COLLECTION_ID=persons
```

## Future Enhancements

1. **Email Verification**
   - Send verification emails
   - Require email confirmation

2. **Password Reset**
   - Forgot password flow
   - Email-based reset

3. **Multi-Factor Authentication**
   - Add 2FA support
   - SMS or authenticator app

4. **Account Management**
   - Change password
   - Update email
   - Deactivate account

5. **Bulk Account Creation**
   - Import users from CSV
   - Create multiple accounts at once

## Troubleshooting

### Person can't be added to team
**Solution:** Check if person has user account in PersonForm

### User account creation fails
**Solution:** Verify email is unique and password meets requirements

### Team membership not syncing
**Solution:** Check both person.teamIds and Appwrite memberships

### Can't find person in "Add Member" dropdown
**Solution:** Person needs user account first - create in PersonForm
