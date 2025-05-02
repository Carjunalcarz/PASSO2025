import React, { useState } from 'react';
import IconPlus from '../../../components/Icon/IconPlus';
import IconX from '../../../components/Icon/IconX';

interface MemorandaEntry {
    id: number;
    date: string;
    details: string;
}

interface MemorandaProps {
    onMemorandaChange?: (memoranda: MemorandaEntry[]) => void;
}

const Memoranda: React.FC<MemorandaProps> = ({ onMemorandaChange }) => {
    const [entries, setEntries] = useState<MemorandaEntry[]>([
        { id: 1, date: '', details: '' }
    ]);

    const addEntry = () => {
        const newEntry = {
            id: entries.length + 1,
            date: '',
            details: ''
        };
        const updatedEntries = [...entries, newEntry];
        setEntries(updatedEntries);
        onMemorandaChange?.(updatedEntries);
    };

    const removeEntry = (id: number) => {
        if (entries.length === 1) return; // Keep at least one entry
        const updatedEntries = entries.filter(entry => entry.id !== id);
        setEntries(updatedEntries);
        onMemorandaChange?.(updatedEntries);
    };

    const updateEntry = (id: number, field: keyof MemorandaEntry, value: string) => {
        const updatedEntries = entries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        );
        setEntries(updatedEntries);
        onMemorandaChange?.(updatedEntries);
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <h4 className="text-xl font-semibold mb-4">Memoranda</h4>
                <div className="space-y-4">
                    {entries.map((entry) => (
                        <div key={entry.id} className="flex gap-4 items-start border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4">
                            <div className="w-1/4">
                                <label className="block text-sm font-medium mb-2">Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={entry.date}
                                    onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Details</label>
                                <textarea
                                    className="form-textarea w-full"
                                    rows={3}
                                    value={entry.details}
                                    onChange={(e) => updateEntry(entry.id, 'details', e.target.value)}
                                    placeholder="Enter memoranda details..."
                                />
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
