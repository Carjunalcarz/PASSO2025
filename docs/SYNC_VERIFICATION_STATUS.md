# Sync Verification Status

## Issue
If you verified an email directly in Appwrite console, the `user_accounts.status` field in your database won't automatically update to `'verified'`.

## Solution Options

### Option 1: Manual Update in Database
Go to your Appwrite console → Database → `user_accounts` collection → Find your user → Update `status` field to `'verified'`

### Option 2: Update via Code
If you know the person ID, you can update it programmatically:

```typescript
import { updateUserAccount, getUserAccountByPersonId } from './services/userAccount';

// Get user account for person
const result = await getUserAccountByPersonId('YOUR_PERSON_ID');
if (result.success && result.data) {
    // Update status to verified
    await updateUserAccount(result.data.$id, {
        status: 'verified'
    });
}
```

### Option 3: Sync All Users (Future Enhancement)
Create a sync function that checks Appwrite's `emailVerification` status for all users and updates the database accordingly. This would require the Appwrite Server SDK.

## Current Flow

1. **Create user account** → `status = 'active'` (unverified)
2. **Admin clicks verify** → `status = 'verified'`
3. **List shows** → Badge based on `status` field

## Appwrite Console Verification

If you verified directly in Appwrite:
- Appwrite user has `emailVerification: true`
- But `user_accounts.status` is still `'active'`
- Need to manually update `status` to `'verified'`

## Quick Fix

Run this in your browser console on the Person list page:

```javascript
// This is just for reference - you need to update via Appwrite console
console.log('Go to Appwrite Console → Database → user_accounts → Update status to "verified"');
```
