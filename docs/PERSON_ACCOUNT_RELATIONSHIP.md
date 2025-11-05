# Person-Account Relationship Schema

## Overview
This document explains the correct relationship between **Person** and **Account** tables in the RPTAS system.

## Schema Design

### Correct Relationship Flow
```
Person (Created First)
   ↓
   └─ person_id (FK in Account table)
      ↓
   Account (Created Later)
```

### Why This Design?

1. **Person exists independently** - A person can exist in the system without an account
2. **Account references Person** - When creating an account, you select an existing person
3. **One-to-One or One-to-Many** - A person can have zero, one, or multiple accounts (depending on business rules)

## Table Structures

### Person Table
```javascript
{
  $id: "unique_person_id",           // Primary Key (auto-generated)
  first_name: "Juan",                // Required
  middle_name: "Dela",               // Optional
  last_name: "Cruz",                 // Required
  owner_type_id: "owner_type_123",   // FK → owner_types table
  barangay_id: "barangay_456",       // FK → barangays table
  street: "123 Main St",             // Optional
  tin: "123-456-789",                // Optional
  contact_no: "09171234567",         // Optional
  status: "active",                  // active/inactive
  uid: "user_uid_123",               // Optional
  $createdAt: "2024-01-01T00:00:00",
  $updatedAt: "2024-01-01T00:00:00"
}
```

### Account Table (Should Have)
```javascript
{
  $id: "unique_account_id",          // Primary Key (auto-generated)
  person_id: "unique_person_id",     // FK → persons table (REQUIRED)
  username: "jdelacruz",             // Required
  email: "juan@example.com",         // Required
  password_hash: "hashed_password",  // Required
  role: "user",                      // admin/user/etc
  status: "active",                  // active/inactive/suspended
  last_login: "2024-01-01T00:00:00",
  $createdAt: "2024-01-01T00:00:00",
  $updatedAt: "2024-01-01T00:00:00"
}
```

## Workflow Example

### Step 1: Create Person
```typescript
// User fills out person form
const personData = {
  firstName: "Juan",
  middleName: "Dela",
  lastName: "Cruz",
  contactNo: "09171234567",
  tin: "123-456-789",
  status: "active"
};

// Create person record
const person = await createPerson(personData);
// Returns: { $id: "person_123", firstName: "Juan", ... }
```

### Step 2: Create Account for Person
```typescript
// Later, create an account for this person
const accountData = {
  person_id: "person_123",  // Reference to the person created above
  username: "jdelacruz",
  email: "juan@example.com",
  password: "secure_password",
  role: "user",
  status: "active"
};

// Create account record
const account = await createAccount(accountData);
```

## Implementation Guide

### 1. Update Account Table Schema

Create or update your account setup script to include `person_id`:

```javascript
// In scripts/Users/setup-account.js
await this.createStringAttribute(collectionId, 'person_id', 100, true);
await this.delay(300);

// Create index for person_id
await this.createIndex(collectionId, 'person_id_fk_index', 'key', ['person_id']);
```

### 2. Account Service Layer

```typescript
// src/pages/Users/services/account.ts
export interface AccountData {
    person_id: string;        // Required - FK to persons table
    username: string;
    email: string;
    password?: string;
    role: string;
    status: string;
}

export const createAccount = async (data: AccountData) => {
    const response = await databases.createDocument(
        appwriteConfig.databaseId,
        'accounts',
        ID.unique(),
        {
            person_id: data.person_id,  // Link to person
            username: data.username,
            email: data.email,
            // ... other fields
        }
    );
    return response;
};
```

### 3. Account Creation UI

