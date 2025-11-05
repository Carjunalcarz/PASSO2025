import { useState, useEffect, useRef } from 'react';
import { useGetAllPersons } from '../pages/Users/hooks/usePersons';
import { type PersonResponse } from '../pages/setup/services/person';

interface PersonSelectorProps {
    value?: string; // Selected person ID
    onChange: (personId: string, person: PersonResponse | null) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string;
}

const PersonSelector = ({
    value,
    onChange,
    placeholder = 'Search and select person...',
    required = false,
    disabled = false,
    label = 'Select Person'
}: PersonSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const { data: persons = [], isLoading } = useGetAllPersons();
    
    // Find selected person
    const selectedPerson = persons.find(p => p.$id === value);
    
    // Filter persons based on search
    const filteredPersons = persons.filter(person => {
        const fullName = `${person.firstName} ${person.middleName || ''} ${person.lastName}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || 
               person.contactNo?.toLowerCase().includes(search) ||
               person.tin?.toLowerCase().includes(search);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (person: PersonResponse) => {
        onChange(person.$id, person);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        onChange('', null);
        setSearchTerm('');
    };

    const displayText = selectedPerson 
        ? `${selectedPerson.firstName} ${selectedPerson.middleName || ''} ${selectedPerson.lastName}`.trim()
        : '';

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                <input
                    type="text"
                    className="form-input pr-20"
                    placeholder={placeholder}
                    value={isOpen ? searchTerm : displayText}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                    required={required}
                    readOnly={!isOpen}
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        disabled={disabled}
                    >
                        <svg 
                            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Dropdown List */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : filteredPersons.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            {searchTerm ? 'No persons found' : 'No persons available'}
                        </div>
                    ) : (
                        <ul className="py-1">
                            {filteredPersons.map((person) => (
                                <li
                                    key={person.$id}
                                    onClick={() => handleSelect(person)}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                        value === person.$id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {person.firstName} {person.middleName || ''} {person.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {person.contactNo && <span className="mr-3">📞 {person.contactNo}</span>}
                                                {person.tin && <span>🆔 {person.tin}</span>}
                                            </div>
                                        </div>
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                            person.status === 'active' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {person.status}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default PersonSelector;
