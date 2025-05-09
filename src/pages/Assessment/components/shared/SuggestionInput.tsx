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

        <div className="w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
            <div className="flex">
                <div className='flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]'>
                    {label}
                </div>
                <input
                    id={id}
                    type="text"
                    name={id}
                    className={`form-input flex-1 ltr:rounded-l-none rtl:rounded-r-none`}
                    placeholder={placeholder}
                    onChange={onInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}

                />
                {showSuggestions && suggestions.length > 0 && (
                    <div className="mt-[40px] absolute z-10 w-1/4 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto form-input">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer form-input mt-2"
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
