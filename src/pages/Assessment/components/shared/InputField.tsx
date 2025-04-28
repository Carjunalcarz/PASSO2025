interface InputFieldProps {
    label: string;
    id: string;
    type: string;
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    labelClassName?: string;
    required?: boolean;
}

const InputField = ({
    label,
    id,
    type,
    placeholder,
    value,
    onChange,
    className = "flex-1",
    labelClassName = "w-1/4",
    required = false
}: InputFieldProps) => {
    return (
        <div className="mt-4 flex items-center">
            <label
                htmlFor={id}
                className={`ltr:mr-2 rtl:ml-2 ${labelClassName} mb-0`}
            >
                {label}
                {required && <span className="text-red-500"></span>}
            </label>
            <input
                id={id}
                type={type}
                name={id}
                value={value}
                onChange={onChange}
                className={`form-input ${className}`}
                placeholder={placeholder}
                required={required}
            />
        </div>
    );
};

export default InputField;
