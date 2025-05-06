import React from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import IconX from '../../../components/Icon/IconX';
import InputField from './shared/InputField';
import { Controller } from 'react-hook-form';

interface GeneralDescriptionProps {
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
}

const GeneralDescription: React.FC<GeneralDescriptionProps> = ({
    register,
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
        floor_plan: []
    });

    // Type-safe input change handler
    const handleInputChange = (field: keyof FormValues, value: string) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
        onInputChange?.(field, value);
    };

    // Handler for CCT file change
    const handleCCTChange = (imageList: ImageListType) => {
        setFormValues(prev => ({
            ...prev,
            cct: imageList[0]?.file || null,
        }));
        onChange1(imageList); // keep this if you need to update parent
    };

    // Helper function to render input fields with proper typing
    const renderInputField = (
        id: keyof FormValues,
        label: string,
        type: string = 'text',
        placeholder: string = ''
    ) => (
        <InputField
            label={label}
            id={id}
            type={type}
            placeholder={placeholder}
            className="w-full"
            labelClassName="w-1/2"
            {...register(`generalDescription.${id}`)}
        />
    );

    return (
        <div className="px-10 w-full">
            <h2 className='text-xl px-5 text-wrap text-left mb-6'>GENERAL DESCRIPTION</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <tbody>
                        {/* Building Information */}
                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3 w-1/3">Kind of Bldg</td>
                            <td className="border border-gray-300 p-3">
                                {renderInputField('kind_of_bldg', 'Kind of Bldg', 'text', 'Enter Kind of Bldg')}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">Structural Type</td>
                            <td className="border border-gray-300 p-3">
                                {renderInputField('structural_type', 'Structural Type', 'text', 'Enter Structural Type')}
                            </td>
                        </tr>

                        {/* Building Details */}
                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">Building Permit No.</td>
                            <td className="border border-gray-300 p-3">
                                {renderInputField('building_permit_no', 'Building Permit No.', 'text', 'Enter Building Permit No.')}
                            </td>
                        </tr>

                        {/* Certificates */}
                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">
                                Condominium Certificate of Title (CCT)
                            </td>
                            <td className="border border-gray-300 p-3">
                                <Controller
                                    control={control}
                                    name="cct"
                                    render={({ field: { onChange, value } }) => (
                                        <ImageUploading
                                            multiple={false}
                                            value={images1}
                                            onChange={(imageList) => {
                                                onChange(imageList[0]?.file || null);
                                                onChange1(imageList); // update parent if needed
                                            }}
                                            maxNumber={1}
                                            dataURLKey="data_url"
                                        >
                                            {({
                                                imageList,
                                                onImageUpload,
                                                onImageRemove,
                                                isDragging,
                                                dragProps
                                            }) => (
                                                <div className="space-y-4">
                                                    <button
                                                        type="button"
                                                        className={`border-2 border-dashed border-gray-300 rounded-lg p-4 w-full text-center ${isDragging ? 'bg-blue-50' : ''}`}
                                                        onClick={onImageUpload}
                                                        {...dragProps}
                                                    >
                                                        Upload CCT Document
                                                    </button>
                                                    <div className="flex flex-wrap gap-2">
                                                        {imageList.map((image, index) => (
                                                            <div key={index} className="relative">
                                                                <img
                                                                    src={image.data_url}
                                                                    alt="cct-document"
                                                                    className="w-20 h-20 object-cover rounded"
                                                                    onClick={() => onPreviewImage?.(image.data_url)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                                    onClick={() => onImageRemove(index)}
                                                                >
                                                                    <IconX className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </ImageUploading>
                                    )}
                                />
                            </td>
                        </tr>

                        {/* Dates */}
                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">Certificate of Completion Issued On</td>
                            <td className="border border-gray-300 p-3">
                                {renderInputField('certificate_of_completion_issued_on', 'Certificate of Completion', 'date')}
                            </td>
                        </tr>

                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">Certificate of Occupancy Issued On</td>
                            <td className="border border-gray-300 p-3">
                                {renderInputField('certificate_of_occupancy_issued_on', 'Certificate of Occupancy', 'date')}
                            </td>
                        </tr>

                        {/* Building Areas */}
                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">Building Age</td>
                            <td className="border border-gray-300 p-3">
                                {renderInputField('bldg_age', 'Building Age', 'number', 'Enter Building Age')}
                            </td>
                        </tr>

                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">Number of Storeys</td>
                            <td className="border border-gray-300 p-3">
                                {renderInputField('no_of_storeys', 'Number of Storeys', 'number', 'Enter Number of Storeys')}
                            </td>
                        </tr>

                        {/* Floor Areas */}
                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">Floor Areas (sqm)</td>
                            <td className="border border-gray-300 p-3">
                                <div className="space-y-2">
                                    {renderInputField('area_of_1st_floor', '1st Floor', 'number', '1st Floor')}
                                    {renderInputField('area_of_2nd_floor', '2nd Floor', 'number', '2nd Floor')}
                                    {renderInputField('area_of_3rd_floor', '3rd Floor', 'number', '3rd Floor')}
                                    {renderInputField('area_of_4th_floor', '4th Floor', 'number', '4th Floor')}
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">Total Floor Area</td>
                            <td className="border border-gray-300 p-3">
                                {renderInputField('total_floor_area', 'Total Floor Area', 'number', 'Total Floor Area')}
                            </td>
                        </tr>

                        {/* Floor Plan Upload */}
                        <tr>
                            <td className="border border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3">
                                Floor Plan
                                <p className='text-xs text-gray-500'>Note : Attached the building plan/sketch of floor plan . A photograph may also be attached if necessary.</p>
                            </td>
                            <td className="border border-gray-300 p-3">
                                <Controller
                                    control={control}
                                    name="floor_plan"
                                    render={({ field: { onChange, value } }) => (
                                        <ImageUploading
                                            multiple={true}
                                            value={images2}
                                            onChange={(imageList) => {
                                                const files = imageList.map(img => img.file).filter(Boolean);
                                                onChange(files);
                                                onChange2(imageList);
                                            }}
                                            maxNumber={5}
                                            dataURLKey="data_url"
                                        >
                                            {({
                                                imageList,
                                                onImageUpload,
                                                onImageRemove,
                                                isDragging,
                                                dragProps
                                            }) => (
                                                <div className="space-y-4">
                                                    <button
                                                        type="button"
                                                        className={`border-2 border-dashed border-gray-300 rounded-lg p-4 w-full text-center ${isDragging ? 'bg-blue-50' : ''}`}
                                                        onClick={onImageUpload}
                                                        {...dragProps}
                                                    >
                                                        Upload Floor Plan (Max 5)
                                                    </button>
                                                    <div className="flex flex-wrap gap-2">
                                                        {imageList.map((image, index) => (
                                                            <div key={index} className="relative">
                                                                <img
                                                                    src={image.data_url}
                                                                    alt={`floor-plan-${index + 1}`}
                                                                    className="w-20 h-20 object-cover rounded"
                                                                    onClick={() => onPreviewImage?.(image.data_url)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                                    onClick={() => onImageRemove(index)}
                                                                >
                                                                    <IconX className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </ImageUploading>
                                    )}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GeneralDescription;
