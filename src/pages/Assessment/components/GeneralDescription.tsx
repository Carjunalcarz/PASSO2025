import React from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import IconX from '../../../components/Icon/IconX';
import InputField from './shared/InputField';
import { GeneralDescriptionData } from '../AddAssessment';

interface GeneralDescriptionProps {
    images1: ImageListType;
    images2: ImageListType;
    onChange1: (imageList: ImageListType) => void;
    onChange2: (imageList: ImageListType) => void;
    onInputChange?: (field: string, value: string) => void;
    onPreviewImage?: (imageUrl: string) => void;
}

// Add type for the image object
interface ImageType {
    data_url: string;
    file?: File;
}

const GeneralDescription: React.FC<GeneralDescriptionProps> = ({
    images1,
    images2,
    onChange1,
    onChange2,
    onInputChange,
    onPreviewImage
}) => {
    return (
        <div className="px-10">
            <h2 className='text-xl px-5 text-wrap text-left'>GENERAL DESCRIPTION</h2>
            <div className="flex justify-between lg:flex-row flex-col">
                {/* Left Column */}
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <InputField
                        label="No. of Storey :"
                        id="no_of_storey"
                        type="number"
                        placeholder="Enter No. of Storey"
                        onChange={(e) => onInputChange?.('no_of_storey', e.target.value)}
                        labelClassName="w-1/2.5"
                    />

                    <InputField
                        label="Brief Description :"
                        id="brief_description"
                        type="text"
                        placeholder="Enter Brief Description"
                        onChange={(e) => onInputChange?.('brief_description', e.target.value)}
                        labelClassName="w-1/2.5"
                    />

                    {/* Certificate of Completion Upload */}
                    <div className="mt-4">
                        <label className="ltr:mr-2 rtl:ml-2 w-1/2.5 mb-0">
                            Certificate of Completion :
                        </label>
                        <ImageUploading
                            multiple={false}
                            value={images1}
                            onChange={onChange1}
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
                                <div className="upload__image-wrapper p-20">
                                    {imageList.length === 0 ? (
                                        <button
                                            type="button"
                                            className={`border-2 border-dashed border-gray-300 rounded-lg p-4 w-full text-center ${isDragging ? 'bg-blue-50' : ''}`}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            Click or Drop here
                                        </button>
                                    ) : (
                                        imageList.map((image, index: number) => (
                                            <div key={index} className="relative inline-block">
                                                <img
                                                    src={image.data_url}
                                                    alt="preview"
                                                    className="w-32 h-32 object-cover cursor-pointer"
                                                    onClick={() => onPreviewImage?.(image.data_url)}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                    onClick={() => onImageRemove(index)}
                                                >
                                                    <IconX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </ImageUploading>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:w-1/2 w-full">
                    <InputField
                        label="Building Permit No. :"
                        id="building_permit_no"
                        type="text"
                        placeholder="Enter Building Permit No."
                        onChange={(e) => onInputChange?.('building_permit_no', e.target.value)}
                        labelClassName="w-1/2.5"
                    />

                    <InputField
                        label="Building Permit Date :"
                        id="building_permit_date"
                        type="date"
                        placeholder="Select Date"
                        onChange={(e) => onInputChange?.('building_permit_date', e.target.value)}
                        labelClassName="w-1/2.5"
                    />

                    {/* Floor Plan Upload */}
                    <div className="mt-4">
                        <label className="ltr:mr-2 rtl:ml-2 w-1/2 mb-0">
                            Floor Plan :
                        </label>
                        <ImageUploading
                            multiple={true}
                            value={images2}
                            onChange={onChange2}
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
                                <div className="upload__image-wrapper p-20">
                                    {imageList.length === 0 ? (
                                        <button
                                            type="button"
                                            className={`border-2 border-dashed border-gray-300 rounded-lg p-4 w-full text-center ${isDragging ? 'bg-blue-50' : ''}`}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            Click or Drop here
                                        </button>
                                    ) : (
                                        <div className="flex flex-wrap gap-4">
                                            {imageList.map((image, index: number) => (
                                                <div key={index} className="relative inline-block">
                                                    <img
                                                        src={image.data_url}
                                                        alt="preview"
                                                        className="w-32 h-32 object-cover cursor-pointer"
                                                        onClick={() => onPreviewImage?.(image.data_url)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                        onClick={() => onImageRemove(index)}
                                                    >
                                                        <IconX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </ImageUploading>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralDescription;
