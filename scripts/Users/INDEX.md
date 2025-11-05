# User Management Scripts - Documentation Index

## 🚀 Getting Started

**New to this system?** Start here:

1. Read [SCRIPTS_SUMMARY.md](./SCRIPTS_SUMMARY.md) - 2 min overview
2. Follow [SETUP_WORKFLOW.md](./SETUP_WORKFLOW.md) - Step-by-step guide
3. Run `node scripts/Users/setup-person.js` - Initial setup

## 📚 Documentation Files

### For Quick Reference
- **[SCRIPTS_SUMMARY.md](./SCRIPTS_SUMMARY.md)** ⚡  
  Quick overview of all scripts and when to use them

- **[QUICK_START.md](./QUICK_START.md)** ⚡  
  Command cheat sheet for update operations

### For Complete Guides
- **[SETUP_WORKFLOW.md](./SETUP_WORKFLOW.md)** 🔄  
  Complete setup workflow with examples

- **[README.md](./README.md)** 📖  
  Full documentation with all details

- **[docs/PERSON_TEAM_ACCOUNT_UPDATE.md](../../docs/PERSON_TEAM_ACCOUNT_UPDATE.md)** 📘  
  Detailed guide for team/account updates

## 🛠️ Script Files

### Main Scripts
- **[setup-person.js](./setup-person.js)**  
  Initial setup - creates all collections

- **[update-person-fields.js](./update-person-fields.js)**  
  Update script - adds team/account links

### Templates
- **[sample-bulk-update.json](./sample-bulk-update.json)**  
  Template for bulk updates

## 📋 Quick Command Reference

```bash
# Initial Setup (run once)
node scripts/Users/setup-person.js

# Add team/account fields (optional, run once)
node scripts/Users/update-person-fields.js --add-attributes

# Update single person
node scripts/Users/update-person-fields.js --update-person <id> --team-id <team> --account-id <account>

# Bulk update
node scripts/Users/update-person-fields.js --bulk-update updates.json

# Check status
node scripts/Users/update-person-fields.js --list-missing
```

## 🎯 Choose Your Path

### I'm setting up for the first time
→ Read [SETUP_WORKFLOW.md](./SETUP_WORKFLOW.md)  
→ Run `setup-person.js`

### I need to update existing persons
→ Read [QUICK_START.md](./QUICK_START.md)  
→ Use `update-person-fields.js`

### I want to understand everything
→ Read [README.md](./README.md)  
→ Read [docs/PERSON_TEAM_ACCOUNT_UPDATE.md](../../docs/PERSON_TEAM_ACCOUNT_UPDATE.md)

### I just need the commands
→ See [QUICK_START.md](./QUICK_START.md)

## 🔍 Find What You Need

| I want to... | Read this |
|--------------|-----------|
| Understand what each script does | [SCRIPTS_SUMMARY.md](./SCRIPTS_SUMMARY.md) |
| Set up from scratch | [SETUP_WORKFLOW.md](./SETUP_WORKFLOW.md) |
| Update existing data | [QUICK_START.md](./QUICK_START.md) |
| Learn about team/account links | [docs/PERSON_TEAM_ACCOUNT_UPDATE.md](../../docs/PERSON_TEAM_ACCOUNT_UPDATE.md) |
| See all details | [README.md](./README.md) |
| Get command examples | [QUICK_START.md](./QUICK_START.md) |
| Understand the workflow | [SETUP_WORKFLOW.md](./SETUP_WORKFLOW.md) |

## 📞 Support

If you're stuck:
1. Check the troubleshooting section in [README.md](./README.md)
2. Verify your `.env` configuration
3. Check Appwrite console for collection status
4. Review error messages carefully

## ✅ Checklist

Before you start:
- [ ] Node.js 18+ installed
- [ ] `.env` file configured
- [ ] `APPWRITE_API_KEY` added to `.env`
- [ ] Appwrite server running and accessible

After setup:
- [ ] Collections created (teams, persons, user_accounts)
- [ ] Environment variables updated
- [ ] Service files working
- [ ] Can create/read/update persons

---

**Last Updated:** November 2025  
**Scripts Version:** 1.0  
**Main Script:** `setup-person.js`
