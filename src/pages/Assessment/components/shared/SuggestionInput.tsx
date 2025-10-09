import React, { useState, useRef, useEffect } from 'react';

interface SuggestionInputProps {
    id: string;
    label: string;
    placeholder: string;
    suggestions: string[];
    showSuggestions: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSuggestionClick: (suggestion: string) => void;
    setShowSuggestions: (show: boolean) => void;
    labelClassName?: string;
    value?: string;
    error?: any;
}

const SuggestionInput = ({
    id,
    label,
    placeholder,
    suggestions,
    showSuggestions,
    onInputChange,
    onSuggestionClick,
    setShowSuggestions,
    labelClassName = "w-1/4",
    value = "",
    error
}: SuggestionInputProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHoveredIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHoveredIndex(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (hoveredIndex >= 0 && hoveredIndex < suggestions.length) {
                    onSuggestionClick(suggestions[hoveredIndex]);
                    setShowSuggestions(false);
                    setHoveredIndex(-1);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setHoveredIndex(-1);
                break;
        }
    };

    const handleSuggestionHover = (index: number) => {
        setHoveredIndex(index);
    };

    const handleSuggestionClick = (suggestion: string) => {
        onSuggestionClick(suggestion);
        setShowSuggestions(false);
        setHoveredIndex(-1);
    };

    // Reset hovered index when suggestions change
    useEffect(() => {
        setHoveredIndex(-1);
    }, [suggestions]);

    return (
        <div className="w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
            <div className="flex">
                <div className='flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]'>
                    {label}
                </div>
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    name={id}
                    className={`form-input flex-1 ltr:rounded-l-none rtl:rounded-r-none`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div 
                        ref={suggestionsRef}
                        className="mt-[40px] absolute z-10 w-1/4 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto form-input"
                    >
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className={`px-4 py-2 cursor-pointer form-input mt-2 ${
                                    index === hoveredIndex 
                                        ? 'bg-blue-100 border-blue-300' 
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => handleSuggestionHover(index)}
                                onMouseLeave={() => setHoveredIndex(-1)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && (
                <div className="text-red-500 text-sm mt-1 ml-4">
                    {error}
                </div>
            )}
        </div>
    );
};

export default SuggestionInput;
