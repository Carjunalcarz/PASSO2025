import { useEffect } from 'react';
import InputField from './shared/InputField';
import SuggestionInput from './shared/SuggestionInput';
import { set } from 'lodash';

interface BuildingLocationProps {
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

const BuildingLocation = ({
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
    const municipality = watch("address_municipality");
    const barangay = watch("address_barangay");
    const street = watch("street");
    const province = watch("address_province")
    useEffect(() => {
        setValue("buildingLocation.address_municipality", municipality);
        setValue("buildingLocation.adress_barangay", barangay);
        setValue("buildingLocation.street", street);
        setValue("buildingLocation.province", province);
    }, [municipality, barangay, street, province, setValue])

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

                    <div className="mt-4 items-center">
                        <div className="p-2 justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            Street No. / Street
                        </div>
                        <textarea
                            id="street"
                            name="street"
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1"
                            placeholder="Enter No. / Street"
                            {...register("street")}
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
