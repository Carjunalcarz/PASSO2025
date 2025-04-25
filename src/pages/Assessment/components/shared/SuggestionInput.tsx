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
    labelClassName = "w-1/4"
}: SuggestionInputProps) => {
    return (
        <div className="mt-4 flex items-center">
            <label htmlFor={id} className={`ltr:mr-2 rtl:ml-2 ${labelClassName} mb-0`}>
                {label}
            </label>
            <div className="relative flex-1">
                <input
                    id={id}
                    type="text"
                    name={id}
                    className="form-input w-full"
                    placeholder={placeholder}
                    onChange={onInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => onSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestionInput;
