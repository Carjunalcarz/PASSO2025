import { useState, useEffect, useRef } from 'react';

// Sample GR data - you can modify this based on your actual data
const sampleGRData = [
    { key: '1', value: '1' },
    { key: '2', value: '2' },
    { key: '3', value: '3' },
    { key: '4', value: '4' },
    { key: '5', value: '5' },
    { key: '6', value: '6' },
    { key: '7', value: '7' },
    { key: '8', value: '8' },
    { key: '9', value: '9' },
    { key: '10', value: '10' },
    { key: '11', value: '11' },
    { key: '12', value: '12' },
    { key: '13', value: '13' },
    { key: '14', value: '14' },
    { key: '15', value: '15' },
    { key: '16', value: '16' },
    { key: '17', value: '17' },
    { key: '18', value: '18' },
    { key: '19', value: '19' },
    { key: '20', value: '20' },
    { key: '21', value: '21' },
    { key: '22', value: '22' },
    { key: '23', value: '23' },
    { key: '24', value: '24' },
    { key: '25', value: '25' },
    { key: '26', value: '26' },
    { key: '27', value: '27' },
    { key: '28', value: '28' },
    { key: '29', value: '29' },
    { key: '30', value: '30' },
];

interface Suggestion {
    key: string;
    value: string;
}

function GRFilter({ setGrFilter }: { setGrFilter: (value: string) => void }) {
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Filter suggestions based on input
    useEffect(() => {
        if (search.length > 0) {
            const filtered = sampleGRData.filter(item =>
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
        const value = e.target.value;
        setSearch(value);

        if (value.trim() === '') {
            setGrFilter('all'); // Reset filter when input is cleared
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: { key: string; value: string }) => {
        setSearch(suggestion.key);
        setGrFilter(suggestion.key);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestion(prev => 
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                handleSuggestionClick(suggestions[activeSuggestion]);
            } else if (search.trim()) {
                setGrFilter(search.trim());
                setShowSuggestions(false);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    };

    const handleBlur = () => {
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => {
            setShowSuggestions(false);
            setSuggestions([]);
        }, 200);
    };

    const handleFocus = () => {
        if (search.length > 0) {
            setShowSuggestions(true);
        }
    };

    return (
        <div className="relative">
         
            <input
                ref={inputRef}
                type="text"
                placeholder="Filter by GR..."
                value={search}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className="form-input w-full  text-black"
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.key}
                            ref={el => suggestionRefs.current[index] = el}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                index === activeSuggestion ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.key}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GRFilter; 