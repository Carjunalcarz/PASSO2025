# User Management Setup Workflow

Complete guide for setting up the user management system with persons, teams, and user accounts.

## Overview

This system uses two main scripts:
1. **`setup-person.js`** - Initial setup (creates collections)
2. **`update-person-fields.js`** - Add team/account links to persons

## Complete Setup Process

### Step 1: Initial Setup (Required - Run Once)

Create all three collections: teams, persons, and user_accounts.

```bash
node scripts/Users/setup-person.js
```

**What this creates:**
- ✅ `teams` collection with team_name, description, status
- ✅ `persons` collection with name, contact, address fields
- ✅ `user_accounts` collection linking persons to teams and auth users

**Time:** ~30 seconds

### Step 2: Add Team/Account Links (Optional - If Needed)

If you need to link existing persons to teams or user accounts:

```bash
# Add the team_id and user_account_id fields
node scripts/Users/update-person-fields.js --add-attributes
```

**What this adds:**
- ✅ `team_id` field to persons collection
- ✅ `user_account_id` field to persons collection
- ✅ Indexes for both fields

**Time:** ~5 seconds

### Step 3: Update Person Records (As Needed)

Update persons with their team and account assignments:

**Option A: Single Update**
```bash
node scripts/Users/update-person-fields.js \
  --update-person <person_id> \
  --team-id <team_id> \
  --account-id <account_id>
```

**Option B: Bulk Update**
```bash
# 1. Create updates.json with your data
# 2. Run bulk update
node scripts/Users/update-person-fields.js --bulk-update updates.json
```

**Option C: Check Status**
```bash
# See which persons need updating
node scripts/Users/update-person-fields.js --list-missing
```

## Quick Reference

### Script Purposes

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `setup-person.js` | Create collections | Once, at initial setup |
| `update-person-fields.js --add-attributes` | Add team/account fields | Once, if you need person-level team tracking |
| `update-person-fields.js --update-person` | Update single person | When assigning person to team/account |
| `update-person-fields.js --bulk-update` | Update multiple persons | When migrating existing data |
| `update-person-fields.js --list-missing` | Find persons without IDs | To audit data completeness |

### File Structure

```
scripts/Users/
├── setup-person.js              # Main setup script
├── update-person-fields.js      # Update script for team/account links
├── sample-bulk-update.json      # Template for bulk updates
├── README.md                    # Full documentation
├── QUICK_START.md              # Quick reference
└── SETUP_WORKFLOW.md           # This file
```

## Common Workflows

### Workflow 1: Fresh Installation

```bash
# 1. Initial setup
node scripts/Users/setup-person.js

# 2. Add team/account fields (if needed)
node scripts/Users/update-person-fields.js --add-attributes

# Done! Start using the system
```

### Workflow 2: Existing Data Migration

```bash
# 1. Run initial setup (if not done)
node scripts/Users/setup-person.js

# 2. Add new fields
node scripts/Users/update-person-fields.js --add-attributes

# 3. Check what needs updating
node scripts/Users/update-person-fields.js --list-missing

# 4. Prepare bulk update JSON
# (Create your updates.json file)

# 5. Run bulk update
node scripts/Users/update-person-fields.js --bulk-update updates.json
```

### Workflow 3: Adding New Person with Team

```typescript
// In your application code
import { createPerson } from '@/pages/Users/services/person';

const person = await createPerson({
  firstName: 'John',
  lastName: 'Doe',
  contactNo: '123-456-7890',
  status: 'active',
  teamId: 'team_assessors',  // Assign team during creation
});
```

## Environment Setup

Ensure your `.env` file has:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://your-appwrite-endpoint
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id

# API Key (required for scripts)
APPWRITE_API_KEY=your-api-key-with-database-permissions

# Collection IDs (added after running setup-person.js)
VITE_APPWRITE_TEAMS_COLLECTION_ID=teams
VITE_APPWRITE_PERSONS_COLLECTION_ID=persons
VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID=user_accounts
```

## Verification Steps

After running setup, verify in Appwrite Console:

### Check Collections
- [ ] `teams` collection exists
- [ ] `persons` collection exists
- [ ] `user_accounts` collection exists

### Check Persons Collection Attributes
- [ ] first_name, last_name, middle_name
- [ ] owner_type_id, barangay_id
- [ ] street, tin, contact_no
- [ ] status, uid
- [ ] team_id (if you ran update-person-fields.js --add-attributes)
- [ ] user_account_id (if you ran update-person-fields.js --add-attributes)

### Check Indexes
- [ ] All foreign key indexes created
- [ ] Search indexes for names and status
- [ ] Unique indexes for user_accounts (email, appwrite_user_id)

## Troubleshooting

### "Collection already exists"
**Solution:** The script will delete and recreate. This is normal.

### "Missing APPWRITE_API_KEY"
**Solution:** Add API key to `.env` file with Database permissions.

### "Attribute already exists"
**Solution:** Normal if you've run `--add-attributes` before. Script will skip.

### "Cannot connect to Appwrite"
**Solution:** Check `VITE_APPWRITE_ENDPOINT` in `.env` and ensure Appwrite is running.

## Next Steps

After setup is complete:

1. **Create Teams**
   ```typescript
   import { createTeam } from '@/pages/Users/services/team';
   await createTeam({
     teamName: 'Assessor Team',
     description: 'Property assessment team',
     status: 'active'
   });
   ```

2. **Create Persons**
   ```typescript
   import { createPerson } from '@/pages/Users/services/person';
   await createPerson({
     firstName: 'John',
     lastName: 'Doe',
     teamId: 'team_id_here',
     status: 'active'
   });
   ```

3. **Create User Accounts**
   ```typescript
   import { createUserAccount } from '@/pages/Users/services/userAccount';
   await createUserAccount({
     personId: 'person_id_here',
     teamId: 'team_id_here',
     email: 'user@example.com',
     password: 'SecurePass123!',
     role: 'assessor'
   });
   ```

## Support

- **Full Documentation:** `scripts/Users/README.md`
- **Quick Reference:** `scripts/Users/QUICK_START.md`
- **Update Guide:** `docs/PERSON_TEAM_ACCOUNT_UPDATE.md`
