
import * as yup from 'yup';


export const updateAssessmentSchema = yup.object({
   
    ownerDetails: yup.object({
       
        td: yup.string().required('TD/ARP Number is required'),
        owner: yup.string().required('Owner name is required'),
        ownerAddress: yup.string().required('Owner address is required'),
        admin_ben_user: yup.string().required('Admin/Beneficial User is required'),
        admin_ben_user_address: yup.string().required('Admin/Beneficial User address is required'),
        transactionCode: yup.string().required('Transaction Code is required'),
        tin: yup.string().required('TIN is required'),
        telNo: yup.string().required('Telephone Number is required'),
       
    }),
    landReference: yup.object({
        land_owner: yup.string().required('Land owner is required'),
        block_no: yup.string().required('Block number is required'),
        tdn_no: yup.string().required('TDN number is required'),
        lot_no: yup.string().required('Lot number is required'),
        survey_no: yup.string().required('Survey number is required'),
    }),
   
});




