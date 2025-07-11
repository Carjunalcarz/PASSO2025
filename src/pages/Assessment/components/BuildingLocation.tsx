import { useEffect } from 'react';
import InputField from './shared/InputField';
import SuggestionInput from './shared/SuggestionInput';
import { set } from 'lodash';
import ImageUploadGallery from '../../../components/ImageUploadGallery';

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
    // Add image upload props
    locationPhotos?: any[];
    onLocationPhotosChange?: (imageList: any[]) => void;
    onPreviewImage?: (imageUrl: string) => void;
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
    // Add image upload props
    locationPhotos = [],
    onLocationPhotosChange,
    onPreviewImage,
}: BuildingLocationProps) => {
    const municipality = watch("address_municipality");
    const barangay = watch("address_barangay");
    const street = watch("street");
    const province = watch("address_province")

    const handleLocationPhotosChange = (imageList: any[]) => {
        const base64List = imageList.map(img => img.data_url);
        setValue("buildingLocation.image_list", base64List);
        if (onLocationPhotosChange) onLocationPhotosChange(imageList);
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
                        onInputChange={(e) => {
                            handleInputChangeMunicipality(e);
                            setValue("address_municipality", e.target.value);
                            setValue("buildingLocation.address_municipality", e.target.value);
                        }}
                        onSuggestionClick={(suggestion) => {
                            handleSuggestionClickMunicipality(suggestion);
                            setValue("address_municipality", suggestion);
                            setValue("buildingLocation.address_municipality", suggestion);
                        }}
                        setShowSuggestions={setShowMunicipalitySuggestions}
                        value={municipality || ""}
                    />

                    <SuggestionInput
                        id="address_barangay"
                        label="Barangay :"
                        placeholder="Enter Barangay"
                        suggestions={barangaySuggestions}
                        showSuggestions={showBarangaySuggestions}
                        onInputChange={(e) => {
                            handleInputChangeBarangay(e);
                            setValue("address_barangay", e.target.value);
                            setValue("buildingLocation.address_barangay", e.target.value);
                        }}
                        onSuggestionClick={(suggestion) => {
                            handleSuggestionClickBarangay(suggestion);
                            setValue("address_barangay", suggestion);
                            setValue("buildingLocation.address_barangay", suggestion);
                        }}
                        setShowSuggestions={setShowBarangaySuggestions}
                        labelClassName="w-1/4"
                        value={barangay || ""}
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
                            {...register("buildingLocation.street")}
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
                        onInputChange={(e) => {
                            handleInputChangeProvince(e);
                            setValue("address_province", e.target.value);
                            setValue("buildingLocation.address_province", e.target.value);
                        }}
                        onSuggestionClick={(suggestion) => {
                            handleSuggestionClickProvince(suggestion);
                            setValue("address_province", suggestion);
                            setValue("buildingLocation.address_province", suggestion);
                        }}
                        setShowSuggestions={setShowProvinceSuggestions}
                        value={province || ""}
                    />
                </div>
                
            </div>

            {/* Location Photos Section */}
            <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 px-5">Location Photos</h3>
                <p className="text-sm text-gray-600 mb-4 px-5">
                    Upload photos of the building location, street view, and surrounding area
                </p>
                
                <div className="px-5">
                    <ImageUploadGallery
                        images={locationPhotos}
                        onChange={handleLocationPhotosChange}
                        maxNumber={5}
                        multiple={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default BuildingLocation;
