import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AssessmentFormData } from '../AddAssessment';

const useAssessmentSubmit = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitAssessment = async (data: AssessmentFormData) => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/assessment/add', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            toast.success('Assessment submitted successfully!');
            return response.data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submitAssessment, isSubmitting };
};

export default useAssessmentSubmit; 