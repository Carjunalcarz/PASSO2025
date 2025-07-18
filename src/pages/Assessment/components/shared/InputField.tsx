import React from 'react';
import { FieldError } from 'react-hook-form';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    type: string;
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    labelClassName?: string;
    required?: boolean;
    error?: FieldError;
    helperText?: string;
    [key: string]: any;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({
        label,
        id,
        type,
        placeholder,
        value,
        onChange,
        className = "flex-1",
        labelClassName = "w-1/4",
        required = false,
        error,
        helperText,
        register,
        ...rest
    }, ref) => {
        return (
            <div className="w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                <div className="flex">
                    <div className='flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]'>
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    <input
                        id={id}
                        type={type}
                        name={id}
                        value={value}
                        onChange={onChange}
                        className={`form-input ${className} ltr:rounded-l-none rtl:rounded-r-none ${
                            error ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        placeholder={placeholder}
                        required={required}
                        ref={ref}
                        {...rest}
                    />
                </div>
                {/* Error message */}
                {error && (
                    <div className="text-red-500 text-sm mt-1 ml-4">
                        {error.message}
                    </div>
                )}
                {/* Helper text */}
                {helperText && !error && (
                    <div className="text-gray-500 text-sm mt-1 ml-4">
                        {helperText}
                    </div>
                )}
            </div>
        );
    }
);

InputField.displayName = 'InputField';

export default InputField;
