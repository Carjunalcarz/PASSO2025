# Schema Update Summary - Person & Account Relationship

## What Changed

### ✅ Person Table (Updated)
**Removed:**
- ❌ `account_id` field (no longer needed)
- ❌ `account_id_fk_index` index

**Current Structure:**
```
persons
├─ $id (PK)
├─ first_name (required)
├─ middle_name
├─ last_name (required)
├─ owner_type_id (FK → owner_types)
├─ barangay_id (FK → barangays)
├─ street
├─ tin
├─ contact_no
├─ status
└─ uid
```

### 🔄 Account Table (Needs Update)
**Should Add:**
- ✅ `person_id` field (FK → persons table, required)
- ✅ `person_id_fk_index` index

**Recommended Structure:**
```
accounts
├─ $id (PK)
├─ person_id (FK → persons, required) ← NEW
├─ username (required)
├─ email (required)
├─ password_hash (required)
├─ role
├─ status
└─ last_login
```

## Files Updated

### 1. Database Schema
- ✅ `scripts/Users/setup-person.js` - Removed account_id field

### 2. Service Layer
- ✅ `src/pages/setup/services/person.ts` - Removed accountId from types

### 3. UI Components
- ✅ `src/pages/Users/Person.tsx` - Removed accountId from forms and mutations

### 4. Components Created
- ✅ `src/components/PersonSelector.tsx` - Searchable dropdown for selecting persons

### 5. Documentation
- ✅ `docs/PERSON_ACCOUNT_RELATIONSHIP.md` - Complete schema guide
- ✅ `docs/PERSON_SELECTOR_USAGE.md` - Component usage guide
- ✅ `docs/DUPLICATE_PERSON_PREVENTION.md` - Duplicate detection feature

## Correct Workflow

### Old (Incorrect) Flow
```
❌ Create Account → Get account_id → Create Person with account_id
```

### New (Correct) Flow
```
✅ Create Person → Get person.$id → Create Account with person_id
```

## Next Steps

### 1. Run Updated Setup Script
```bash
npm run setup:persons
```

This will recreate the persons table with the correct schema (without account_id).

### 2. Create/Update Account Setup Script
Create `scripts/Users/setup-account.js` with `person_id` field:

```javascript
// Add person_id attribute
await this.createStringAttribute(collectionId, 'person_id', 100, true);

// Add person_id index
await this.createIndex(collectionId, 'person_id_fk_index', 'key', ['person_id']);
```

### 3. Update Account Service
Update `src/pages/Users/services/account.ts`:

```typescript
export interface AccountData {
    person_id: string;  // Required FK
    username: string;
    email: string;
    password?: string;
    role: string;
    status: string;
}
```

### 4. Update Account Creation UI
Use PersonSelector component in account creation form:

```typescript
import PersonSelector from '../../components/PersonSelector';

<PersonSelector
    value={selectedPersonId}
    onChange={(id, person) => setSelectedPersonId(id)}
    label="Select Person"
    required
/>
```

## Benefits

### ✅ Data Integrity
- Person data stored once
- No duplication
- Single source of truth

### ✅ Flexibility
- Person can exist without account
- Person can have multiple accounts
- Easy to link other entities

### ✅ Better Queries
```typescript
// Get person for an account
const account = await getAccount(accountId);
const person = await getPerson(account.person_id);

// Get all accounts for a person
const accounts = await getAccountsByPersonId(personId);
```

## Features Added

### 1. Duplicate Person Prevention
When adding a new person, the system now:
- Searches for similar names in real-time
- Shows warning with matching persons
- Displays up to 3 similar persons in a table
- Helps prevent duplicate entries

### 2. PersonSelector Component
Reusable searchable dropdown that:
- Searches persons by name, contact, or TIN
- Shows person details in dropdown
- Returns full person object on selection
- Supports dark mode

## Testing Checklist

- [ ] Run `npm run setup:persons` successfully
- [ ] Create new person without account_id field
- [ ] Verify duplicate detection works when typing names
- [ ] Test PersonSelector component in a form
- [ ] Create account setup script with person_id
- [ ] Update account creation to use PersonSelector
- [ ] Test creating account linked to person

## Migration Notes

If you have existing data:
1. Export current persons and accounts
2. Map relationships correctly
3. Re-import with new schema
4. Verify all relationships are correct

## Support

For questions or issues:
1. Check `docs/PERSON_ACCOUNT_RELATIONSHIP.md` for detailed schema info
2. Check `docs/PERSON_SELECTOR_USAGE.md` for component usage
3. Review example in `src/pages/Users/ExamplePersonSelection.tsx`
