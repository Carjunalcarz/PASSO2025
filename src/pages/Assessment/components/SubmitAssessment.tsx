import React from 'react';
import { UseFormHandleSubmit } from 'react-hook-form';
import { AssessmentFormData } from './useAssessmentSubmit';

interface SubmitAssessmentProps {
    handleSubmit: UseFormHandleSubmit<AssessmentFormData>;
    onSubmit: (data: AssessmentFormData) => Promise<void>;
    isSubmitting: boolean;
}

const SubmitAssessment: React.FC<SubmitAssessmentProps> = ({
    handleSubmit,
    onSubmit,
    isSubmitting
}) => {
    return (
        <div className="px-10 py-4">
            <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
        </div>
    );
};

export default SubmitAssessment;