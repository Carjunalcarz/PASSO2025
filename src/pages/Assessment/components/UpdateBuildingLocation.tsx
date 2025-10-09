import { useEffect, useState, useMemo } from 'react';
import InputField from './shared/InputField';
import SuggestionInput from './shared/SuggestionInput';
import ImageUploadGallery from '../../../components/ImageUploadGallery';
import { set } from 'lodash';
import type { ImageListType } from 'react-images-uploading';

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
}

// Define floor options and GR code mapping
const FLOOR_OPTIONS = ["5TH", "6TH"] as const;
const GR_CODE_MAP: Record<string, string> = {
    "5TH": "22",
    "6TH": "25",
    
} as const;

const gr_options = ["5TH", "6TH"];
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
    const image_list = watch("update_buildingLocation.image_list");
    const currentYear = new Date().getFullYear();
    const gr_name = watch("buildingLocation.gr_name");
    const year = watch("update_buildingLocation.update_year");
    // Add back the missing handler functions
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

    // Handle building location images change
    const handleBuildingLocationImagesChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        // Handle empty image list (when "Remove All" is clicked)
        if (!imageList || imageList.length === 0) {
            setValue('update_buildingLocation.image_list', []);
            return;
        }

        // Convert images to base64 format like other components
        const base64List = imageList.map(img => img.data_url.split(',')[1]);

        // Get the current value to avoid unnecessary updates
        const currentImageList = watch('update_buildingLocation.image_list') || [];

        // Only update if different
        if (JSON.stringify(currentImageList) !== JSON.stringify(base64List)) {
            setValue('update_buildingLocation.image_list', base64List);
        }
    };

    // Simplified and more stable image processing for API data
    const imageListForPreview: ImageListType = useMemo(() => {
        if (!Array.isArray(image_list) || image_list.length === 0) {
            return [];
        }

        return image_list.map((imageData, index) => {
            // Handle different possible formats from API
            let dataUrl = '';

            // If it's already a data URL
            if (typeof imageData === 'string' && imageData.startsWith('data:')) {
                dataUrl = imageData;
            }
            // If it's a base64 string without prefix
            else if (typeof imageData === 'string') {
                // Determine the correct prefix based on the base64 signature
                let prefix = 'data:image/png;base64,';
                if (imageData.startsWith('/9j/')) {
                    prefix = 'data:image/jpeg;base64,';
                } else if (imageData.startsWith('iVBORw0KGgo')) {
                    prefix = 'data:image/png;base64,';
                } else if (imageData.startsWith('R0lGODlh') || imageData.startsWith('R0lGODdh')) {
                    prefix = 'data:image/gif;base64,';
                } else if (imageData.startsWith('UklGR')) {
                    prefix = 'data:image/webp;base64,';
                }
                dataUrl = `${prefix}${imageData}`;
            }
            // If it's an object with data_url property
            else if (typeof imageData === 'object' && imageData !== null && 'data_url' in imageData) {
                dataUrl = imageData.data_url;
            }
            // If it's an object with dataURL property (alternative format)
            else if (typeof imageData === 'object' && imageData !== null && 'dataURL' in imageData) {
                dataUrl = imageData.dataURL;
            }
            // Fallback: try to convert to string
            else {
                const stringData = String(imageData);
                if (stringData.startsWith('data:')) {
                    dataUrl = stringData;
                } else {
                    // Assume it's base64 and add PNG prefix
                    dataUrl = `data:image/png;base64,${stringData}`;
                }
            }

            return {
                data_url: dataUrl
            };
        });
    }, [image_list]);

    // Generate a key that changes when API data is loaded
    const galleryKey = useMemo(() => {
        if (!Array.isArray(image_list) || image_list.length === 0) {
            return 'empty';
        }
        // Check if this looks like API data (base64 strings)
        const isApiData = image_list.some(img =>
            typeof img === 'string' && !img.startsWith('data:')
        );
        return isApiData ? `api-${image_list.length}` : 'upload';
    }, [image_list]);


    const handleGRChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setValue("update_buildingLocation.update_gr_name", selectedValue);
        
        const code = GR_CODE_MAP[selectedValue] || "";
        setValue("update_buildingLocation.update_gr_code", code);
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

                    {/* Year */}
                    <div className="mt-4 flex items-center">
                        <div className="p-2 justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            Year :
                        </div>
                        <select 
                            name="year" 
                            id="year" 
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1" 
                            {...register("update_buildingLocation.update_year")}
                        >
                            <option value={currentYear}>{currentYear}</option>
                            <option value={currentYear + 3}>{currentYear + 3}</option>
                            <option value={currentYear + 2}>{currentYear + 2}</option>
                            <option value={currentYear + 1}>{currentYear + 1}</option>
                            <option value={currentYear }>{currentYear }</option>
                            <option value={currentYear - 1}>{currentYear - 1}</option>
                            <option value={currentYear - 2}>{currentYear - 2}</option>
                            <option value={currentYear - 3}>{currentYear - 3}</option>
                            <option value={currentYear - 4}>{currentYear - 4}</option>
                        </select>
                    </div>


                    {/* GR Year */}
                        <div className="mt-4 flex items-center">
                        <div className="p-2 justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            GR Year :
                        </div>
                        <select
                            name="gr"
                            id="gr"
                            value={gr_name}
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1"
                            onChange={handleGRChange}
                        >
                            <option value={watch("update_buildingLocation.update_gr_name")}>{watch("update_buildingLocation.update_gr_name")}</option>
                            {gr_options.map((option) => (
                                <option key={option} value={option}>
                                    {option} ({GR_CODE_MAP[option]})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                </div>
                
            </div>

            {/* Building Location Images Section */}
            {/* Image Upload Section */}
            <div className="mt-6 border-t pt-6 w-full flex justify-center items-center">
                <div className="w-full max-w-3xl mx-auto text-center">
                    <h3 className="text-lg font-semibold mb-6 text-center">Location Photos</h3>
                    <div className="flex justify-center">
                        <ImageUploadGallery
                            key={galleryKey}
                            images={imageListForPreview}
                            onChange={handleBuildingLocationImagesChange}
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

export default UpdateBuildingLocation;
