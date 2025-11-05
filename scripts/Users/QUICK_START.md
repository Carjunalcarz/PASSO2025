# Quick Start - Update Person Fields

## Prerequisites

First, ensure you've run the main setup:
```bash
node scripts/Users/setup-person.js
```

## TL;DR

```bash
# 1. Add new fields to persons collection
node scripts/Users/update-person-fields.js --add-attributes

# 2. Check which persons need updating
node scripts/Users/update-person-fields.js --list-missing

# 3. Update a single person
node scripts/Users/update-person-fields.js --update-person <person_id> --team-id <team_id> --account-id <account_id>

# 4. Or bulk update from JSON
node scripts/Users/update-person-fields.js --bulk-update updates.json
```

## What This Does

Adds `team_id` and `user_account_id` fields to the persons collection so you can:
- Link persons to teams
- Link persons to their user accounts
- Track team membership at the person level

## Quick Examples

### Add Fields (Run Once)

```bash
node scripts/Users/update-person-fields.js --add-attributes
```

### Update One Person

```bash
# With both team and account
node scripts/Users/update-person-fields.js \
  --update-person 673abc123 \
  --team-id team_assessors \
  --account-id acc_john

# Just team
node scripts/Users/update-person-fields.js \
  --update-person 673abc123 \
  --team-id team_assessors

# Just account
node scripts/Users/update-person-fields.js \
  --update-person 673abc123 \
  --account-id acc_john
```

### Bulk Update

1. Create `updates.json`:
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

2. Run:
```bash
node scripts/Users/update-person-fields.js --bulk-update updates.json
```

### Find Missing IDs

```bash
node scripts/Users/update-person-fields.js --list-missing
```

## Sample JSON Template

Copy `sample-bulk-update.json` and modify:

```json
[
  {
    "personId": "your_person_id_here",
    "teamId": "your_team_id_here",
    "userAccountId": "your_account_id_here"
  }
]
```

## Common Issues

**"Missing APPWRITE_API_KEY"**
- Add `APPWRITE_API_KEY=your_key` to `.env` file

**"Attribute already exists"**
- Normal! Fields already added. Skip to updating records.

**"Document not found"**
- Check person ID is correct
- Verify in Appwrite console

## Need More Help?

See full documentation: `docs/PERSON_TEAM_ACCOUNT_UPDATE.md`
