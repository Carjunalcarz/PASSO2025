import * as yup from 'yup';

// Common validation patterns
const phoneRegex = /^(\+63|0)9\d{9}$/;
const tinRegex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
const pinRegex = /^\d{3}-\d{2}-\d{4}-\d{3}-\d{3}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Base validation schemas for reusable components
export const ownerDetailsSchema = yup.object({
    td: yup.string()
        .required('TD/ARP Number is required')
        .min(3, 'TD/ARP Number must be at least 3 characters')
        .max(50, 'TD/ARP Number must not exceed 50 characters'),
    owner: yup.string()
        .required('Owner name is required')
        .min(2, 'Owner name must be at least 2 characters')
        .max(100, 'Owner name must not exceed 100 characters')
        .matches(/^[a-zA-Z\s]+$/, 'Owner name can only contain letters and spaces'),
    ownerAddress: yup.string()
        .required('Owner address is required')
        .min(10, 'Address must be at least 10 characters')
        .max(200, 'Address must not exceed 200 characters'),
    admin_ben_user: yup.string()
        .required('Admin/Beneficial User is required')
        .min(2, 'Admin/Beneficial User must be at least 2 characters')
        .max(100, 'Admin/Beneficial User must not exceed 100 characters'),
    admin_ben_user_address: yup.string()
        .required('Admin/Beneficial User address is required')
        .min(10, 'Address must be at least 10 characters')
        .max(200, 'Address must not exceed 200 characters'),
    transactionCode: yup.string()
        .required('Transaction Code is required')
        .min(3, 'Transaction Code must be at least 3 characters')
        .max(20, 'Transaction Code must not exceed 20 characters'),
    // pin: yup.string()
    //     .required('PIN is required')
    //     .matches(pinRegex, 'PIN must be in format: XXX-XX-XXXX-XXX-XXX (15 digits total)')
    //     .test('pin-length', 'PIN must be exactly 19 characters (including dashes)', value => {
    //         if (!value) return false;
    //         return value.length === 19; // 15 digits + 4 dashes
    //     }),
    tin: yup.string()
        // .required('TIN is required')
        .matches(tinRegex, 'TIN must be in format: XXX-XXX-XXX-XXX'),
    telNo: yup.string()
        .required('Telephone number is required')
        .matches(phoneRegex, 'Please enter a valid Philippine phone number'),
});

export const landReferenceSchema = yup.object({
    land_owner: yup.string()
        .required('Land owner is required')
        .min(2, 'Land owner must be at least 2 characters')
        .max(100, 'Land owner must not exceed 100 characters'),
    block_no: yup.string()
        .required('Block number is required')
        .min(1, 'Block number must be at least 1 character')
        .max(20, 'Block number must not exceed 20 characters'),
    tdn_no: yup.string()
        .required('TDN number is required')
        .min(3, 'TDN number must be at least 3 characters')
        .max(50, 'TDN number must not exceed 50 characters'),
    // pin: yup.string()
    //     .required('PIN is required')
    //     .matches(pinRegex, 'PIN must be in format: XXX-XX-XXXX-XXX-XXX'),
    lot_no: yup.string()
        .required('Lot number is required')
        .min(1, 'Lot number must be at least 1 character')
        .max(20, 'Lot number must not exceed 20 characters'),
    survey_no: yup.string()
        .required('Survey number is required')
        .min(1, 'Survey number must be at least 1 character')
        .max(50, 'Survey number must not exceed 50 characters'),
    area: yup.string()
        .required('Area is required')
        .matches(/^\d+(\.\d{1,2})?$/, 'Area must be a valid number with up to 2 decimal places')
        .test('positive', 'Area must be greater than 0', value => {
            const num = parseFloat(value);
            return num > 0;
        }),
});

export const buildingLocationSchema = yup.object({
    address_municipality: yup.string()
        .required('Municipality is required')
        .min(2, 'Municipality must be at least 2 characters')
        .max(50, 'Municipality must not exceed 50 characters'),
    address_barangay: yup.string()
        .required('Barangay is required')
        .min(2, 'Barangay must be at least 2 characters')
        .max(50, 'Barangay must not exceed 50 characters'),
    street: yup.string()
        .required('Street address is required')
        .min(5, 'Street address must be at least 5 characters')
        .max(100, 'Street address must not exceed 100 characters'),
});

