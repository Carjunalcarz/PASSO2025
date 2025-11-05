# Scripts Summary - User Management System

## File Structure

```
scripts/Users/
├── setup-person.js              ⭐ Main setup script
├── update-person-fields.js      🔧 Update/migration script
├── sample-bulk-update.json      📝 Template file
├── README.md                    📚 Main documentation
├── SETUP_WORKFLOW.md           🔄 Complete workflow guide
├── QUICK_START.md              ⚡ Quick reference
└── SCRIPTS_SUMMARY.md          📋 This file
```

## Scripts at a Glance

### 1️⃣ setup-person.js
**The main setup script - run this first!**

```bash
node scripts/Users/setup-person.js
```

**Creates:**
- ✅ `teams` collection
- ✅ `persons` collection
- ✅ `user_accounts` collection

**Run:** Once during initial setup  
**Time:** ~30 seconds  
**Requires:** APPWRITE_API_KEY in .env

---

### 2️⃣ update-person-fields.js
**Adds team/account linking to persons**

**Four modes:**

#### Mode 1: Add Attributes
```bash
node scripts/Users/update-person-fields.js --add-attributes
```
Adds `team_id` and `user_account_id` fields to persons collection.

#### Mode 2: Update Single Person
```bash
node scripts/Users/update-person-fields.js \
  --update-person <person_id> \
  --team-id <team_id> \
  --account-id <account_id>
```
Updates one person record.

#### Mode 3: Bulk Update
```bash
node scripts/Users/update-person-fields.js --bulk-update updates.json
```
Updates multiple persons from JSON file.

#### Mode 4: List Missing
```bash
node scripts/Users/update-person-fields.js --list-missing
```
Shows persons without team/account IDs.

---

## Typical Usage Flow

### New Installation
```bash
# 1. Initial setup
node scripts/Users/setup-person.js

# 2. Add team/account fields (optional)
node scripts/Users/update-person-fields.js --add-attributes

# 3. Start using the system!
```

### Migrating Existing Data
```bash
# 1. Setup (if not done)
node scripts/Users/setup-person.js

# 2. Add fields
node scripts/Users/update-person-fields.js --add-attributes

# 3. Check what needs updating
node scripts/Users/update-person-fields.js --list-missing

# 4. Bulk update
node scripts/Users/update-person-fields.js --bulk-update my-updates.json
```

## Quick Decision Tree

```
Do you have collections created?
│
├─ NO  → Run: setup-person.js
│
└─ YES → Do you need team/account links on persons?
          │
          ├─ YES → Run: update-person-fields.js --add-attributes
          │         Then update records as needed
          │
          └─ NO  → You're all set!
```

## Environment Requirements

Both scripts require in `.env`:
```env
VITE_APPWRITE_ENDPOINT=https://your-endpoint
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
APPWRITE_API_KEY=your-api-key
```

## When to Use Each Script

| Scenario | Script | Command |
|----------|--------|---------|
| First time setup | setup-person.js | `node scripts/Users/setup-person.js` |
| Add team/account fields | update-person-fields.js | `--add-attributes` |
| Assign person to team | update-person-fields.js | `--update-person` |
| Link person to account | update-person-fields.js | `--update-person` |
| Migrate many persons | update-person-fields.js | `--bulk-update` |
| Audit data | update-person-fields.js | `--list-missing` |

## Common Questions

**Q: Which script do I run first?**  
A: Always run `setup-person.js` first.

**Q: Do I need to run update-person-fields.js?**  
A: Only if you want to link persons to teams or user accounts at the person level.

**Q: Can I run setup-person.js multiple times?**  
A: Yes, but it will delete and recreate collections. Use with caution!

**Q: What's the difference between the two scripts?**  
A: 
- `setup-person.js` = Creates collections (run once)
- `update-person-fields.js` = Adds/updates team/account links (run as needed)

**Q: I already have persons. Can I add team_id later?**  
A: Yes! Use `update-person-fields.js --add-attributes` then update records.

## Need Help?

1. **Quick commands:** See [QUICK_START.md](./QUICK_START.md)
2. **Complete workflow:** See [SETUP_WORKFLOW.md](./SETUP_WORKFLOW.md)
3. **Full documentation:** See [README.md](./README.md)
4. **Update guide:** See [docs/PERSON_TEAM_ACCOUNT_UPDATE.md](../../docs/PERSON_TEAM_ACCOUNT_UPDATE.md)
