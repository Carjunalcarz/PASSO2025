# Migration to Unified Script ✅

## What Changed

We've consolidated **two scripts into one**! 

### Before (Two Scripts)
```
setup-person.js          → Creates collections
update-person-fields.js  → Adds team_id/user_account_id fields and updates
```

### After (One Script)
```
setup-person.js  → Does EVERYTHING!
```

## Key Improvements

### ✅ Unified Functionality
- **One script** handles setup AND updates
- No need to run separate scripts
- Simpler workflow

### ✅ Fields Included from Start
- `team_id` and `user_account_id` are now part of initial setup
- No need to add them separately
- Fresh installations get everything

### ✅ Re-runnable
- Can safely re-run setup to recreate collections
- Update functions work independently
- No breaking changes

### ✅ Multiple Modes
```bash
# Setup mode (default)
node scripts/Users/setup-person.js

# Update mode
node scripts/Users/setup-person.js --update-person <id> --team-id <team>

# Bulk mode
node scripts/Users/setup-person.js --bulk-update updates.json

# List mode
node scripts/Users/setup-person.js --list-missing

# Help mode
node scripts/Users/setup-person.js --help
```

## Migration Guide

### If You Haven't Run Setup Yet

Just use the new unified script:

```bash
node scripts/Users/setup-person.js
```

Done! You get everything in one go.

### If You Already Ran Old Scripts

**Option 1: Keep using what you have**
- Your existing setup works fine
- Use `setup-person.js` for updates going forward
- Old `update-person-fields.js` still works (but deprecated)

**Option 2: Re-run setup (fresh start)**
```bash
# This will delete and recreate collections
node scripts/Users/setup-person.js
```
⚠️ **Warning:** This deletes existing data! Backup first.

### Command Migration

| Old Command | New Command |
|-------------|-------------|
| `node scripts/Users/setup-person.js` | Same! ✅ |
| `node scripts/Users/update-person-fields.js --add-attributes` | Not needed! (included in setup) |
| `node scripts/Users/update-person-fields.js --update-person <id>` | `node scripts/Users/setup-person.js --update-person <id>` |
| `node scripts/Users/update-person-fields.js --bulk-update <file>` | `node scripts/Users/setup-person.js --bulk-update <file>` |
| `node scripts/Users/update-person-fields.js --list-missing` | `node scripts/Users/setup-person.js --list-missing` |

## What's Included in Setup Now

When you run `node scripts/Users/setup-person.js`, you get:

### Teams Collection
- team_name
- description
- status

### Persons Collection
- first_name, middle_name, last_name
- owner_type_id, barangay_id
- street, tin, contact_no
- status, uid
- **team_id** ⭐ NEW (included from start)
- **user_account_id** ⭐ NEW (included from start)

### User Accounts Collection
- person_id, team_id
- appwrite_user_id
- email, role, status
- last_login

## Benefits

### 1. Simpler Workflow
**Before:**
```bash
node scripts/Users/setup-person.js
node scripts/Users/update-person-fields.js --add-attributes
node scripts/Users/update-person-fields.js --update-person <id>
```

**After:**
```bash
node scripts/Users/setup-person.js
node scripts/Users/setup-person.js --update-person <id>
```

### 2. No Missing Fields
Fresh installations automatically include team_id and user_account_id.

### 3. One Source of Truth
All functionality in one well-maintained script.

### 4. Better Help
```bash
node scripts/Users/setup-person.js --help
```
Shows all available commands.

## File Status

| File | Status | Notes |
|------|--------|-------|
| `setup-person.js` | ✅ **ACTIVE** | Use this for everything |
| `update-person-fields.js` | ❌ **REMOVED** | Functionality merged into setup-person.js |
| `sample-bulk-update.json` | ✅ **ACTIVE** | Template for bulk updates |
| `README_UNIFIED.md` | ✅ **NEW** | Complete guide for unified script |
| `README.md` | ✅ **UPDATED** | Points to unified script |

## Recommended Actions

### For New Projects
1. Read [README_UNIFIED.md](./README_UNIFIED.md)
2. Run `node scripts/Users/setup-person.js`
3. Use the same script for updates

### For Existing Projects
1. Continue using your current setup
2. Switch to unified script for new updates
3. Optional: Re-run setup for fresh start (backup first!)

## Questions?

**Q: What happened to update-person-fields.js?**  
A: It's been removed. All functionality is now in setup-person.js.

**Q: Will my existing data break?**  
A: No! The unified script is fully compatible.

**Q: What if I want to re-create collections?**  
A: Just run `node scripts/Users/setup-person.js` - it will delete and recreate.

**Q: Are the field names the same?**  
A: Yes! Everything is backward compatible.

## Summary

✅ **One script to rule them all**  
✅ **All fields included from start**  
✅ **Simpler workflow**  
✅ **Fully backward compatible**  
✅ **Better documentation**

**Bottom line:** Use `setup-person.js` for everything! 🚀