```typescript
// In your Account creation form
import PersonSelector from '../../components/PersonSelector';

const CreateAccount = () => {
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [accountData, setAccountData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });

    const handleSubmit = async () => {
        await createAccount({
            person_id: selectedPersonId,  // Use selected person
            ...accountData
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Person Selector - Search existing persons */}
            <PersonSelector
                value={selectedPersonId}
                onChange={(id, person) => setSelectedPersonId(id)}
                label="Select Person"
                required
            />
            
            {/* Account fields */}
            <input name="username" ... />
            <input name="email" ... />
            <input name="password" ... />
            
            <button type="submit">Create Account</button>
        </form>
    );
};
```

## Benefits of This Design

### 1. **Data Integrity**
- Person information is stored once
- No duplication of personal data
- Easier to maintain and update

### 2. **Flexibility**
- A person can exist without an account (e.g., property owners who don't need login)
- A person can have multiple accounts (e.g., different roles)
- Easy to link other entities to persons (properties, transactions, etc.)

### 3. **Better Queries**
```typescript
// Get person details for an account
const account = await getAccount(accountId);
const person = await getPerson(account.person_id);

// Get all accounts for a person
const accounts = await getAccountsByPersonId(personId);

// Get person with their account(s)
const personWithAccounts = {
    ...person,
    accounts: await getAccountsByPersonId(person.$id)
};
```

## Migration Steps

If you already have data with the old schema:

### 1. Run the Updated Setup Script
```bash
npm run setup:persons
```

This will recreate the persons table without `account_id`.

### 2. Update Account Table
Create a script to add `person_id` to accounts table:
```bash
npm run setup:accounts
```

### 3. Data Migration (if needed)
If you have existing data, you'll need to:
1. Export existing persons and accounts
2. Map the relationships correctly
3. Re-import with the new schema

## Foreign Key Relationships

### Current Relationships
```
persons
  ├─ owner_type_id → owner_types
  └─ barangay_id → barangays

accounts
  └─ person_id → persons (NEW)

properties (future)
  └─ owner_person_id → persons
```

## Best Practices

### 1. **Always Create Person First**
```typescript
// ✅ Correct
const person = await createPerson(personData);
const account = await createAccount({ person_id: person.$id, ... });

// ❌ Wrong
const account = await createAccount({ ... }); // No person reference
```

### 2. **Use PersonSelector Component**
Always use the PersonSelector component when creating accounts to ensure:
- Person exists in the system
- No duplicate persons
- Proper linking

### 3. **Validate Person Exists**
```typescript
// Before creating account, verify person exists
const person = await getPersonById(person_id);
if (!person) {
    throw new Error('Person not found');
}
```

### 4. **Handle Cascade Deletes**
Consider what happens when:
- A person is deleted → What happens to their account(s)?
- An account is deleted → Person remains in system

## Example Use Cases

### Use Case 1: Property Owner Without Account
```typescript
// Create person (property owner)
const owner = await createPerson({
    firstName: "Maria",
    lastName: "Santos",
    contactNo: "09181234567"
});

// Link property to person (no account needed)
const property = await createProperty({
    owner_person_id: owner.$id,
    address: "123 Main St"
});
```

### Use Case 2: User With Account
```typescript
// Create person
const person = await createPerson({
    firstName: "Pedro",
    lastName: "Reyes"
});

// Create account for login
const account = await createAccount({
    person_id: person.$id,
    username: "preyes",
    email: "pedro@example.com",
    password: "secure123"
});
```

### Use Case 3: Admin With Multiple Roles
```typescript
// One person, multiple accounts
const person = await createPerson({ ... });

const adminAccount = await createAccount({
    person_id: person.$id,
    username: "admin_juan",
    role: "admin"
});

const userAccount = await createAccount({
    person_id: person.$id,
    username: "user_juan",
    role: "user"
});
```

## Summary

✅ **Person** = Independent entity (personal information)
✅ **Account** = References Person (login credentials)
✅ **Flow** = Create Person → Create Account with person_id
✅ **Benefit** = Clean separation, no duplication, flexible relationships

This design follows database normalization principles and provides a solid foundation for your RPTAS system.
