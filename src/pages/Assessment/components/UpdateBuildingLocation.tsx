import { useEffect } from 'react';
import InputField from './shared/InputField';
import SuggestionInput from './shared/SuggestionInput';
import { set } from 'lodash';

interface BuildingLocationProps {
    reset : any
    register: any;
    setValue: any;
    watch: any;
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

const UpdateBuildingLocation = ({
    setValue,
    watch,
    register,
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
    const update_municipality = watch("update_buildingLocation.update_address_municipality");
    const update_barangay = watch("update_buildingLocation.update_address_barangay");
    const update_street = watch("update_buildingLocation.update_street");
    const update_province = watch("update_buildingLocation.update_address_province");

    const handleMunicipalityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue("update_buildingLocation.update_address_municipality", e.target.value);
        handleInputChangeMunicipality(e);
    };

    const handleBarangayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue("update_buildingLocation.update_address_barangay", e.target.value);
        handleInputChangeBarangay(e);
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue("update_buildingLocation.update_address_province", e.target.value);
        handleInputChangeProvince(e);
    };

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
                        onInputChange={handleMunicipalityChange}
                        onSuggestionClick={(suggestion) => {
                            setValue("update_buildingLocation.update_address_municipality", suggestion);
                            handleSuggestionClickMunicipality(suggestion);
                        }}
                        setShowSuggestions={setShowMunicipalitySuggestions}
                        value={update_municipality || ""}
                    />

                    <SuggestionInput
                        id="address_barangay"
                        label="Barangay :"
                        placeholder="Enter Barangay"
                        suggestions={barangaySuggestions}
                        showSuggestions={showBarangaySuggestions}
                        onInputChange={handleBarangayChange}
                        onSuggestionClick={(suggestion) => {
                            setValue("update_buildingLocation.update_address_barangay", suggestion);
                            handleSuggestionClickBarangay(suggestion);
                        }}
                        setShowSuggestions={setShowBarangaySuggestions}
                        labelClassName="w-1/4"
                        value={update_barangay || ""}
                    />

                    <div className="mt-4 items-center">
                        <div className="p-2 justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            Street No. / Street
                        </div>
                        <textarea
                            value={update_street || ""}
                            id="street"
                            name="street"
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1"
                            placeholder="Enter No. / Street"
                            {...register("update_buildingLocation.update_street")}
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
                        onInputChange={handleProvinceChange}
                        onSuggestionClick={(suggestion) => {
                            setValue("update_buildingLocation.update_address_province", suggestion);
                            handleSuggestionClickProvince(suggestion);
                        }}
                        setShowSuggestions={setShowProvinceSuggestions}
                        value={update_province || ""}
                    />
                </div>
            </div>
        </div>
    );
};

export default UpdateBuildingLocation;
