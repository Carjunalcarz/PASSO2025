# Unified Setup Script - setup-person.js

## Overview

**One script to rule them all!** The `setup-person.js` script now handles everything:
- ✅ Initial collection setup
- ✅ Updating person records
- ✅ Bulk updates
- ✅ Listing missing data

## Quick Start

### 1. Initial Setup (Run Once)

Creates all collections with team_id and user_account_id fields included:

```bash
node scripts/Users/setup-person.js
```

**What it creates:**
- `teams` collection
- `persons` collection (with team_id and user_account_id fields)
- `user_accounts` collection

### 2. Update Operations (As Needed)

#### Update Single Person

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

#### Bulk Update from JSON

```bash
node scripts/Users/setup-person.js --bulk-update updates.json
```

**JSON Format:**
```json
[
  {
    "personId": "673abc123",
    "teamId": "team_assessors",
    "userAccountId": "acc_john"
  },
  {
    "personId": "673def456",
    "teamId": "team_admin",
    "userAccountId": "acc_jane"
  }
]
```

#### List Persons Without IDs

```bash
node scripts/Users/setup-person.js --list-missing
```

#### Show Help

```bash
node scripts/Users/setup-person.js --help
```

## All Commands

| Command | Purpose |
|---------|---------|
| `node scripts/Users/setup-person.js` | Setup all collections (default) |
| `--update-person <id> --team-id <team> --account-id <account>` | Update single person |
| `--bulk-update <json-file>` | Bulk update from JSON |
| `--list-missing` | List persons without team/account IDs |
| `--help` or `-h` | Show help message |

## Workflow Examples

### Fresh Installation

```bash
# 1. Run setup (creates everything with team_id and user_account_id)
node scripts/Users/setup-person.js

# 2. Start using the system!
```

### Re-running Setup

You can safely re-run the setup script. It will:
- Delete existing collections
- Recreate them with all fields
- Set up all indexes

```bash
# Re-create all collections
node scripts/Users/setup-person.js
```

### Migrating Existing Data

```bash
# 1. Check what needs updating
node scripts/Users/setup-person.js --list-missing

# 2. Create updates.json with your data

# 3. Run bulk update
node scripts/Users/setup-person.js --bulk-update updates.json
```

## Features

### ✅ Included in Initial Setup
- All three collections (teams, persons, user_accounts)
- **team_id** field in persons collection
- **user_account_id** field in persons collection
- All indexes for optimal performance
- Proper foreign key relationships

### ✅ Update Capabilities
- Single person updates
- Bulk updates from JSON
- Partial updates (team only, account only, or both)
- Progress tracking for bulk operations
- Error handling and reporting

### ✅ Utility Functions
- List persons missing IDs
- Validation and error messages
- Rate limiting for API calls

## Environment Setup

Required in `.env`:

```env
VITE_APPWRITE_ENDPOINT=https://your-appwrite-endpoint
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
APPWRITE_API_KEY=your-api-key-with-database-permissions

# Collection IDs (add after running setup)
VITE_APPWRITE_TEAMS_COLLECTION_ID=teams
VITE_APPWRITE_PERSONS_COLLECTION_ID=persons
VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID=user_accounts
```

## Persons Collection Schema

After running setup, the persons collection will have:

```
persons:
  - $id (PK - auto generated)
  - first_name (required)
  - middle_name
  - last_name (required)
  - owner_type_id (FK)
  - barangay_id (FK)
  - street
  - tin
  - contact_no
  - status
  - uid
  - team_id (FK → teams) ⭐ NEW
  - user_account_id (FK → user_accounts) ⭐ NEW
```

## Troubleshooting

### "Missing APPWRITE_API_KEY"
Add API key to `.env` file with Database permissions.

### "Collection already exists"
Normal when re-running setup. Script will delete and recreate.

### "Document not found"
Verify the person ID exists in the persons collection.

### "Cannot connect to Appwrite"
Check `VITE_APPWRITE_ENDPOINT` in `.env` and ensure Appwrite is running.

## Simplified Approach

**Everything in one script!**

The `setup-person.js` script now includes:
- ✅ Collection creation with all fields (including team_id and user_account_id)
- ✅ Single person updates
- ✅ Bulk updates
- ✅ Listing missing data

**No separate scripts needed!**

```bash
# Setup
node scripts/Users/setup-person.js

# Update
node scripts/Users/setup-person.js --update-person <id> --team-id <team>
```

## Benefits of Unified Script

1. **Simpler** - One script instead of two
2. **Safer** - Re-runnable without breaking existing data (for setup)
3. **Complete** - All fields included from initial setup
4. **Flexible** - Multiple operation modes in one tool
5. **Maintainable** - Single source of truth

## Quick Reference Card

```bash
# SETUP (run once or to recreate)
node scripts/Users/setup-person.js

# UPDATE ONE PERSON
node scripts/Users/setup-person.js --update-person <id> --team-id <team> --account-id <account>

# BULK UPDATE
node scripts/Users/setup-person.js --bulk-update updates.json

# CHECK STATUS
node scripts/Users/setup-person.js --list-missing

# HELP
node scripts/Users/setup-person.js --help
```

---

**That's it!** One script, all the power. 🚀
