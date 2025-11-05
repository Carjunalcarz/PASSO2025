# User Management Setup Scripts

> 🎯 **One Script. Everything.** Just use `setup-person.js` for all operations!

## Overview

**Main script:** `setup-person.js` - Your all-in-one solution for:
- ✅ Creating all collections (teams, persons, user_accounts)
- ✅ Updating person records with team/account IDs
- ✅ Bulk updates from JSON files
- ✅ Listing persons without IDs

**See [README_UNIFIED.md](./README_UNIFIED.md) for the complete unified script guide.**

## Quick Start

### Initial Setup (Run Once)

```bash
node scripts/Users/setup-person.js
```

This creates three collections with **all fields included**:
1. **teams** - Team management
2. **persons** - Person records (with team_id and user_account_id)
3. **user_accounts** - Links persons with Appwrite auth users and teams

### Update Person Records (As Needed)

```bash
# Update single person
node scripts/Users/setup-person.js --update-person <id> --team-id <team> --account-id <account>

# Bulk update from JSON
node scripts/Users/setup-person.js --bulk-update updates.json

# List persons without IDs
node scripts/Users/setup-person.js --list-missing

# Show help
node scripts/Users/setup-person.js --help
```

## Available Script

**`setup-person.js`** - Your all-in-one solution for everything!

## What Gets Created

### Teams Collection
- Stores team information (Admin Team, Assessor Team, etc.)
- Attributes: team_name, description, status
- Indexes for searching and filtering

### Persons Collection
- Stores person/individual information
- Attributes: first_name, middle_name, last_name, contact info, etc.
- **NEW:** team_id and user_account_id fields (included in setup)
- Links persons to teams and user accounts

### User Accounts Collection
- Links persons to Appwrite authentication users
- Links users to teams
- Stores role, email, status, last login
- Unique constraints on email and appwrite_user_id

## Prerequisites

1. **Node.js 18+** (for built-in fetch support)
2. **Appwrite API Key** with Database permissions in `.env`:
   ```env
   APPWRITE_API_KEY=your_api_key_here
   ```

## Environment Variables

The following are already added to your `.env` file:

```env
VITE_APPWRITE_TEAMS_COLLECTION_ID=teams
VITE_APPWRITE_PERSONS_COLLECTION_ID=persons
VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID=user_accounts
```

## Service Files

After running the script, you can use these service files:

- `src/pages/Users/services/team.ts` - Team operations
- `src/pages/Users/services/person.ts` - Person operations
- `src/pages/Users/services/userAccount.ts` - User account operations

## Example Usage

### 1. Create a Team

```typescript
import { createTeam } from '@/pages/Users/services/team';

const team = await createTeam({
    teamName: 'Assessor Team',
    description: 'Property assessment team',
    status: 'active'
});
```

### 2. Create a Person

```typescript
import { createPerson } from '@/pages/Users/services/person';

const person = await createPerson({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    contactNo: '123-456-7890',
    status: 'active'
});
```

### 3. Create a User Account

```typescript
import { createUserAccount } from '@/pages/Users/services/userAccount';

// This creates both the Appwrite auth user AND the database record
const userAccount = await createUserAccount({
    personId: person.data.$id,
    teamId: team.data.$id,
    email: 'john@example.com',
    password: 'SecurePassword123!',
    role: 'assessor',
    name: 'John Doe'
});
```

## Workflow

```
1. Create Person
   ↓
2. Create User Account (creates Appwrite auth user + links to person)
   ↓
3. Assign to Team (optional, can be done during user account creation)
```

## Updating Person Records with Team and Account IDs

The unified `setup-person.js` script now includes update functionality!

### Update Single Person

```bash
node scripts/Users/setup-person.js --update-person <person_id> --team-id <team_id> --account-id <account_id>
```

**Examples:**
```bash
# Update with both team and account
node scripts/Users/setup-person.js --update-person 673abc123 --team-id team_xyz --account-id acc_123

# Update only team
node scripts/Users/setup-person.js --update-person 673abc123 --team-id team_xyz

# Update only account
node scripts/Users/setup-person.js --update-person 673abc123 --account-id acc_123
```

### Bulk Update from JSON

1. Create a JSON file (see `sample-bulk-update.json` for format):
```json
[
  {
    "personId": "person_id_1",
    "teamId": "team_id_1",
    "userAccountId": "account_id_1"
  },
  {
    "personId": "person_id_2",
    "teamId": "team_id_2",
    "userAccountId": "account_id_2"
  }
]
```

2. Run the bulk update:
```bash
node scripts/Users/setup-person.js --bulk-update updates.json
```

### List Persons Without IDs

To see which persons are missing team_id or user_account_id:

```bash
node scripts/Users/setup-person.js --list-missing
```

## Next Steps

1. ✅ Run the setup script
2. ✅ Service files are created
3. ✅ Update person records with team and account IDs
4. 🔲 Create TanStack Query hooks (optional, for React integration)
5. 🔲 Update PersonForm.tsx to use real data
6. 🔲 Create Team management UI
7. 🔲 Create User Account management UI

## Troubleshooting

### "fetch is not defined"
- Use Node.js 18 or higher
- Or install `node-fetch` package

### "Unauthorized" or "401" error
- Check your `APPWRITE_API_KEY` in `.env`
- Ensure the API key has Database permissions

### "Collection already exists"
- The script will delete existing collections before creating new ones
- This is normal and expected

### "Cannot connect to Appwrite"
- Verify `VITE_APPWRITE_ENDPOINT` in `.env`
- Ensure Appwrite server is running and accessible

## Documentation

### 🎯 Start Here
- **[README_UNIFIED.md](./README_UNIFIED.md)** ⭐ Complete guide for the unified script

### Quick References
- **[sample-bulk-update.json](./sample-bulk-update.json)** - Template for bulk updates

### Detailed Guides
- **[docs/PERSON_TEAM_ACCOUNT_UPDATE.md](../../docs/PERSON_TEAM_ACCOUNT_UPDATE.md)** - Complete guide for team/account updates
- **[docs/USER_MANAGEMENT_SETUP.md](../../docs/USER_MANAGEMENT_SETUP.md)** - Full system documentation

## Unified Script Reference

### setup-person.js (All-in-One)

**Default: Setup all collections**
```bash
node scripts/Users/setup-person.js
```
Creates teams, persons (with team_id and user_account_id), and user_accounts collections.

**Update single person**
```bash
node scripts/Users/setup-person.js --update-person <id> --team-id <team> --account-id <account>
```

**Bulk update**
```bash
node scripts/Users/setup-person.js --bulk-update <json-file>
```

**List missing IDs**
```bash
node scripts/Users/setup-person.js --list-missing
```

**Show help**
```bash
node scripts/Users/setup-person.js --help
```

