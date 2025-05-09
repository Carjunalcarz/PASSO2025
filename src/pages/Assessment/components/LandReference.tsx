// components/LandReference.tsx

import InputField from './shared/InputField';


const LandReference: React.FC<{ register: any }> = ({ register }) => {
    return (
        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
            <h2 className="text-xl px-5 text-wrap text-left">LAND REFERENCE</h2>
            <div className="flex justify-between lg:flex-row flex-col m-5">
                {/* Left Column */}
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <InputField
                        label="Owner :"
                        id="land_owner"
                        type="text"
                        placeholder="Enter Owner"
                        {...register('landReference.land_owner')}
                    />

                    <InputField
                        label="Block No. :"
                        id="block_no"
                        type="text"
                        placeholder="Enter Block No."
                        {...register('landReference.block_no')}
                    />

                    <InputField
                        label="TDN No. :"
                        id="tdn_no"
                        type="text"
                        placeholder="Enter TDN No."
                        {...register('landReference.tdn_no')}
                    />
                    <InputField
                        label="PIN. :"
                        id="pin"
                        type="text"
                        placeholder="Enter PIN."
                        {...register('landReference.pin')}
                    />
                </div>

                {/* Right Column */}
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <InputField
                        label="Lot No. :"
                        id="lot_no"
                        type="text"
                        placeholder="Enter Lot No."
                        {...register('landReference.lot_no')}
                    />

                    <InputField
                        label="Survey No. :"
                        id="survey_no"
                        type="text"
                        placeholder="Enter Survey No."
                        {...register('landReference.survey_no')}
                    />

                    <InputField
                        label="Area :"
                        id="area"
                        type="text"
                        placeholder="Enter Area"
                        {...register('landReference.area')}
                    />
                </div>
            </div>
        </div>
    );
};

export default LandReference;
