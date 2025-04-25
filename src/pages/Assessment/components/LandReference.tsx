import InputField from './shared/InputField';

interface LandReferenceProps {
    // Add any props if needed for form state management
    onInputChange?: (
        field: 'land_owner' | 'block_no' | 'tdn_no' | 'lot_no' | 'survey_no' | 'area',
        value: string
    ) => void;
}

const LandReference = ({ onInputChange }: LandReferenceProps) => {
    return (
        <div className="px-10">
            <h2 className='text-xl px-5 text-wrap text-left'>LAND REFERENCE</h2>
            <div className="flex justify-between lg:flex-row flex-col">
                {/* Left Column */}
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <InputField
                        label="Owner :"
                        id="land_owner"
                        type="text"
                        placeholder="Enter Owner"
                        required={true}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange?.('land_owner', e.target.value)}
                    />

                    <InputField
                        label="Block No. :"
                        id="block_no"
                        type="text"
                        placeholder="Enter Block No."
                        onChange={(e) => onInputChange?.('block_no', e.target.value)}
                    />

                    <InputField
                        label="TDN No. :"
                        id="tdn_no"
                        type="text"
                        placeholder="Enter TDN No."
                        onChange={(e) => onInputChange?.('tdn_no', e.target.value)}
                    />
                </div>

                {/* Right Column */}
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <InputField
                        label="Lot No. :"
                        id="lot_no"
                        type="text"
                        placeholder="Enter Lot No."
                        onChange={(e) => onInputChange?.('lot_no', e.target.value)}
                    />

                    <InputField
                        label="Survey No. :"
                        id="survey_no"
                        type="text"
                        placeholder="Enter Survey No."
                        onChange={(e) => onInputChange?.('survey_no', e.target.value)}
                    />

                    <InputField
                        label="Area :"
                        id="area"
                        type="text"
                        placeholder="Enter Area"
                        onChange={(e) => onInputChange?.('area', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default LandReference;
