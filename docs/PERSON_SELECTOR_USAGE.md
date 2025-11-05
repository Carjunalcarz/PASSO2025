# Person Selector Component Usage Guide

## Overview
The `PersonSelector` component is a reusable, searchable dropdown that allows you to select existing persons from the Person table. It includes real-time search functionality and displays person details.

## Features
- ✅ **Real-time search** by name, contact number, or TIN
- ✅ **Dropdown with autocomplete**
- ✅ **Display person details** in the dropdown
- ✅ **Clear selection** button
- ✅ **Status badge** (active/inactive)
- ✅ **Dark mode support**
- ✅ **Keyboard accessible**
- ✅ **Click outside to close**

## Component Location
```
src/components/PersonSelector.tsx
```

## Basic Usage

### 1. Import the Component
```tsx
import PersonSelector from '../../components/PersonSelector';
import { type PersonResponse } from '../setup/services/person';
```

### 2. Add State Management
```tsx
const [selectedPersonId, setSelectedPersonId] = useState<string>('');
const [selectedPerson, setSelectedPerson] = useState<PersonResponse | null>(null);

const handlePersonChange = (personId: string, person: PersonResponse | null) => {
    setSelectedPersonId(personId);
    setSelectedPerson(person);
    // Use the selected person data as needed
};
```

### 3. Use in Your Form
```tsx
<PersonSelector
    value={selectedPersonId}
    onChange={handlePersonChange}
    label="Select Person"
    placeholder="Search by name, contact, or TIN..."
    required
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Selected person ID ($id) |
| `onChange` | `(personId: string, person: PersonResponse \| null) => void` | **Required** | Callback when selection changes |
| `placeholder` | `string` | `'Search and select person...'` | Input placeholder text |
| `required` | `boolean` | `false` | Whether the field is required |
| `disabled` | `boolean` | `false` | Whether the selector is disabled |
| `label` | `string` | `'Select Person'` | Label text above the selector |

## Complete Example

See the example implementation at:
```
src/pages/Users/ExamplePersonSelection.tsx
```

### Example Code:
```tsx
import { useState } from 'react';
import PersonSelector from '../../components/PersonSelector';
import { type PersonResponse } from '../setup/services/person';

const MyForm = () => {
    const [selectedPersonId, setSelectedPersonId] = useState<string>('');
    const [selectedPerson, setSelectedPerson] = useState<PersonResponse | null>(null);

    const handlePersonChange = (personId: string, person: PersonResponse | null) => {
        setSelectedPersonId(personId);
        setSelectedPerson(person);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedPerson) {
            // Use selectedPerson data
            console.log('Selected Person:', selectedPerson);
            // Submit your form with the person data
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PersonSelector
                value={selectedPersonId}
                onChange={handlePersonChange}
                label="Select Person"
                required
            />
            
            {/* Display selected person details */}
            {selectedPerson && (
                <div>
                    <p>Name: {selectedPerson.firstName} {selectedPerson.lastName}</p>
                    <p>Contact: {selectedPerson.contactNo}</p>
                </div>
            )}
            
            <button type="submit">Submit</button>
        </form>
    );
};
```

## Use Cases

### 1. **Property Owner Selection**
When creating a property record, use PersonSelector to link an existing person as the owner.

### 2. **Account Assignment**
When creating user accounts, select an existing person to associate with the account.

### 3. **Transaction Records**
Link persons to transactions, payments, or other records.

### 4. **Relationship Mapping**
Create relationships between persons and other entities in your system.

## Integration Steps

### Step 1: Add to Your Form Component
```tsx
import PersonSelector from '../../components/PersonSelector';
```

### Step 2: Add State
```tsx
const [personId, setPersonId] = useState('');
const [person, setPerson] = useState<PersonResponse | null>(null);
```

### Step 3: Add Handler
```tsx
const handlePersonSelect = (id: string, personData: PersonResponse | null) => {
    setPersonId(id);
    setPerson(personData);
};
```

### Step 4: Add to JSX
```tsx
<PersonSelector
    value={personId}
    onChange={handlePersonSelect}
    required
/>
```

### Step 5: Use Selected Data
```tsx
// In your submit handler or wherever needed
if (person) {
    const formData = {
        personId: person.$id,
        personName: `${person.firstName} ${person.lastName}`,
        // ... other fields
    };
}
```

## Styling
The component uses your existing form styles and automatically adapts to dark mode. It follows the same design patterns as other form inputs in your application.

## Search Functionality
The component searches through:
- First Name
- Middle Name
- Last Name
- Contact Number
- TIN

Search is case-insensitive and updates in real-time as you type.

## Accessibility
- Keyboard navigation supported
- Click outside to close dropdown
- Clear button for easy deselection
- Required field validation
- Proper ARIA labels

## Notes
- The component automatically fetches all persons using the `useGetAllPersons` hook
- Loading state is handled automatically
- Empty state is shown when no persons exist
- The dropdown closes automatically when a selection is made
- The selected person's full details are returned in the onChange callback
