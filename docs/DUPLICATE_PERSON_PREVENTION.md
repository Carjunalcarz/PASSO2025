# Duplicate Person Prevention Feature

## Overview
The Person module now includes a **real-time duplicate detection system** that searches for similar existing persons as you type their name in the "Add Person" form.

## How It Works

### 1. **Real-Time Search**
When adding a new person, as soon as you type **2 or more characters** in the First Name or Last Name fields, the system automatically searches for existing persons with similar names.

### 2. **Warning Display**
If similar persons are found, a **yellow warning box** appears at the top of the form showing:
- ⚠️ Warning icon and message
- A table with up to 3 similar persons showing:
  - Full Name
  - Contact Number
  - TIN
  - Status (Active/Inactive)
- Count of additional similar persons if more than 3 exist

### 3. **Search Criteria**
The system searches for matches in:
- **First Name** - Partial match
- **Middle Name** - Full name match
- **Last Name** - Partial match
- **Full Name** - Combined search

### 4. **When It Appears**
The warning appears:
- ✅ Only when **adding** a new person (not when editing)
- ✅ When you type 2+ characters in First Name or Last Name
- ✅ Updates in real-time as you continue typing
- ✅ Disappears if you clear the name fields

### 5. **When It Doesn't Appear**
The warning does NOT appear:
- ❌ When editing an existing person
- ❌ When typing less than 2 characters
- ❌ When no similar persons exist in the database

## User Experience

### Example Flow:

1. **Click "Add New" button** to open the Add Person modal
2. **Start typing** in the First Name field (e.g., "Juan")
3. **Warning appears** showing existing persons named "Juan"
4. **Review the list** to check if the person already exists
5. **Decision:**
   - If person exists → Cancel and use existing record
   - If person is different → Continue creating new record

## Visual Design

The warning box uses:
- **Yellow/Amber color scheme** for caution
- **Warning icon** for visual attention
- **Clean table layout** for easy scanning
- **Status badges** for quick identification
- **Dark mode support** for consistent theming

## Benefits

### 1. **Prevents Duplicates**
Helps avoid creating duplicate person records in the database.

### 2. **Data Quality**
Maintains cleaner data by encouraging users to check before creating.

### 3. **User-Friendly**
Non-intrusive warning that doesn't block the user from proceeding.

### 4. **Real-Time Feedback**
Instant results as you type, no need to click search buttons.

### 5. **Performance**
Efficient client-side filtering of already-loaded data.

## Technical Implementation

### State Management
```tsx
const [similarPersons, setSimilarPersons] = useState<PersonData[]>([]);
```

### Search Logic
- Triggers on `onChange` events for First Name, Middle Name, and Last Name fields
- Filters the existing `persons` array
- Case-insensitive partial matching
- Minimum 2 characters to trigger search

### Display Logic
```tsx
{!isEdit && similarPersons.length > 0 && (
  // Warning box with table
)}
```

## Customization

### Adjust Search Sensitivity
To change the minimum characters required to trigger search:
```tsx
if (!isEdit && value.length >= 2) { // Change 2 to desired number
```

### Adjust Display Limit
To show more/fewer similar persons:
```tsx
{similarPersons.slice(0, 3).map((person) => ( // Change 3 to desired number
```

### Modify Search Fields
To search additional fields (e.g., TIN, Contact):
```tsx
const similar = persons.filter(p => {
    const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.toLowerCase();
    return fullName.includes(value.toLowerCase()) || 
           p.tin?.toLowerCase().includes(value.toLowerCase()) ||
           p.contactNo?.toLowerCase().includes(value.toLowerCase());
});
```

## Future Enhancements

Potential improvements:
1. **Fuzzy matching** for typos (e.g., "Jon" matches "John")
2. **Phonetic matching** for similar-sounding names
3. **Click to auto-fill** from similar person
4. **Advanced filters** (by location, status, etc.)
5. **Merge duplicate** functionality
6. **Similarity score** ranking

## Notes

- The feature only works when adding new persons, not when editing
- Search is performed on already-loaded data (no additional API calls)
- The warning is informational only - users can still proceed to create
- Clear the form to reset the similar persons list
