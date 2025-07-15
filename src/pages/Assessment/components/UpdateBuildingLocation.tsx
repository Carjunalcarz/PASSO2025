import { useEffect, useState, useMemo } from 'react';
import InputField from './shared/InputField';
import SuggestionInput from './shared/SuggestionInput';
import ImageUploadGallery from '../../../components/ImageUploadGallery';
import { set } from 'lodash';
import type { ImageListType } from 'react-images-uploading';

interface BuildingLocationProps {
    reset : any
    register: any;
    setValue: any;
    watch: any;
    trigger: any;
    getNestedError: any;
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
    trigger,
    getNestedError,
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
        // Convert images to base64 format like other components
        const base64List = imageList.map(img => img.data_url.split(',')[1]);
        
        // Get the current value to avoid unnecessary updates
        const currentImageList = watch('update_buildingLocation.image_list') || [];
        
        // Only update if different
        if (JSON.stringify(currentImageList) !== JSON.stringify(base64List)) {
            setValue('update_buildingLocation.image_list', base64List);
            if (trigger) trigger('update_buildingLocation.image_list');
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

            {/* Building Location Images Section */}
            <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Building Location Photos</h3>
                
                <ImageUploadGallery
                    key={galleryKey}
                    images={imageListForPreview}
                    onChange={handleBuildingLocationImagesChange}
                    maxNumber={5}
                    multiple={true}
                    maxImageHeight="500px"
                    imageFit="cover"
                />
            </div>
        </div>
    );
};

export default UpdateBuildingLocation;
