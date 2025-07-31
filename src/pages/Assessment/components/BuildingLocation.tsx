import { useEffect } from 'react';
import InputField from './shared/InputField';
import SuggestionInput from './shared/SuggestionInput';
import { set } from 'lodash';
import ImageUploadGallery from '../../../components/ImageUploadGallery';

interface BuildingLocationProps {
    reset: any
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

// Define floor options and GR code mapping
const FLOOR_OPTIONS = ["5TH", "6TH"] as const;
const GR_CODE_MAP: Record<string, string> = {
    "5TH": "22",
    "6TH": "25",
    
} as const;

const gr_options = ["5TH", "6TH"];

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
    const year = new Date().getFullYear();
    const gr = watch("buildingLocation.gr_name") || "5TH";
  
    // Set default values when component mounts
    useEffect(() => {
        // Set default values if they are empty
        if (!province) {
            setValue("address_province", "Agusan del Norte");
            setValue("buildingLocation.address_province", "Agusan del Norte");
        }

        if (!watch("buildingLocation.year")) {
            setValue("buildingLocation.year", year);
        }

        // Set default GR values if not set
        if (!watch("buildingLocation.gr_name")) {
            setValue("buildingLocation.gr_name", "5TH");
            setValue("buildingLocation.gr_code", "22");
        }
    }, [setValue, watch, year, province]);

    const handleLocationPhotosChange = (imageList: any[]) => {
        setValue("buildingLocation.image_list", imageList);
        if (onLocationPhotosChange) onLocationPhotosChange(imageList);
    };

    const handleGRChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setValue("buildingLocation.gr_name", selectedValue);
        
        const code = GR_CODE_MAP[selectedValue] || "";
        setValue("buildingLocation.gr_code", code);
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
                        value={municipality}
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
                        value={barangay}
                    />

                    <div className="mt-4 flex items-center">
                        <div className="p-2 justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            Street No. / Street
                        </div>
                        <input
                            id="street"
                            name="street"
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1"
                            placeholder="Enter No. / Street"
                            {...register("buildingLocation.street")}
                        />
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
                        value={province}
                    />
                    
                    <div className="mt-4 flex items-center">
                        <div className="p-2 justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            Year :
                        </div>
                        <select 
                            name="year" 
                            id="year" 
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1" 
                            {...register("buildingLocation.year")}
                        >
                            <option value={year.toString()}>{year}</option>
                            <option value={year - 1}>{year - 1}</option>
                            <option value={year - 2}>{year - 2}</option>
                            <option value={year - 3}>{year - 3}</option>
                            <option value={year - 4}>{year - 4}</option>
                        </select>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                        <div className="p-2 justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            GR :
                        </div>
                        <select
                            name="gr"
                            id="gr"
                            value={gr}
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1"
                            onChange={handleGRChange}
                        >
                            <option value="">Select GR Year</option>
                            {gr_options.map((option) => (
                                <option key={option} value={option}>
                                    {option} ({GR_CODE_MAP[option]})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Location Photos Section */}
            <div className="mt-6 border-t border-white-light dark:border-[#17263c]   pt-6 w-full flex justify-center items-center">
                <div className="w-full max-w-3xl mx-auto text-center">
                    <h3 className="text-lg font-semibold mb-6 text-center">Location Photos</h3>
                    <div className="flex justify-center">
                        <ImageUploadGallery
                            images={locationPhotos}
                            onChange={handleLocationPhotosChange}
                            maxNumber={5}
                            multiple={true}
                            maxImageHeight="500px"
                            maxImageWidth="500px"
                            imageFit="contain"
                            containerWidth="500px"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuildingLocation;
