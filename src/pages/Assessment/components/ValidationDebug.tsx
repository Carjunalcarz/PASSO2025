import React from 'react';

interface ValidationDebugProps {
    errors: any;
    isValid: boolean;
    isDirty: boolean;
}

const ValidationDebug: React.FC<ValidationDebugProps> = ({ errors, isValid, isDirty }) => {
    const hasErrors = Object.keys(errors).length > 0;

    // Get error messages in a flat structure
    const getErrorMessages = (errors: any, prefix = ''): string[] => {
        const messages: string[] = [];
        
        Object.keys(errors).forEach(key => {
            const error = errors[key];
            const fieldName = prefix ? `${prefix}.${key}` : key;
            
            if (error?.message) {
                messages.push(`${fieldName}: ${error.message}`);
            } else if (typeof error === 'object' && error !== null) {
                messages.push(...getErrorMessages(error, fieldName));
            }
        });
        
        return messages;
    };

    const errorMessages = getErrorMessages(errors);

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-md z-50">
            <h3 className="font-bold text-lg mb-2">Validation Debug</h3>
            <div className="space-y-2 text-sm">
                <div>Form Valid: <span className={isValid ? 'text-green-500' : 'text-red-500'}>{isValid ? 'Yes' : 'No'}</span></div>
                <div>Form Dirty: <span className={isDirty ? 'text-green-500' : 'text-red-500'}>{isDirty ? 'Yes' : 'No'}</span></div>
                <div>Has Errors: <span className={hasErrors ? 'text-red-500' : 'text-green-500'}>{hasErrors ? 'Yes' : 'No'}</span></div>
                
                {hasErrors && (
                    <div className="mt-2">
                        <h4 className="font-semibold text-red-500">Error Messages:</h4>
                        <div className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded max-h-32 overflow-auto">
                            {errorMessages.map((message, index) => (
                                <div key={index} className="text-red-600 mb-1">
                                    • {message}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValidationDebug; 