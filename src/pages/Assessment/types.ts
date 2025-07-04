export interface AssessmentFormData {
    approvalSection: {
        appraisedBy: string;
        appraisedDate: string;
        recommendingApproval: string;
        municipalityAssessorDate: string;
        approvedByProvince: string;
        provincialAssessorDate: string;
    };
    street: string;
    ownerDetails: {
        td: string;
        owner: string;
        ownerAddress: string;
        admin_ben_user: string;
        transactionCode: string;
        pin: string;
        tin: string;
        telNo: string;
    };
    landReference: {
        land_owner: string;
        block_no: string;
        tdn_no: string;
        pin: string;
        lot_no: string;
        survey_no: string;
        area: string;
    };
    buildingLocation: {
        address_municipality: string;
        address_barangay: string;
        street: string;
    };
    address_municipality: string;
    address_barangay: string;
    address_province: string;
    generalDescription: {
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
    };
    memoranda: Array<{
        date: string;
        details: string;
    }>;
    recordOfSupersededAssessment: {
        records: Array<any>;
    };
    // ... rest of your type definition
} 