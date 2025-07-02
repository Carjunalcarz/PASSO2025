import { useState, useEffect, useRef } from 'react';

// Sample data for suggestions
const sampleData = [
    { key: 'TDN', value: 'tdn' },
    { key: 'PIN', value: 'pin' },
    { key: 'Name', value: 'name' },
    { key: 'Market Value', value: 'market_val' },
    { key: 'Assessment Value', value: 'ass_value' },
    { key: 'Area', value: 'area' },
    { key: 'Unit Value', value: 'unit_val' },
    { key: 'Kind', value: 'kind' },
    { key: 'Ass Level', value: 'ass_level' },
    { key: 'Classification', value: 'classification' },
    { key: 'Sub Class', value: 'sub_class' },
    { key: 'Taxability', value: 'taxability' },
    { key: 'Transaction Code', value: 'trans_cd' },
    { key: 'Tax Beg Yr', value: 'tax_beg_yr' },
    { key: 'Eff Date', value: 'eff_date' },
    { key: 'Owner No', value: 'owner_no' },
    { key: 'Municipality Code', value: 'mun_code' },
    { key: 'Municipality', value: 'municipality' },
    { key: 'Barangay Code', value: 'barangay_code' },
    { key: 'Barangay', value: 'barangay' },
    { key: 'GR Code', value: 'gr_code' },
    { key: 'GR', value: 'gr' },
];

interface Suggestion {
    key: string;
    value: string;
}

function SearchWithSuggestions({ setSearchColumn }: { setSearchColumn: (value: string) => void }) {
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionRefs = useRef([]);

    // Filter suggestions based on input
    useEffect(() => {
        if (search.length > 0) {
            const filtered = sampleData.filter(item =>
                item.key.toLowerCase().includes(search.toLowerCase())
            ).slice(0, 8); // Limit to 8 suggestions
            setSuggestions(filtered);
            setShowSuggestions(true);
            setActiveSuggestion(-1);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [search]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSuggestionClick = (suggestion: { key: string; value: string }) => {
        setSearch(suggestion.key);
        setSearchColumn(suggestion.value);
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveSuggestion(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    handleSuggestionClick(suggestions[activeSuggestion]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setActiveSuggestion(-1);
                break;
        }
    };

    const handleBlur = () => {
        // Delay hiding suggestions to allow clicks
        setTimeout(() => setShowSuggestions(false), 150);
    };

    const handleFocus = () => {
        if (search.length > 0 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className="form-input"
                    placeholder="SELECT COLUMN"
                    value={search}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                />

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                ref={el => suggestionRefs.current[index] = el as never}
                                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${index === activeSuggestion ? 'bg-blue-100 text-blue-900' : ''
                                    }`}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => setActiveSuggestion(index)}
                            >
                                {suggestion.key}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchWithSuggestions;