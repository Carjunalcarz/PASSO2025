// components/LandReference.tsx

import InputField from './shared/InputField';
import { FieldError } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import IconCopy from '../../../components/Icon/IconCopy';

// Custom PIN Input Component with Auto-formatting
const PinInputField: React.FC<{
    label: string;
    id: string;
    placeholder: string;
    register: any;
    error?: FieldError;
    onCopyFromOwner?: () => void;
    ownerPinValue?: string;
    watch?: any;
    setValue?: any;
    trigger?: any;
}> = ({ label, id, placeholder, register, error, onCopyFromOwner, ownerPinValue, watch, setValue, trigger }) => {
    // Get the current value from the form
    const currentValue = watch ? watch(`landReference.pin`) : '';

    // PIN formatting function - matches schema format: XXX-XX-XXXX-XXX-XXX
    const formatPIN = (input: string): string => {
        // Remove all non-digit characters
        const digits = input.replace(/\D/g, '');
        
        // Format as XXX-XX-XXXX-XXX-XXX (15 digits total)
        if (digits.length <= 3) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
        if (digits.length <= 12) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`;
        if (digits.length <= 15) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 12)}-${digits.slice(12)}`;
        
        // Limit to 15 digits
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 12)}-${digits.slice(12, 15)}`;
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const formatted = formatPIN(input);
        
        // Update the form value directly
        if (setValue) {
            setValue('landReference.pin', formatted);
            
            // Trigger validation after setting the value
            if (trigger) {
                await trigger('landReference.pin');
            }
        }
    };

    const handleCopyFromOwner = () => {
        if (ownerPinValue && onCopyFromOwner) {
            onCopyFromOwner();
        }
    };

    return (
        <div className="w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
            <div className="flex">
                <div className='flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]'>
                    {label}
                </div>
                <input
                    id={id}
                    type="text"
                    name={id}
                    value={currentValue || ''}
                    onChange={handleChange}
                    className={`form-input flex-1 ltr:rounded-l-none rtl:rounded-r-none ${
                        error ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder={placeholder}
                    maxLength={19} // XXX-XX-XXXX-XXX-XXX format (15 digits + 4 dashes)
                    ref={register.ref}
                    onBlur={register.onBlur}
                />
                {ownerPinValue && ownerPinValue.trim() !== '' && (
                    <button
                        type="button"
                        onClick={handleCopyFromOwner}
                        className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                        title="Copy PIN from Owner Details"
                    >
                        <IconCopy className="w-4 h-4" />
                        Copy
                    </button>
                )}
            </div>
            {/* Error message */}
            {error && (
                <div className="text-red-500 text-sm mt-1 ml-4">
                    {error.message}
                </div>
            )}
        </div>
    );
};

const LandReference: React.FC<{ 
    register: any; 
    getNestedError?: (path: string) => FieldError | undefined;
    watch?: any;
    setValue?: any;
    trigger?: any;
}> = ({ register, getNestedError, watch, setValue, trigger }) => {
    // Watch the owner PIN value
    const ownerPinValue = watch?.('ownerDetails.pin');

    const handleCopyPinFromOwner = async () => {
        if (ownerPinValue && setValue) {
            console.log('Copying PIN from owner:', ownerPinValue); // Debug log
            // Both owner and land reference use the same PIN format: XXX-XX-XXXX-XXX-XXX
            // So we can copy directly
            setValue('landReference.pin', ownerPinValue);
            
            // Trigger validation after copying
            if (trigger) {
                await trigger('landReference.pin');
            }
        }
    };

    return (
        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
            <h2 className='text-xl px-10 text-wrap text-left mb-8'>LAND REFERENCE</h2>
            <div className="flex justify-between lg:flex-row flex-col m-5">
                {/* Left Column */}
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <InputField
                        label="Owner :"
                        id="land_owner"
                        type="text"
                        placeholder="Enter Owner"
                        {...register('landReference.land_owner')}
                        error={getNestedError?.('landReference.land_owner')}
                    />

                    <InputField
                        label="Block No. :"
                        id="block_no"
                        type="text"
                        placeholder="Enter Block No."
                        {...register('landReference.block_no')}
                        error={getNestedError?.('landReference.block_no')}
                    />

                    <InputField
                        label="TDN No. :"
                        id="tdn_no"
                        type="text"
                        placeholder="Enter TDN No."
                        {...register('landReference.tdn_no')}
                        error={getNestedError?.('landReference.tdn_no')}
                    />
                    
                    <PinInputField
                        label="PIN. :"
                        id="pin"
                        placeholder="Enter PIN (e.g., 123-45-0123-456-789)"
                        register={register('landReference.pin')}
                        error={getNestedError?.('landReference.pin')}
                        onCopyFromOwner={handleCopyPinFromOwner}
                        ownerPinValue={ownerPinValue}
                        watch={watch}
                        setValue={setValue}
                        trigger={trigger}
                    />
                </div>

                {/* Right Column */}
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <InputField
                        label="Lot No. :"
                        id="lot_no"
                        type="text"
                        placeholder="Enter Lot No."
                        {...register('landReference.lot_no')}
                        error={getNestedError?.('landReference.lot_no')}
                    />

                    <InputField
                        label="Survey No. :"
                        id="survey_no"
                        type="text"
                        placeholder="Enter Survey No."
                        {...register('landReference.survey_no')}
                        error={getNestedError?.('landReference.survey_no')}
                    />

                    <InputField
                        label="Area :"
                        id="area"
                        type="text"
                        placeholder="Enter Area"
                        {...register('landReference.area')}
                        error={getNestedError?.('landReference.area')}
                    />
                </div>
            </div>
        </div>
    );
};

export default LandReference;
