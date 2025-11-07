# Full Appwrite Teams Implementation

## Overview

The team management system has been updated to use **pure Appwrite Teams & Memberships API** with email-based invitations, removing dependencies on the Person table.

## What Changed

### Before (Hybrid Approach)
- Teams stored in Appwrite
- Memberships synced with Person table (`teamIds` array)
- Required persons to have user accounts
- No email invitations

### After (Full Appwrite)
- Teams stored in Appwrite ✅
- Memberships managed entirely through Appwrite API ✅
- Email invitations sent to new members ✅
- Native Appwrite workflow ✅

## Key Features

### 1. **Email-Based Invitations**
- Send invitations to any email address
- Users receive email with invitation link
- Users must accept invitation to join team
- Tracks pending vs. active memberships

### 2. **Membership Management**
- **Create Membership**: Send email invitation with role assignment
- **Update Membership**: Change member roles
- **Delete Membership**: Remove members from team
- **View Memberships**: See all members with status (Active/Pending)

### 3. **Role-Based Access**
- **Member**: Standard team member
- **Owner**: Team owner with full permissions

## Updated Files

### 1. **Services** (`src/pages/Users/services/team.ts`)
```typescript
// New/Updated Functions:
- createTeamMembership()  // Send email invitation
- updateTeamMembership()  // Update member roles
- deleteTeamMembership()  // Remove member
- getTeamMemberships()    // Get all memberships
```

**Changes:**
- Removed Person table dependencies
- Simplified `getAllTeams()` and `getTeamById()`
- Added membership CRUD operations

### 2. **Hooks** (`src/pages/Users/hooks/useTeams.ts`)
```typescript
// New Hooks:
- useGetTeamMemberships()      // Query memberships
- useCreateTeamMembership()    // Send invitation
- useUpdateTeamMembership()    // Update roles
- useDeleteTeamMembership()    // Remove member
```

### 3. **UI** (`src/pages/Users/pages/team/TeamForm.tsx`)

#### Create Mode
- Add email invitations before creating team
- Enter email, name (optional), and role
- Invitations sent automatically after team creation
- Shows list of pending invitations

#### Edit Mode
- View all team memberships
- See member status (Active/Pending)
- Send new invitations
- Delete memberships
- Display member roles

## Usage

### Creating a Team with Members

1. Navigate to **Users → Teams → Add New Team**
2. Enter team name
3. Click **"Add Member"** button
4. Enter:
   - Email address (required)
   - Name (optional)
   - Role (Member/Owner)
5. Add multiple members if needed
6. Click **"Create Team"**
7. Email invitations sent automatically

### Managing Team Memberships

1. Navigate to **Users → Teams**
2. Click **Edit** on a team
3. View current memberships with:
   - Member name/email
   - Roles
   - Status (Active/Pending)
4. Click **"Add Member"** to send new invitation
5. Click **trash icon** to remove member

### Member Invitation Flow

1. **Admin sends invitation** via TeamForm
2. **User receives email** with invitation link
3. **User clicks link** and accepts invitation
4. **Membership becomes Active** in Appwrite
5. **User gains team access** based on role

## Membership Status

### Active (Green Badge)
- User has accepted invitation
- Full team access granted
- Can access team resources

### Pending (Yellow Badge)
- Invitation sent but not accepted
- No team access yet
- Waiting for user action

## API Reference

### Create Membership
```typescript
await createTeamMembership(
  teamId: string,
  email: string,
  roles: string[] = ['member'],
  url?: string,  // Redirect URL after accepting
  name?: string  // Optional display name
);
```

### Update Membership
```typescript
await updateTeamMembership(
  teamId: string,
  membershipId: string,
  roles: string[]
);
```

### Delete Membership
```typescript
await deleteTeamMembership(
  teamId: string,
  membershipId: string
);
```

### Get Memberships
```typescript
const memberships = await getTeamMemberships(teamId);
// Returns array of membership objects
```

## Membership Object Structure

```typescript
{
  $id: string;           // Membership ID
  $createdAt: string;    // Creation timestamp
  $updatedAt: string;    // Last update
  userId: string;        // User ID (if accepted)
  userName: string;      // User name
  userEmail: string;     // User email
  teamId: string;        // Team ID
  roles: string[];       // Array of roles
  joined: string;        // Join timestamp
  confirm: boolean;      // true = Active, false = Pending
}
```

## Benefits

### ✅ Native Appwrite Workflow
- Uses Appwrite's built-in invitation system
- Leverages Appwrite's email service
- No custom sync logic needed

### ✅ Better Security
- Email verification required
- Users must explicitly accept
- Proper role-based access control

### ✅ Simplified Codebase
- Removed Person table dependencies
- Less code to maintain
- Clearer separation of concerns

### ✅ Better UX
- Professional invitation emails
- Clear pending/active status
- Standard team management flow

## Configuration

### Email Settings
Ensure Appwrite email service is configured:
1. Go to Appwrite Console → Settings → Email
2. Configure SMTP settings
3. Test email delivery

### Redirect URL
Update the invitation redirect URL in `TeamForm.tsx`:
```typescript
url: `${window.location.origin}/teams/accept`
```

## Troubleshooting

### Invitations Not Sending
- Check Appwrite email configuration
- Verify SMTP settings
- Check email service logs

### Members Not Showing
- Ensure team ID is correct
- Check user permissions
- Verify membership was created

### Cannot Delete Membership
- Check if you have owner permissions
- Verify membership ID is correct
- Ensure team exists

## Migration Notes

If you were using the hybrid approach:
1. Existing teams remain unchanged
2. Old Person table `teamIds` are no longer used
3. Create new memberships via email invitations
4. Old team associations won't appear in new system

## Next Steps

- [ ] Configure Appwrite email service
- [ ] Test invitation flow end-to-end
- [ ] Create acceptance page at `/teams/accept`
- [ ] Add role management UI
- [ ] Implement team-based permissions in other modules

## Related Documentation

- [Appwrite Teams API](https://appwrite.io/docs/server/teams)
- [Appwrite Memberships](https://appwrite.io/docs/server/teams#createMembership)
- [Team-based Permissions](https://appwrite.io/docs/permissions)
