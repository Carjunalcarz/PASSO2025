# Person Collection Update - Team ID and User Account ID

## Overview

This document describes the update to the `persons` collection to add `team_id` and `user_account_id` fields, enabling better integration between persons, teams, and user accounts.

## Prerequisites

Before running the update script, ensure you have:
1. Run the main setup script: `node scripts/Users/setup-person.js`
2. Created the `persons`, `teams`, and `user_accounts` collections
3. Have a valid `APPWRITE_API_KEY` in your `.env` file

## Changes Made

### 1. Database Schema Updates

Added two new fields to the `persons` collection:

- **`team_id`** (string, optional, 100 chars)
  - Foreign key reference to the `teams` collection
  - Links a person to their assigned team
  - Indexed for performance

- **`user_account_id`** (string, optional, 100 chars)
  - Foreign key reference to the `user_accounts` collection
  - Links a person to their user account (if they have one)
  - Indexed for performance

### 2. Service Layer Updates

Updated `src/pages/Users/services/person.ts`:

- Added `teamId` and `userAccountId` to `PersonData` interface
- Added `teamId` and `userAccountId` to `PersonResponse` interface
- Updated `mapDbToFrontend` to map `team_id` ↔ `teamId` and `user_account_id` ↔ `userAccountId`
- Updated `createPerson` to include new fields
- Updated `updatePerson` to handle new fields

### 3. UI Updates

Updated `src/pages/Users/pages/person/PersonForm.tsx`:

- Added `teamId` and `userAccountId` to form state
- Updated create and update mutations to include new fields

### 4. Update Script

Created `scripts/Users/update-person-fields.js` with the following capabilities:

- Add new attributes to existing persons collection
- Update individual person records
- Bulk update from JSON file
- List persons missing team/account IDs

## Usage Guide

### Step 1: Add Attributes to Collection

Run this command to add the new fields to your existing persons collection:

```bash
node scripts/Users/update-person-fields.js --add-attributes
```

