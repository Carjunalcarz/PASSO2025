import React from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import IconX from '../../../components/Icon/IconX';
import InputField from './shared/InputField';
import { Controller } from 'react-hook-form';
import ConstructionCost from './gendesc_component/ConstructionCost';
import ImageUploadGallery from '../../../components/ImageUploadGallery';

interface GeneralDescriptionProps {
    setValue: any;
    watch: any;
    register: any;
    images1: ImageListType;
    images2: ImageListType;
    onChange1: (imageList: ImageListType) => void;
    onChange2: (imageList: ImageListType) => void;
    onInputChange?: (field: string, value: string) => void;
    onPreviewImage?: (imageUrl: string) => void;
    control: any;
}

// Define form values interface
interface FormValues {
    totalFloorArea: number;
    kind_of_bldg: string;
    structural_type: string;
    building_permit_no: string;
    cct: File | null;
    certificate_of_completion_issued_on: string;
    certificate_of_occupancy_issued_on: string;
    date_of_constructed_completed: string;
    date_of_occupied: string;
    bldg_age: string; // Changed from number to string to match input value type
    no_of_storeys: string;
    area_of_1st_floor: string;
    area_of_2nd_floor: string;
    area_of_3rd_floor: string;
    area_of_4th_floor: string;
    total_floor_area: string;
    floor_plan: File[];
    cct_image: File[];
    floor_plan_image: File[];
}

