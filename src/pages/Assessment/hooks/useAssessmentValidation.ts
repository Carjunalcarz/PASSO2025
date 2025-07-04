import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { assessmentSchema, AssessmentFormData } from '../schema/assessment_schema';

export const useAssessmentValidation = () => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors, isValid, isDirty, isSubmitting },
        trigger,
        getValues,
        setError,
        clearErrors,
    } = useForm<AssessmentFormData>({
        resolver: yupResolver(assessmentSchema as any),
        mode: 'onChange', // Validate on change for real-time feedback
        defaultValues: {
            memoranda: [{
                date: '',
                details: ''
            }],
            approvalSection: {
                appraisedBy: '',
                appraisedDate: '',
                recommendingApproval: '',
                municipalityAssessorDate: '',
                approvedByProvince: '',
                provincialAssessorDate: '',
            },
            street: '',
            ownerDetails: {
                td: '',
                owner: '',
                ownerAddress: '',
                admin_ben_user: '',
                transactionCode: '',
                pin: '',
                tin: '',
                telNo: '',
            },
            landReference: {
                land_owner: '',
                block_no: '',
                tdn_no: '',
                pin: '',
                lot_no: '',
                survey_no: '',
                area: '',
            },
            buildingLocation: {
                address_municipality: '',
                address_barangay: '',
                street: '',
            },
            address_municipality: '',
            address_barangay: '',
            address_province: '',
            generalDescription: {
                building_permit_no: '',
                certificate_of_completion_issued_on: '',
                certificate_of_occupancy_issued_on: '',
                date_of_occupied: '',
                bldg_age: '',
                no_of_storeys: '',
                area_of_1st_floor: '',
                area_of_2nd_floor: '',
                area_of_3rd_floor: '',
                area_of_4th_floor: '',
                total_floor_area: '', // This will be calculated dynamically
            },
         
            recordOfSupersededAssessment: {
                records: [],
            },
        },
    });

    // Helper function to get nested error
    const getNestedError = (path: string) => {
        const pathArray = path.split('.');
        let currentError: any = errors;
        
        for (const key of pathArray) {
            if (currentError && currentError[key]) {
                currentError = currentError[key];
            } else {
                return undefined;
            }
        }
        
        return currentError;
    };

    // Helper function to validate specific field
    const validateField = async (fieldName: string) => {
        return await trigger(fieldName as any);
    };

    // Helper function to validate multiple fields
    const validateFields = async (fieldNames: string[]) => {
        return await trigger(fieldNames as any);
    };

    // Helper function to calculate total floor area dynamically
    const calculateTotalFloorArea = () => {
        const values = getValues();
        const { generalDescription } = values;
        
        let total = 0;
        
        // Add up all floor areas that have values
        if (generalDescription.area_of_1st_floor) {
            total += parseFloat(generalDescription.area_of_1st_floor) || 0;
        }
        if (generalDescription.area_of_2nd_floor) {
            total += parseFloat(generalDescription.area_of_2nd_floor) || 0;
        }
        if (generalDescription.area_of_3rd_floor) {
            total += parseFloat(generalDescription.area_of_3rd_floor) || 0;
        }
        if (generalDescription.area_of_4th_floor) {
            total += parseFloat(generalDescription.area_of_4th_floor) || 0;
        }
        
        // Update the total floor area field
        setValue('generalDescription.total_floor_area', total.toFixed(2));
        
        return total;
    };

    return {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        errors,
        isValid,
        isDirty,
        isSubmitting,
        trigger,
        getValues,
        setError,
        clearErrors,
        getNestedError,
        validateField,
        validateFields,
        calculateTotalFloorArea, // Export the calculation function
    };
}; 