**What it does:**
- Adds `team_id` attribute (string, 100 chars, optional)
- Adds `user_account_id` attribute (string, 100 chars, optional)
- Creates indexes for both fields
- Handles existing attributes gracefully (won't fail if already exists)

### Step 2: Update Person Records

You have three options for updating person records:

#### Option A: Single Person Update

Update one person at a time:

```bash
node scripts/Users/update-person-fields.js --update-person <person_id> --team-id <team_id> --account-id <account_id>
```

**Examples:**

```bash
# Update with both team and account
node scripts/Users/update-person-fields.js --update-person 673abc123 --team-id team_xyz --account-id acc_123

# Update only team
node scripts/Users/update-person-fields.js --update-person 673abc123 --team-id team_xyz

# Update only account
node scripts/Users/update-person-fields.js --update-person 673abc123 --account-id acc_123
```

#### Option B: Bulk Update from JSON

For updating multiple persons at once:

1. Create a JSON file (e.g., `my-updates.json`):

```json
[
  {
    "personId": "673abc123",
    "teamId": "team_assessors",
    "userAccountId": "acc_john_doe"
  },
  {
    "personId": "673def456",
    "teamId": "team_admin",
    "userAccountId": "acc_jane_smith"
  },
  {
    "personId": "673ghi789",
    "teamId": "team_assessors",
    "userAccountId": "acc_bob_jones"
  }
]
```

2. Run the bulk update:

```bash
node scripts/Users/update-person-fields.js --bulk-update my-updates.json
```

**Features:**
- Processes updates sequentially
- Shows progress for each person
- Provides summary at the end (success/failed counts)
- Includes rate limiting to avoid overwhelming the API

#### Option C: List Missing IDs

To identify which persons need updating:

```bash
node scripts/Users/update-person-fields.js --list-missing
```

**Output:**
```
📋 === PERSONS WITHOUT TEAM/ACCOUNT IDs ===

Found 3 persons without IDs:

ID: 673abc123
Name: John Doe
Team ID: ❌ NOT SET
User Account ID: ❌ NOT SET
---
ID: 673def456
Name: Jane Smith
Team ID: team_admin
User Account ID: ❌ NOT SET
---
```

## Data Relationships

```
┌─────────────┐
│   persons   │
│             │
│  - $id      │
│  - team_id ─┼──────┐
│  - user_    │      │
│    account_ │      │
│    id ──────┼──┐   │
└─────────────┘  │   │
                 │   │
                 │   │
                 ▼   ▼
         ┌──────────────┐      ┌──────────┐
         │user_accounts │      │  teams   │
         │              │      │          │
         │  - $id       │      │  - $id   │
         │  - person_id │      │  - name  │
         │  - team_id   │      └──────────┘
         │  - email     │
         └──────────────┘
```

## Workflow Examples

### Example 1: New Person with Team Assignment

```typescript
// Create a person and assign to a team
const person = await createPerson({
  firstName: 'John',
  lastName: 'Doe',
  contactNo: '123-456-7890',
  status: 'active',
  teamId: 'team_assessors'  // Assign to team immediately
});
```

### Example 2: Create User Account and Link to Person

```typescript
// 1. Create person
const person = await createPerson({
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'active'
});

// 2. Create user account
const userAccount = await createUserAccount({
  personId: person.data.$id,
  teamId: 'team_admin',
  email: 'jane@example.com',
  password: 'SecurePass123!',
  role: 'admin'
});

// 3. Update person with user account ID
await updatePerson(person.data.$id, {
  userAccountId: userAccount.data.$id,
  teamId: 'team_admin'
});
```

### Example 3: Bulk Migration Script

```javascript
// Get all persons without user accounts
const persons = await getAllPersons();
const updates = [];

for (const person of persons.data) {
  if (!person.userAccountId && person.contactNo) {
    // Create user account for person
    const account = await createUserAccount({
      personId: person.$id,
      email: `${person.firstName.toLowerCase()}.${person.lastName.toLowerCase()}@example.com`,
      password: generateRandomPassword(),
      role: 'user',
      teamId: determineTeamForPerson(person)
    });
    
    updates.push({
      personId: person.$id,
      teamId: determineTeamForPerson(person),
      userAccountId: account.data.$id
    });
  }
}

// Save updates to JSON
fs.writeFileSync('bulk-updates.json', JSON.stringify(updates, null, 2));

// Run bulk update
// node scripts/Users/update-person-fields.js --bulk-update bulk-updates.json
```

## Migration Checklist

- [ ] **Step 1:** Backup your persons collection data
- [ ] **Step 2:** Run `--add-attributes` to add new fields
- [ ] **Step 3:** Verify attributes were created in Appwrite console
- [ ] **Step 4:** Run `--list-missing` to identify persons needing updates
- [ ] **Step 5:** Prepare bulk update JSON file or update individually
- [ ] **Step 6:** Run bulk update or individual updates
- [ ] **Step 7:** Verify updates in Appwrite console
- [ ] **Step 8:** Test PersonForm with new fields
- [ ] **Step 9:** Update any existing code that creates/updates persons

## Troubleshooting

### "Attribute already exists"

This is normal if you've run `--add-attributes` before. The script will skip existing attributes.

### "Document not found"

Verify the person ID exists:
```bash
# Check in Appwrite console or use the API
```

### "Invalid team_id or user_account_id"

Ensure the IDs you're using exist in their respective collections:
- Team IDs must exist in the `teams` collection
- User account IDs must exist in the `user_accounts` collection

### Bulk update partially failed

The script will show which updates succeeded and which failed. You can:
1. Check the error messages for failed updates
2. Create a new JSON file with only the failed updates
3. Re-run the bulk update

## Best Practices

1. **Always backup** before running bulk updates
2. **Test with a single record** before bulk updating
3. **Validate IDs** exist before assigning them
4. **Use meaningful team names** that reflect organizational structure
5. **Keep person records** even if user accounts are deleted (soft delete)
6. **Document team assignments** for audit purposes

## Security Considerations

- Only users with admin API keys can run these scripts
- Ensure API key is stored securely in `.env` file
- Never commit API keys to version control
- Limit access to update scripts to authorized personnel
- Log all bulk updates for audit trail

## Future Enhancements

Potential improvements for consideration:

1. **Validation script** - Verify all team_id and user_account_id references are valid
2. **Audit logging** - Track who made changes and when
3. **Rollback capability** - Ability to undo bulk updates
4. **CSV import** - Support CSV files for bulk updates
5. **Interactive mode** - CLI wizard for guided updates
6. **Dry-run mode** - Preview changes before applying

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the README in `scripts/Users/README.md`
3. Check Appwrite console for collection status
4. Verify API key permissions
