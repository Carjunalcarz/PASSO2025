import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Define the types
interface ApprovalSection {
    appraisedBy: string;
    appraisedDate: string;
    recommendingApproval: string;
    municipalityAssessorDate: string;
    approvedByProvince: string;
    provincialAssessorDate: string;
}

interface OwnerDetails {
    td: string;
    owner: string;
    ownerAddress: string;
    admin_ben_user: string;
    transactionCode: string;
    pin: string;
    tin: string;
    telNo: string;
}

interface LandReference {
    land_owner: string;
    block_no: string;
    tdn_no: string;
    pin: string;
    lot_no: string;
    survey_no: string;
    area: string;
}

interface BuildingLocation {
    address_municipality: string;
    address_barangay: string;
    street: string;
}

interface GeneralDescription {
    building_permit_no: string;
    certificate_of_completion_issued_on: string;
    certificate_of_occupancy_issued_on: string;
    date_of_occupied: string;
    bldg_age: string;
    no_of_storeys: string;
    area_of_1st_floor: string;
    area_of_2nd_floor: string;
    area_of_3rd_floor: string;
    area_of_4th_floor: string;
    total_floor_area: string;
}

interface Memorandum {
    date: string;
    details: string;
}

export interface AssessmentFormData {
    approvalSection: ApprovalSection;
    street: string;
    ownerDetails: OwnerDetails;
    ownerDetail: {
        ownerAddress: string;
    };
    landReference: LandReference;
    buildingLocation: BuildingLocation;
    address_municipality: string;
    address_barangay: string;
    address_province: string;
    generalDescription: GeneralDescription;
    memoranda: Memorandum[];
    recordOfSupersededAssessment: {
        records: any[];
    };  
}

interface UseAssessmentSubmitReturn {
    submitAssessment: (data: AssessmentFormData) => Promise<void>;
    isSubmitting: boolean;
}

const useAssessmentSubmit = (): UseAssessmentSubmitReturn => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitAssessment = async (data: AssessmentFormData) => {
        try {
            setIsSubmitting(true);
            
            // Make POST request to the assessment endpoint
            const response = await axios.post('http://localhost:8000/assessment/add/', data);
            
            if (response.status === 200 || response.status === 201) {
                toast.success('Assessment submitted successfully');
            }
            
            setIsSubmitting(false);
        } catch (error) {
            setIsSubmitting(false);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to submit assessment');
            } else {
                toast.error('An unexpected error occurred');
            }
            console.error('Error occurred:', error);
        }
    };

    return {
        submitAssessment,
        isSubmitting
    };
};

export default useAssessmentSubmit; 