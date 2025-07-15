import React from 'react';
import { UseFormHandleSubmit } from 'react-hook-form';
import { AssessmentFormData } from '../schema/assessment_schema';

interface SubmitAssessmentProps {
    handleSubmit: UseFormHandleSubmit<AssessmentFormData>;
    onSubmit: (data: AssessmentFormData) => Promise<void>;
    isSubmitting: boolean;
    isValid?: boolean;
    isDirty?: boolean;
}

const SubmitAssessment: React.FC<SubmitAssessmentProps> = ({
    handleSubmit,
    onSubmit,
    isSubmitting,
    isValid = true,
    isDirty = false
}) => {
    return (
        <div className="px-10 py-4">
            <button
                type="submit"
                className={`btn w-full ${
                    isSubmitting
                        ? 'btn-disabled opacity-50 cursor-not-allowed'
                        : 'btn-primary'
                }`}
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
            
            {!isValid && (
                <div className="text-red-500 text-sm mt-2 text-center">
                    Please fix validation errors before submitting
                </div>
            )}
            
            {!isDirty && (
                <div className="text-gray-500 text-sm mt-2 text-center">
                    Make changes to enable submission
                </div>
            )}
        </div>
    );
};

export default SubmitAssessment;