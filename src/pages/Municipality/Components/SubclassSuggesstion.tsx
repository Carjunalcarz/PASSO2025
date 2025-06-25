import { useState, useEffect, useRef } from 'react';

// Sample data for suggestions
const sampleData = [
    { key: '10', value: '10' },
    { key: '19', value: '19' },
    { key: '20', value: '20' },
    { key: '21', value: '21' },
    { key: '22', value: '22' },
    { key: '23', value: '23' },
    { key: '24', value: '24' },
    { key: '25', value: '25' },
    { key: '26', value: '26' },
    { key: '3', value: '3' },
    { key: '4', value: '4' },
    { key: '5', value: '5' },
    { key: '6', value: '6' },
    { key: '7', value: '7' },
    { key: '8', value: '8' },
    { key: '9', value: '9' },
    { key: 'ABAC1', value: 'abac1' },
    { key: 'ABAC2', value: 'abac2' },
    { key: 'ABAC3', value: 'abac3' },
    { key: 'ABAC4', value: 'abac4' },
    { key: 'ABAL1', value: 'abal1' },
    { key: 'ABAL2', value: 'abal2' },
    { key: 'ABAL3', value: 'abal3' },
    { key: 'ABAL4', value: 'abal4' },
    { key: 'BALT', value: 'balt' },
    { key: 'BAMBU', value: 'bambu' },
    { key: 'BANA1', value: 'bana1' },
    { key: 'BANA2', value: 'bana2' },
    { key: 'BANA3', value: 'bana3' },
    { key: 'BANA4', value: 'bana4' },
    { key: 'BANATU', value: 'banatu' },
    { key: 'BANAU', value: 'banau' },
    { key: 'BANL 2', value: 'banl 2' },
    { key: 'BANL1', value: 'banl1' },
    { key: 'BANL2', value: 'banl2' },
    { key: 'BANL3', value: 'banl3' },
    { key: 'BANL4', value: 'banl4' },
    { key: 'C-1', value: 'c-1' },
    { key: 'C-2', value: 'c-2' },
    { key: 'C-3', value: 'c-3' },
    { key: 'C-4', value: 'c-4' },
    { key: 'CAM/RC1', value: 'cam/rc1' },
    { key: 'CAM/RC2', value: 'cam/rc2' },
    { key: 'CAM/RC3', value: 'cam/rc3' },
    { key: 'CAM/RC4', value: 'cam/rc4' },
    { key: 'CAM/RTCR1', value: 'cam/rtcr1' },
    { key: 'CAM/RTCR2', value: 'cam/rtcr2' },
    { key: 'CAM/RTCR3', value: 'cam/rtcr3' },
    { key: 'CAM/RTCR4', value: 'cam/rtcr4' },
    { key: 'CAM1', value: 'cam1' },
    { key: 'CAM2', value: 'cam2' },
    { key: 'CAM3', value: 'cam3' },
    { key: 'CAML', value: 'caml' },
    { key: 'CAML1', value: 'caml1' },
    { key: 'CAML2', value: 'caml2' },
    { key: 'CAML3', value: 'caml3' },
    { key: 'CAML4', value: 'caml4' },
    { key: 'CAMO4', value: 'camo4' },
    { key: 'CAMOU', value: 'camou' },
    { key: 'CAS', value: 'cas' },
    { key: 'COCL1', value: 'cocl1' },
    { key: 'COCL2', value: 'cocl2' },
    { key: 'COCL3', value: 'cocl3' },
    { key: 'COCL4', value: 'cocl4' },
    { key: 'COCO1', value: 'coco1' },
    { key: 'COCO2', value: 'coco2' },
    { key: 'COCO3', value: 'coco3' },
    { key: 'COCO4', value: 'coco4' },
    { key: 'COCOL2 (LVM)', value: 'cocol2 (lvm)' },
    { key: 'COCOS', value: 'cocos' },
    { key: 'COFL1', value: 'cofl1' },
    { key: 'COFL2', value: 'cofl2' },
    { key: 'COFL3', value: 'cofl3' },
    { key: 'COFL4', value: 'cofl4' },
    { key: 'CORL1', value: 'corl1' },
    { key: 'CORL2', value: 'corl2' },
    { key: 'CORL3', value: 'corl3' },
    { key: 'CORL4', value: 'corl4' },
    { key: 'FAL', value: 'fal' },
    { key: 'FALC1', value: 'falc1' },
    { key: 'FALCA', value: 'falca' },
    { key: 'FALCATA2', value: 'falcata2' },
    { key: 'FALCT3', value: 'falct3' },
    { key: 'FCT', value: 'fct' },
    { key: 'FISPE1', value: 'fispe1' },
    { key: 'FISPE2', value: 'fispe2' },
    { key: 'FISPE3', value: 'fispe3' },
    { key: 'FISPE4', value: 'fispe4' },
    { key: 'FISPI3', value: 'fispi3' },
    { key: 'FISPS1', value: 'fisps1' },
    { key: 'FISPS2', value: 'fisps2' },
    { key: 'FISPT1', value: 'fispt1' },
    { key: 'FISPT2', value: 'fispt2' },
    { key: 'FISPT3', value: 'fispt3' },
    { key: 'FISPT4', value: 'fispt4' },
    { key: 'FLC', value: 'flc' },
    { key: 'FLCTAU', value: 'flctau' },
    { key: 'G-1', value: 'g-1' },
    { key: 'G-2', value: 'g-2' },
    { key: 'G-3', value: 'g-3' },
    { key: 'G-4', value: 'g-4' },
    { key: 'GEM2', value: 'gem2' },
    { key: 'GIM', value: 'gim' },
    { key: 'GMN', value: 'gmn' },
    { key: 'I-1', value: 'i-1' },
    { key: 'I-2', value: 'i-2' },
    { key: 'I-3', value: 'i-3' },
    { key: 'I-4', value: 'i-4' },
    { key: 'IP/FAL1', value: 'ip/fal1' },
    { key: 'IPIL/FAL (UN)', value: 'ipil/fal (un)' },
    { key: 'IPIL/FALC', value: 'ipil/falc' },
    { key: 'IPILU', value: 'ipilu' },
    { key: 'LEGA', value: 'lega' },
    { key: 'MANG', value: 'mang' },
    { key: 'MGM', value: 'mgm' },
    { key: 'NIPAU', value: 'nipau' },
    { key: 'NONE', value: 'none' },
    { key: 'NULL', value: 'null' },
    { key: 'ORCH1', value: 'orch1' },
    { key: 'ORCH2', value: 'orch2' },
    { key: 'ORCH3', value: 'orch3' },
    { key: 'ORCH4', value: 'orch4' },
    { key: 'ORCHU', value: 'orchu' },
    { key: 'PASTU', value: 'pastu' },
    { key: 'R-1', value: 'r-1' },
    { key: 'R-2', value: 'r-2' },
    { key: 'R-3', value: 'r-3' },
    { key: 'R-4', value: 'r-4' },
    { key: 'RBR', value: 'rbr' },
    { key: 'RICI1', value: 'rici1' },
    { key: 'RICI2', value: 'rici2' },
    { key: 'RICI3', value: 'rici3' },
    { key: 'RICI4', value: 'rici4' },
    { key: 'RICO1', value: 'rico1' },
    { key: 'RICO2', value: 'rico2' },
    { key: 'RICO3', value: 'rico3' },
    { key: 'RICO4', value: 'rico4' },
    { key: 'RICU1', value: 'ricu1' },
    { key: 'RICU2', value: 'ricu2' },
    { key: 'RICU3', value: 'ricu3' },
    { key: 'RICU4', value: 'ricu4' },
    { key: 'RUB1', value: 'rub1' },
    { key: 'RUB2', value: 'rub2' },
    { key: 'RUB4', value: 'rub4' },
    { key: 'SP-4', value: 'sp-4' },
    { key: 'SWMP', value: 'swmp' },
    { key: 'TIM1', value: 'tim1' },
    { key: 'TIM2', value: 'tim2' },
    { key: 'TIM3', value: 'tim3' },
    { key: 'TIM4', value: 'tim4' },
    { key: 'TIMBL1', value: 'timbl1' },
    { key: 'TIMBL3', value: 'timbl3' },
    { key: 'TIMBL4', value: 'timbl4' },
    { key: 'YAMANI', value: 'yamani' },
];

interface Suggestion {
    key: string;
    value: string;
}

function SubclassSuggesstion({ setSubclassFilter }: { setSubclassFilter: (value: string) => void }) {
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
        const value = e.target.value;
        setSearch(value);

        if (value.trim() === '') {
            setSubclassFilter('all'); // Reset filter when input is cleared
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: { key: string; value: string }) => {
        setSearch(suggestion.key);
        setSubclassFilter(suggestion.value);
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
        <div className="max-w-md">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className="form-input"
                    placeholder="FILTER SUBCLASS"
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

export default SubclassSuggesstion;