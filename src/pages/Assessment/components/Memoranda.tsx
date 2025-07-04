import React, { useEffect, useState } from 'react';
import IconPlus from '../../../components/Icon/IconPlus';
import IconX from '../../../components/Icon/IconX';
import { useForm } from 'react-hook-form';

interface FormValues {
    ownerDetails: {
        owner: string;
    };
}

interface MemorandaEntry {
    id: number;
    date: string;
    details: string;
}

interface PropertyAssessmentItem {
    owner: string;
}

interface MemorandaProps {
    register: any;
    setValue: any;
    watch: any;
    onMemorandaChange?: (memoranda: MemorandaEntry[]) => void;
}

const Memoranda: React.FC<MemorandaProps> = ({ onMemorandaChange, register, watch, setValue }) => {
    const nextIdRef = React.useRef(2);
    
    // Initialize entries from form values if they exist
    useEffect(() => {
        const existingMemorandaData = watch('memoranda') || [{
            id: 1,
            date: '',
            details: `REVISED PERSUANT TO SEC.219 OF RA 7160 AND AS IMPLEMENTED BY SP ORDINANCE NO. 716-2024 5TH GENERAL REVISION`,
        }];
        setEntries(existingMemorandaData);
    }, []);

    const [entries, setEntries] = useState<MemorandaEntry[]>([
        { id: 1, date: '', details: `REVISED PERSUANT TO SEC.219 OF RA 7160 AND AS IMPLEMENTED BY SP ORDINANCE NO. 716-2024 5TH GENERAL REVISION`, }
    ]);

    const [showSuggestions, setShowSuggestions] = useState<number | null>(null);

    const suggestions = [
        "REVISED PERSUANT TO SEC.219 OF RA 7160 AND AS IMPLEMENTED BY SP ORDINANCE NO. 716-2025 6TH GENERAL REVISION",
        "REVISED PERSUANT TO SEC.219 OF RA 7160 AND AS IMPLEMENTED BY SP ORDINANCE NO. 716-2024 5TH GENERAL REVISION"
    ];

    const addEntry = () => {
        const newEntry = {
            id: nextIdRef.current,
            date: '',
            details: ''
        };
        nextIdRef.current += 1; // Increment the ID counter
        const updatedEntries = [...entries, newEntry];
        setEntries(updatedEntries);
        onMemorandaChange?.(updatedEntries);
    };

    const removeEntry = (id: number) => {
        if (entries.length === 1) return;
        const updatedEntries = entries.filter(entry => entry.id !== id);
        setEntries(updatedEntries);
        onMemorandaChange?.(updatedEntries);
    };

    const updateEntry = (id: number, field: keyof MemorandaEntry, value: string) => {
        const updatedEntries = entries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        );
        setEntries(updatedEntries);
        setValue('memoranda', updatedEntries); // Update form data
        onMemorandaChange?.(updatedEntries);
    };

    const owner = watch('ownerDetails.owner');

    return (
        <div className="w-full">
            <div className="mb-4">
            <h2 className='text-xl px-10 text-wrap text-left mb-8'>MEMORANDA</h2>
                <div className="space-y-4">
                    {entries.map((entry, index) => (
                        <div key={entry.id} className="flex gap-4 items-start border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4">
                            <div className="w-1/4">
                                <label className="block text-sm font-medium mb-2">Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    {...register(`memoranda.${index}.date`)}
                                    onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                                />
                            </div>
                            <div className="flex-1 relative">
                                <label className="block text-sm font-medium mb-2">Details</label>
                                <textarea
                                    className="form-textarea w-full"
                                    rows={3}
                                    {...register(`memoranda.${index}.details`)}
                                    onChange={(e) => updateEntry(entry.id, 'details', e.target.value)}
                                    onFocus={() => setShowSuggestions(entry.id)}
                                    placeholder="Enter memoranda details..."
                                />
                                {showSuggestions === entry.id && (
                                    <div className="absolute z-10 w-full bg-white dark:bg-navy-700 border border-[#e0e6ed] dark:border-[#17263c] rounded-lg mt-1 shadow-lg">
                                        {suggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-navy-600 cursor-pointer"
                                                onClick={() => {
                                                    updateEntry(entry.id, 'details', suggestion);
                                                    setShowSuggestions(null);
                                                }}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className="mt-8 text-danger hover:text-danger-dark"
                                onClick={() => removeEntry(entry.id)}
                            >
                                <IconX className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <button
                type="button"
                className="btn btn-primary"
                onClick={addEntry}
            >
                <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                Add Memoranda Entry
            </button>
        </div>
    );
};

export default Memoranda;