// Updated general description schema - make all floor areas optional and remove total floor area validation
export const generalDescriptionSchema = yup.object({
    building_permit_no: yup.string()
        .min(3, 'Building permit number must be at least 3 characters')
        .max(50, 'Building permit number must not exceed 50 characters')
        .nullable(),
    certificate_of_completion_issued_on: yup.string()
        .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
        .nullable(),
    certificate_of_occupancy_issued_on: yup.string()
        .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
        .nullable(),
    date_of_occupied: yup.string()
        .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
        .nullable(),
    bldg_age: yup.string()
        .matches(/^\d+$/, 'Building age must be a whole number')
        .test('positive', 'Building age must be greater than 0', value => {
            if (!value) return true; // Optional field
            const num = parseInt(value);
            return num > 0;
        })
        .nullable(),
    no_of_storeys: yup.string()
        .matches(/^\d+$/, 'Number of storeys must be a whole number')
        .test('positive', 'Number of storeys must be greater than 0', value => {
            if (!value) return true; // Optional field
            const num = parseInt(value);
            return num > 0;
        })
        .nullable(),
    // Make all floor areas optional with no validation
    area_of_1st_floor: yup.string().nullable(),
    area_of_2nd_floor: yup.string().nullable(),
    area_of_3rd_floor: yup.string().nullable(),
    area_of_4th_floor: yup.string().nullable(),
    // Remove total floor area validation - it will be calculated dynamically
    total_floor_area: yup.string().nullable(),
});

// Make approval section optional since it might not be filled initially
export const approvalSectionSchema = yup.object({
    appraisedBy: yup.string()
        .min(2, 'Appraised by must be at least 2 characters')
        .max(100, 'Appraised by must not exceed 100 characters')
        .nullable(),
    appraisedDate: yup.string()
        .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
        .nullable(),
    recommendingApproval: yup.string()
        .min(2, 'Recommending approval must be at least 2 characters')
        .max(100, 'Recommending approval must not exceed 100 characters')
        .nullable(),
    municipalityAssessorDate: yup.string()
        .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
        .nullable(),
    approvedByProvince: yup.string()
        .min(2, 'Approved by province must be at least 2 characters')
        .max(100, 'Approved by province must not exceed 100 characters')
        .nullable(),
    provincialAssessorDate: yup.string()
        .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
        .nullable(),
});

export const memorandaSchema = yup.array().of(
    yup.object({
        date: yup.string()
            .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
            .nullable(),
        details: yup.string()
            .min(10, 'Details must be at least 10 characters')
            .max(500, 'Details must not exceed 500 characters')
            .nullable(),
    })
);

// Main assessment validation schema - only validate required fields
export const assessmentSchema = yup.object({
    approvalSection: approvalSectionSchema,
    ownerDetails: ownerDetailsSchema,
    landReference: landReferenceSchema,
    buildingLocation: buildingLocationSchema,
    address_municipality: yup.string()
        .required('Municipality is required')
        .min(2, 'Municipality must be at least 2 characters')
        .max(50, 'Municipality must not exceed 50 characters'),
    address_barangay: yup.string()
        .required('Barangay is required')
        .min(2, 'Barangay must be at least 2 characters')
        .max(50, 'Barangay must not exceed 50 characters'),
    address_province: yup.string()
        .required('Province is required')
        .min(2, 'Province must be at least 2 characters')
        .max(50, 'Province must not exceed 50 characters'),
    generalDescription: generalDescriptionSchema,
    memoranda: memorandaSchema,
    recordOfSupersededAssessment: yup.object({
        records: yup.array().of(yup.object({
            // pin: yup.string()
            //     .matches(pinRegex, 'PIN must be in format: XXX-XX-XXXX-XXX-XXX')
            //     .nullable(),
            tdArpNo: yup.string()
                .min(3, 'TD/ARP Number must be at least 3 characters')
                .max(50, 'TD/ARP Number must not exceed 50 characters')
                .nullable(),
            totalAssessedValue: yup.number()
                .positive('Total assessed value must be positive')
                .nullable(),
            previousOwner: yup.string()
                .min(2, 'Previous owner must be at least 2 characters')
                .max(100, 'Previous owner must not exceed 100 characters')
                .nullable(),
            dateOfEffectivity: yup.string()
                .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
                .nullable(),
            date: yup.string()
                .matches(dateRegex, 'Please enter a valid date (YYYY-MM-DD)')
                .nullable(),
            assessment: yup.string()
                .min(2, 'Assessment must be at least 2 characters')
                .max(100, 'Assessment must not exceed 100 characters')
                .nullable(),
            taxMapping: yup.string()
                .min(2, 'Tax mapping must be at least 2 characters')
                .max(100, 'Tax mapping must not exceed 100 characters')
                .nullable(),
            records: yup.string()
                .min(2, 'Records must be at least 2 characters')
                .max(100, 'Records must not exceed 100 characters')
                .nullable(),
        }))
    }),
});

// Type inference from schema
export type AssessmentFormData = yup.InferType<typeof assessmentSchema>; 