const GeneralDescription: React.FC<GeneralDescriptionProps> = ({
    register,
    setValue,
    watch,
    images1,
    images2,
    onChange1,
    onChange2,
    onInputChange,
    onPreviewImage,
    control
}) => {
    // Initialize form values with proper typing
    const [formValues, setFormValues] = React.useState<FormValues>({
        totalFloorArea: 0,
        kind_of_bldg: '',
        structural_type: '',
        building_permit_no: '',
        cct: null,
        certificate_of_completion_issued_on: '',
        certificate_of_occupancy_issued_on: '',
        date_of_constructed_completed: '',
        date_of_occupied: '',
        bldg_age: '',
        no_of_storeys: '',
        area_of_1st_floor: '',
        area_of_2nd_floor: '',
        area_of_3rd_floor: '',
        area_of_4th_floor: '',
        total_floor_area: '',
        floor_plan: [],
        cct_image: [],
        floor_plan_image: []
    });


    // Get current form values
    const buildingPermitNo = watch('generalDescription.building_permit_no');
    const certificateOfCompletion = watch('generalDescription.certificate_of_completion_issued_on');
    const certificateOfOccupancy = watch('generalDescription.certificate_of_occupancy_issued_on');
    const dateOfOccupied = watch('generalDescription.date_of_occupied');
    const bldgAge = watch('generalDescription.bldg_age');
    const noOfStoreys = watch('generalDescription.no_of_storeys');
    const areaOf1stFloor = watch('generalDescription.area_of_1st_floor');
    const areaOf2ndFloor = watch('generalDescription.area_of_2nd_floor');
    const areaOf3rdFloor = watch('generalDescription.area_of_3rd_floor');
    const areaOf4thFloor = watch('generalDescription.area_of_4th_floor');
    const totalFloorArea = watch('generalDescription.total_floor_area');
    const cct_image = watch('generalDescription.cct_image');
    const floor_plan_image = watch('generalDescription.floor_plan_image');

    // Helper function to render input fields with proper typing and current values
    const renderInputField = (
        id: keyof FormValues,
        label: string,
        type: string = 'text',
        placeholder: string = '',
        currentValue?: string
    ) => (
        <InputField
            label={label}
            id={id}
            type={type}
            placeholder={placeholder}
            className="w-1/2"
            labelClassName="w-1/3"
            value={currentValue || ""}
            {...register(`generalDescription.${id}`)}
        />
    );

    const floor1 = watch('generalDescription.area_of_1st_floor');
    const floor2 = watch('generalDescription.area_of_2nd_floor');
    const floor3 = watch('generalDescription.area_of_3rd_floor');
    const floor4 = watch('generalDescription.area_of_4th_floor');

    React.useEffect(() => {
        const totalFloorArea = Number(floor1) + Number(floor2) + Number(floor3) + Number(floor4);
        if (totalFloorArea > 0) {
            setValue('generalDescription.total_floor_area', totalFloorArea);
        }
    }, [floor1, floor2, floor3, floor4, setValue]);

    const handleFloorPlanChange = (imageList: ImageListType) => {
        setValue('generalDescription.floor_plan_image', imageList);
        onChange2(imageList);
    };

    const handleCCTChange = (imageList: ImageListType) => {
        // If you want to store only the URLs:
        const urlList = imageList
            .filter(img => img && typeof img.data_url === 'string')
            .map(img => img.data_url);
        setValue('generalDescription.cct_image', urlList);
        onChange1(imageList);
    };

    const images1ForPreview = React.useMemo(() => {
        if (!Array.isArray(images1)) return [];
        return images1
            .filter(Boolean)
            .map(img => {
                // If it's already an object with data_url, use as is
                if (img && typeof img === 'object' && typeof img.data_url === 'string') return img;
                // If it's a string (URL), wrap it
                if (typeof img === 'string') return { data_url: img };
                return null;
            })
            .filter(img => !!img && typeof img.data_url === 'string' && img.data_url.length > 0);
    }, [images1]);

    const images2ForPreview = React.useMemo(() => {
        if (!Array.isArray(images2)) return [];
        return images2
            .filter(Boolean)
            .map(img => {
                if (img && typeof img === 'object' && typeof img.data_url === 'string') return img;
                if (typeof img === 'string') return { data_url: img };
                return null;
            })
            .filter(img => !!img && typeof img.data_url === 'string' && img.data_url.length > 0);
    }, [images2]);

    const cctImageForPreview = React.useMemo(() => {
        if (!Array.isArray(cct_image)) return [];
        return cct_image
            .filter(img => !!img && (typeof img === 'string' || (typeof img === 'object' && typeof img.data_url === 'string')))
            .map(img => typeof img === 'string' ? { data_url: img } : img);
    }, [cct_image]);

    const floorPlanImageForPreview = React.useMemo(() => {
        if (!Array.isArray(floor_plan_image)) return [];
        return floor_plan_image
            .filter(img => !!img && (typeof img === 'string' || (typeof img === 'object' && typeof img.data_url === 'string')))
            .map(img => typeof img === 'string' ? { data_url: img } : img);
    }, [floor_plan_image]);

    return (
        <div className="px-10">
            <h2 className='text-xl px-5 text-wrap text-left mb-6'>GENERAL DESCRIPTION</h2>

            <div className="overflow-x-auto table-responsive">
                <table className="min-w-full border-collapse border border-gray-300">
                    <tbody>
                        {/* Building Information */}
                        <tr>
                            <td className="p-3 w-full">
                                <ConstructionCost
                                    register={register}
                                    setValue={setValue}
                                    watch={watch}
                                />
                            </td>
                        </tr>

                        {/* Building Details */}
                        <tr>
                            <td className="p-3 w-full">
                                {renderInputField('building_permit_no', 'Building Permit No.', 'text', 'Enter Building Permit No.', buildingPermitNo)}
                            </td>
                        </tr>

                        {/* Certificates */}
                        <tr>
                            <td className="p-3 flex justify-center items-center w-full">
                                <div className="flex flex-col items-center w-full">
                                    <h3 className="text-lg font-semibold mb-4 text-center">CCT Document</h3>
                                    <div className="w-full max-w-lg flex justify-center">
                                        <ImageUploadGallery
                                            images={cctImageForPreview}
                                            onChange={handleCCTChange}
                                            maxNumber={5}
                                            multiple={true}
                                            maxImageHeight="500px"
                                            maxImageWidth="500px"
                                            imageFit="contain"
                                            containerWidth="500px"
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>

                        {/* Dates */}
                        <tr>
                            <td className="p-3 w-full">
                                {renderInputField('certificate_of_completion_issued_on', 'Certificate of Completion', 'date', '', certificateOfCompletion)}
                            </td>
                        </tr>

                        <tr>
                            <td className="p-3 w-full">
                                {renderInputField('certificate_of_occupancy_issued_on', 'Certificate of Occupancy', 'date', '', certificateOfOccupancy)}
                            </td>
                        </tr>
                        {/* Date of Occupied */}
                        <tr>
                            <td className="p-3 w-full">
                                {renderInputField('date_of_occupied', 'Date of Occupied', 'date', '', dateOfOccupied)}
                            </td>
                        </tr>

                        {/* Building Areas */}
                        <tr>
                            <td className="p-3 w-full">
                                {renderInputField('bldg_age', 'Building Age', 'number', 'Enter Building Age', bldgAge)}
                            </td>
                        </tr>

                        <tr>
                            <td className="p-3 w-full">
                                {renderInputField('no_of_storeys', 'Number of Storeys', 'number', 'Enter Number of Storeys', noOfStoreys)}
                            </td>
                        </tr>

                        {/* Floor Areas */}
                        <tr>
                            <td className="p-3">
                                <div className="space-y-2">
                                    {renderInputField('area_of_1st_floor', '1st Floor', 'number', '1st Floor', areaOf1stFloor)}
                                    {renderInputField('area_of_2nd_floor', '2nd Floor', 'number', '2nd Floor', areaOf2ndFloor)}
                                    {renderInputField('area_of_3rd_floor', '3rd Floor', 'number', '3rd Floor', areaOf3rdFloor)}
                                    {renderInputField('area_of_4th_floor', '4th Floor', 'number', '4th Floor', areaOf4thFloor)}
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td className="p-3 w-full">
                                {renderInputField('total_floor_area', 'Total Floor Area', 'number', 'Total Floor Area', totalFloorArea)}
                            </td>
                        </tr>

                        {/* Floor Plan Upload */}
                        <tr>
                            {/* <td className="border border-gray-300 p-3 w-1/3">
                                Floor Plan
                                <p className='text-xs text-gray-500'>
                                    Note : Attached the building plan/sketch of floor plan . A photograph may also be attached if necessary.
                                </p>
                            </td> */}
                            <td className="p-3 flex justify-center items-center w-full">
                                <div className="flex flex-col items-center w-full">
                                    <h3 className="text-lg font-semibold mb-4 text-center">Floor Plan Documents</h3>
                                    <div className="w-full max-w-lg flex justify-center">
                                        <ImageUploadGallery
                                            images={floorPlanImageForPreview}
                                            onChange={handleFloorPlanChange}
                                            maxNumber={5}
                                            multiple={true}
                                            maxImageHeight="500px"
                                            maxImageWidth="500px"
                                            imageFit="contain"
                                            containerWidth="500px"
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GeneralDescription;
