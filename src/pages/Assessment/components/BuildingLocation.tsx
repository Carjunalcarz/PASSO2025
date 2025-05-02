import SuggestionInput from './shared/SuggestionInput';

interface BuildingLocationProps {
    municipalitySuggestions: string[];
    provinceSuggestions: string[];
    barangaySuggestions: string[];
    showMunicipalitySuggestions: boolean;
    showProvinceSuggestions: boolean;
    showBarangaySuggestions: boolean;
    handleInputChangeMunicipality: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleInputChangeProvince: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleInputChangeBarangay: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSuggestionClickMunicipality: (suggestion: string) => void;
    handleSuggestionClickProvince: (suggestion: string) => void;
    handleSuggestionClickBarangay: (suggestion: string) => void;
    setShowMunicipalitySuggestions: (show: boolean) => void;
    setShowProvinceSuggestions: (show: boolean) => void;
    setShowBarangaySuggestions: (show: boolean) => void;
}

const BuildingLocation = ({
    municipalitySuggestions,
    provinceSuggestions,
    barangaySuggestions,
    showMunicipalitySuggestions,
    showProvinceSuggestions,
    showBarangaySuggestions,
    handleInputChangeMunicipality,
    handleInputChangeProvince,
    handleInputChangeBarangay,
    handleSuggestionClickMunicipality,
    handleSuggestionClickProvince,
    handleSuggestionClickBarangay,
    setShowMunicipalitySuggestions,
    setShowProvinceSuggestions,
    setShowBarangaySuggestions,
}: BuildingLocationProps) => {
    return (
        <div className="px-10 border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
            <h2 className='text-xl px-5 text-wrap text-left mb-8'>BUILDING LOCATION</h2>

            <div className="mt-5 flex justify-between lg:flex-row flex-col">
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <SuggestionInput
                        id="address_municipality"
                        label="Municipality :"
                        placeholder="Enter Municipality"
                        suggestions={municipalitySuggestions}
                        showSuggestions={showMunicipalitySuggestions}
                        onInputChange={handleInputChangeMunicipality}
                        onSuggestionClick={handleSuggestionClickMunicipality}
                        setShowSuggestions={setShowMunicipalitySuggestions}
                    />

                    <SuggestionInput
                        id="address_barangay"
                        label="Barangay :"
                        placeholder="Enter Barangay"
                        suggestions={barangaySuggestions}
                        showSuggestions={showBarangaySuggestions}
                        onInputChange={handleInputChangeBarangay}
                        onSuggestionClick={handleSuggestionClickBarangay}
                        setShowSuggestions={setShowBarangaySuggestions}
                        labelClassName="w-1/4"
                    />

                    <div className="mt-4 flex items-center">
                        <label htmlFor="street" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
                            NO. / Street :
                        </label>
                        <textarea
                            id="street"
                            name="street"
                            className="form-textarea flex-1 resize-none rounded-lg border border-[#e0e6ed] bg-white px-4 py-2 text-sm font-normal text-black focus:border-primary focus:outline-none dark:border-[#17263c] dark:bg-[#121e32] dark:text-white-dark"
                            placeholder="Enter No. / Street"
                        ></textarea>
                    </div>
                </div>

                <div className="lg:w-1/2 w-full">
                    <SuggestionInput
                        id="address_province"
                        label="Province :"
                        placeholder="Enter Province"
                        suggestions={provinceSuggestions}
                        showSuggestions={showProvinceSuggestions}
                        onInputChange={handleInputChangeProvince}
                        onSuggestionClick={handleSuggestionClickProvince}
                        setShowSuggestions={setShowProvinceSuggestions}
                    />
                </div>
            </div>
        </div>
    );
};

export default BuildingLocation;
