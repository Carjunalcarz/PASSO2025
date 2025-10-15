import { Link , useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconX from '../../components/Icon/IconX';
import IconSend from '../../components/Icon/IconSend';
import IconSave from '../../components/Icon/IconSave';
import IconEye from '../../components/Icon/IconEye';
import IconDownload from '../../components/Icon/IconDownload';
import IconPlus from '../../components/Icon/IconPlus';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import Header from './components/Header';
import ImagePreviewModal from './components/ImagePreviewModal';
import UpdateBuildingLocation from './components/UpdateBuildingLocation';
import LandReference from './components/LandReference';
import GeneralDescription from './components/GeneralDescription';
import StructuralMaterialChecklist from './components/StructuralMaterialChecklist';
import PropertyAppraisal from './components/PropertyAppraisal';
import UpdatePropertyAssessment from './components/UpdatePropertyAssessment';
import Memoranda from './components/Memoranda';
import UpdateRecordOfSupersededAssessment from './components/UpdateRecordOfSupersededAssessment';
import UpdateOwnerDetails from './components/UpdateOwnerDetails';
import { useForm } from 'react-hook-form';
import AdditionalItems from './components/Additionalitems';
import useAssessmentSubmit from './hooks/useAssessmentSubmit';
import SubmitAssessment from './components/SubmitAssessment';
import { toast } from 'react-hot-toast';
import FillDummyButton from './components/testing/FillDummyButton';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService, BuildingAssessmentDocument } from '../../services/databaseService';


// Type definitions
type BarangayData = {
    [key: string]: string[];
};

export interface GeneralDescriptionData {
    no_of_storey: string;
    brief_description: string;
    building_permit_no: string;
    building_permit_date: string;
}

// Add this with your other type definitions at the top
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
    ownerDetail: {
        ownerAddress: string;
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
        kind_of_bldg: string;
        structural_type: string;
        unitValue: number;
    };
    memoranda: Array<{
        date: string;
        details: string;
    }>;
    recordOfSupersededAssessment: {
        records: Array<any>;
    };
    buildingCategory: string;
    effectivityOfAssessment: {
        quarter: string;
        year: string;
    };
    structuralMaterial: Record<string, boolean | string>;
    additionalItems: {
        items: Array<{
            id: number;
            label: string;
            value: any;
            quantity: number;
            amount: number;
            description: string;
        }>;
        subTotal: number;
        total: number;
    };
}

const UpdateAssessment = () => {
    const { id } = useParams(); // Assuming route is like /assessment/update/:id
    const { user, isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Collection ID for building assessments
    const BUILDING_COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_ASSESSMENTS_COLLECTION_ID || 'building-assessments';

    // Use plain useForm (no validation)
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { isDirty, isSubmitting },
    } = useForm();

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !isAuthenticated) return;
            try {
                const response = await databaseService.getBuildingAssessments(BUILDING_COLLECTION_ID);
                const data = response.find(item => item.$id === id);
                
                if (!data) {
                    toast.error('Assessment not found');
                    navigate('/assessment/building_assessment');
                    return;
                }
                
                // Parse JSON strings safely
                const parseJSON = (jsonString?: string) => {
                    if (!jsonString) return {};
                    try {
                        return JSON.parse(jsonString);
                    } catch (error) {
                        console.warn('Failed to parse JSON:', jsonString);
                        return {};
                    }
                };
                
                const ownerDetails = parseJSON(data.owner_details);
                const buildingLocation = parseJSON(data.building_location);
                const generalDescription = parseJSON(data.general_description);
                const propertyAppraisal = parseJSON(data.property_appraisal);
                const propertyAssessment = parseJSON(data.property_assessment);
                const structuralMaterials = parseJSON(data.structural_materials);
                const additionalItems = parseJSON(data.additionalItems);
                const memoranda = parseJSON(data.memoranda);
                
                // Map Appwrite data to form structure
                const mappedData = {
                    approvalSection: {
                        appraisedBy: "",
                        appraisedDate: "",
                        recommendingApproval: "",
                        municipalityAssessorDate: "",
                        approvedByProvince: "",
                        provincialAssessorDate: "",
                    },
                    street: buildingLocation.street || "",
                    ownerDetails: {
                        id: ownerDetails.id || "",
                        td: data.tdArp || ownerDetails.td || "",
                        owner: data.ownerName || ownerDetails.owner || "",
                        ownerAddress: ownerDetails.ownerAddress || "",
                        admin_ben_user: ownerDetails.admin_ben_user || "",
                        admin_ben_user_address: ownerDetails.admin_ben_user_address || "",
                        transactionCode: data.transactionCode || ownerDetails.transaction_code || "",
                        pin: data.pin || ownerDetails.pin || "",
                        tin: ownerDetails.tin || "",
                        telNo: ownerDetails.telNo || "",
                        image_list: ownerDetails.image_list || [],
                    },
                    ownerDetail: {
                        ownerAddress: ownerDetails.ownerAddress || "",
                    },
                    landReference: parseJSON(data.land_reference) || {
                        land_owner: "",
                        block_no: "",
                        tdn_no: "",
                        pin: "",
                        lot_no: "",
                        survey_no: "",
                        area: "",
                    },
                    update_buildingLocation: {
                        update_address_province: data.province || buildingLocation.address_province || "",
                        update_address_municipality: data.municipality || buildingLocation.address_municipality || "",
                        update_address_barangay: data.barangay || buildingLocation.address_barangay || "",
                        update_street: buildingLocation.street || "",
                        update_year: buildingLocation.year || "",
                        update_gr_name: buildingLocation.gr_name || "",
                        update_gr_code: buildingLocation.gr_code || "",
                        image_list: buildingLocation.image_list || [],
                    },
                    generalDescription: {
                        building_permit_no: generalDescription.building_permit_no || "",
                        certificate_of_completion_issued_on: generalDescription.certificate_of_completion_issued_on || "",
                        certificate_of_occupancy_issued_on: generalDescription.certificate_of_occupancy_issued_on || "",
                        date_of_occupied: generalDescription.date_of_occupied || "",
                        bldg_age: generalDescription.bldg_age || "",
                        no_of_storeys: generalDescription.no_of_storeys || "",
                        area_of_1st_floor: generalDescription.area_of_1st_floor || "",
                        area_of_2nd_floor: generalDescription.area_of_2nd_floor || "",
                        area_of_3rd_floor: generalDescription.area_of_3rd_floor || "",
                        area_of_4th_floor: generalDescription.area_of_4th_floor || "",
                        total_floor_area: (data.totalArea || generalDescription.total_floor_area)?.toString() || "",
                        kind_of_bldg: generalDescription.kind_of_bldg || "",
                        structural_type: generalDescription.structural_type || "",
                        unitValue: generalDescription.unit_value || 0,
                        cct_image: generalDescription.cct_image || [],
                        floor_plan_image: generalDescription.floor_plan_image || []
                    },

                    memoranda: Array.isArray(memoranda) ? memoranda.map((memo: any) => ({
                        date: memo.date || "",
                        details: memo.details || ""
                    })) : [],
                    recordOfSupersededAssessment: {
                        records: parseJSON(data.superseded_records)?.records?.map((record: any) => ({
                            id: record.id || "",
                            pin: record.pin || "",
                            tdArpNo: record.tdArpNo || "",
                            totalAssessedValue: record.totalAssessedValue || "",
                            previousOwner: record.previousOwner || "",
                            dateOfEffectivity: record.dateOfEffectivity || "",
                            date: record.date || "",
                            assessment: record.assessment || "",
                            taxMapping: record.taxMapping || "",
                            records: record.records || ""
                        })) || [],
                    },
                    update_propertyAssessment: {
                        id: 1,
                        market_value: data.marketValueTotal || propertyAppraisal.market_value || 0,
                        building_category: propertyAssessment.building_category || "",
                        assessment_level: propertyAssessment.assessment_level?.toString() || "",
                        assessment_value: propertyAssessment.assessment_value || 0,
                        taxable: data.taxable ? 1 : 0,
                        eff_year: data.effYear || propertyAssessment.eff_year || new Date().getFullYear().toString(),
                        eff_quarter: data.effQuarter || propertyAssessment.eff_quarter || "QTR1",
                        total_area: data.totalArea || propertyAssessment.total_area || 0
                    },
                    structuralMaterial: structuralMaterials.material_data || structuralMaterials || {},
                    additionalItems: {
                        items: Array.isArray(additionalItems) ? additionalItems.map((item: any) => ({
                            id: item.id,
                            label: item.label,
                            value: item.item_value,
                            quantity: item.quantity,
                            amount: item.amount,
                            description: item.description || ""
                        })) : [],
                        subTotal: additionalItems?.sub_total || 0,
                        total: additionalItems?.total || 0
                    },
                };
                reset(mappedData); // This will pre-fill your form
            } catch (error) {
                toast.error('Failed to load assessment data');
                console.error(error);
            }
        };
        fetchData();
    }, [id, reset, isAuthenticated, BUILDING_COLLECTION_ID]);

    const currencyList = ['USD - US Dollar', 'GBP - British Pound', 'IDR - Indonesian Rupiah', 'INR - Indian Rupee', 'BRL - Brazilian Real', 'EUR - Germany (Euro)', 'TRY - Turkish Lira'];

    const [items, setItems] = useState<any>([
        {
            id: 1,
            title: '',
            description: '',
            rate: 0,
            quantity: 0,
            amount: 0,
        },
    ]);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Separate states for municipality and province suggestions
    const [municipalitySuggestions, setMunicipalitySuggestions] = useState<string[]>([]);
    const [provinceSuggestions, setProvinceSuggestions] = useState<string[]>([]);
    const [showMunicipalitySuggestions, setShowMunicipalitySuggestions] = useState(false);
    const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);

    const municipalitSuggestion = [
        'Buenavista',
        'Cabadbaran',
        'Carmen',
        'Jabonga',
        'Kitcharao',
        'Las Nieves',
        'Magallanes',
        'Nasipit',
        'Remedios T. Romualdez',
        'Santiago',
        'Tubay',

    ];
    const provinceSuggestion = [
        'Agusan del Norte',
        'Agusan del Sur',
        'Bukidnon',
        'Camiguin',
        'Misamis Occidental',
        'Misamis Oriental',
        'Zamboanga del Norte',
        'Zamboanga del Sur',
        'Zamboanga Sibugay',
    ];

    const handleInputChangeMunicipality = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length > 0) {
            const filtered = municipalitSuggestion.filter(item =>
                item.toLowerCase().startsWith(value.toLowerCase())
            );
            setMunicipalitySuggestions(filtered);
            setShowMunicipalitySuggestions(true);
        } else {
            setMunicipalitySuggestions([]);
            setShowMunicipalitySuggestions(false);
        }
    };

    const handleInputChangeProvince = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length > 0) {
            const filtered = provinceSuggestion.filter(item =>
                item.toLowerCase().startsWith(value.toLowerCase())
            );
            setProvinceSuggestions(filtered);
            setShowProvinceSuggestions(true);
        } else {
            setProvinceSuggestions([]);
            setShowProvinceSuggestions(false);
        }
    };

    const handleSuggestionClickMunicipality = (suggestion: string) => {
        const input = document.getElementById('address_municipality') as HTMLInputElement;
        const barangayInput = document.getElementById('address_barangay') as HTMLInputElement;
        if (input) {
            input.value = suggestion;


            // Clear barangay when municipality changes
            if (barangayInput) {
                barangayInput.value = '';
            }
        }
        // 🔥 Update react-hook-form values
        setValue('address_municipality', suggestion); // ← very important
        setShowMunicipalitySuggestions(false);
        setBarangaySuggestions([]); // Clear barangay suggestions
    };
    const handleSuggestionClickProvince = (suggestion: string) => {
        const input = document.getElementById('address_province') as HTMLInputElement;
        if (input) {
            input.value = suggestion;
        }
        setShowProvinceSuggestions(false);
        // 🔥 Update react-hook-form values
        setValue('address_province', suggestion); // ← very important
    };



 

    // First add this state for barangay suggestions
    const [barangaySuggestions, setBarangaySuggestions] = useState<string[]>([]);
    const [showBarangaySuggestions, setShowBarangaySuggestions] = useState(false);

    // Then update the barangaySuggestion declaration
    const barangaySuggestion: BarangayData = {
        "Buenavista": [
            "Abilan", "Agong-ong", "Alubijid", "Guinabsan", "Lower Olave",
            "Macalang", "Malapong", "Malpoc", "Manapa", "Matabao",
            "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4",
            "Poblacion 5", "Poblacion 6", "Poblacion 7", "Poblacion 8",
            "Poblacion 9", "Poblacion 10", "Rizal", "Sacol", "Sangay",
            "Simbalan", "Talo-ao"
        ],
        "Cabadbaran": [
            "Antonio Luna", "Bay-ang", "Bayabas", "Caasinan", "Cabinet",
            "Calamba", "Calibunan", "Comagascas", "Concepcion", "Del Pilar",
            "Katugasan", "Kauswagan", "La Union", "Mabini", "Mahaba",
            "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4",
            "Poblacion 5", "Poblacion 6", "Poblacion 7", "Poblacion 8",
            "Poblacion 9", "Poblacion 10", "Poblacion 11", "Poblacion 12",
            "Puting Bato", "Sanghan", "Soriano", "Tolosa"
        ],
        "Carmen": [
            "Cahayagan", "Gosoon", "Manoligao", "Poblacion", "Rojales",
            "San Agustin", "Tagcatong", "Vinapor"
        ],
        "Jabonga": [
            "A. Beltran", "Baleguian", "Bangonay", "Bunga", "Colorado",
            "Cuyago", "Libas", "Magdagooc", "Magsaysay", "Maraiging",
            "Poblacion", "San Jose", "San Pablo", "San Vicente", "Santo Niño"
        ],
        "Kitcharao": [
            "Bangayan", "Canaway", "Crossing", "Hinimbangan", "Jaliobong",
            "Mahayahay", "Poblacion", "San Isidro", "San Roque", "Sangay",
            "Songkoy"
        ],
        "Las Nieves": [
            "Ambacon", "Balungagan", "Bonifacio", "Casiklan", "Consorcia",
            "Durian", "Eduardo G. Montilla", "Ibuan", "Katipunan", "Lingayao",
            "Malicato", "Maningalao", "Marcos Calo", "Mat-i", "Pinana-an",
            "Poblacion", "Rosario", "San Isidro", "San Roque", "Tinucoran"
        ],
        "Magallanes": [
            "Buhang", "Caloc-an", "Guiasan", "Marcos", "Poblacion",
            "Santo Niño", "Santo Rosario", "Taod-oy"
        ],
        "Nasipit": [
            "Aclan", "Amontay", "Ata-atahon", "Barangay 1", "Barangay 2",
            "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6",
            "Barangay 7", "Camagong", "Cubi-cubi", "Culit", "Jaguimitan",
            "Kinabjangan", "Punta", "Santa Ana", "Talisay", "Triangulo"
        ],
        "Remedios T. Romualdez": [
            "Balangbalang", "Basilisa", "Humilog", "Panaytayon",
            "Poblacion I", "Poblacion II", "San Antonio", "Tagbongabong"
        ],
        "Santiago": [
            "Curva", "Estanislao Morgado", "Jagupit", "La Paz",
            "Pangaylan-IP", "Poblacion I", "Poblacion II", "San Isidro",
            "Tagbuyacan"
        ],
        "Tubay": [
            "Binuangan", "Cabayawa", "Doña Rosario", "Doña Telesfora",
            "La Fraternidad", "Lawigan", "Poblacion 1", "Poblacion 2",
            "Santa Ana", "Tagmamarkay", "Tagpangahoy", "Tinigbasan", "Victory"
        ]
    };


    // Add the handler functions
    const handleInputChangeBarangay = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const selectedMunicipality = (document.getElementById('address_municipality') as HTMLInputElement)?.value;

        if (value.length > 0 && selectedMunicipality) {
            // Use barangaySuggestion object directly since it has the complete data
            const availableBarangays = barangaySuggestion[selectedMunicipality] || [];

            const filtered = availableBarangays.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setBarangaySuggestions(filtered);
            setShowBarangaySuggestions(true);
        } else {
            setBarangaySuggestions([]);
            setShowBarangaySuggestions(false);
        }
    };

    const handleSuggestionClickBarangay = (suggestion: string) => {
        const input = document.getElementById('address_barangay') as HTMLInputElement;
        if (input) {
            input.value = suggestion;
        }
        // 🔥 Update react-hook-form values
        setValue('address_barangay', suggestion); // ← very important
        setShowBarangaySuggestions(false);
    };

    // Add these state declarations at the beginning of your component
    const [images1, setImages1] = useState<ImageListType>([]);
    const [images2, setImages2] = useState<ImageListType>([]);
    const maxNumber = 1; // Maximum number of images allowed per upload

    // Add these handlers
    const onChange1 = (imageList: ImageListType) => {
        setImages1(imageList as never[]);
    };

    const onChange2 = (imageList: ImageListType) => {
        setImages2(imageList as never[]);
    };

    // Add this with your other state declarations
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [generalDescriptionData, setGeneralDescriptionData] = useState<GeneralDescriptionData>({
        no_of_storey: '',
        brief_description: '',
        building_permit_no: '',
        building_permit_date: ''
    });

   

    const handleGeneralDescriptionChange = (field: keyof GeneralDescriptionData, value: string) => {
        setGeneralDescriptionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Add this to your component's state declarations
    const [structuralMaterials, setStructuralMaterials] = useState<Record<string, boolean | string>>({});

  

    // Add these new state variables for component visibility
    const [showGeneralDescription, setShowGeneralDescription] = useState(false);
    const [showStructuralMaterial, setShowStructuralMaterial] = useState(false);
    const [showPropertyAppraisal, setShowPropertyAppraisal] = useState(false);
    const [showPropertyAssessment, setShowPropertyAssessment] = useState(false);

    // Add this state in your Add component
    const [showMemorada, setShowMemorada] = useState(false);

    // Add this handler in your Add component
    const handleMemorandaChange = (memoranda: any[]) => {
        console.log('Memoranda updated:', memoranda);
        // Handle the memoranda data as needed
    };

    // Add this state for the new section
    const [showSuperseded, setShowSuperseded] = useState(false);

 

    // Real-time logging
    const allValues = watch();
    useEffect(() => {
        console.log("Form values:", allValues);
        console.log("Form errors:", {}); // No errors
        console.log("Form valid:", true); // Always true
        console.log("Form dirty:", isDirty);
    }, [allValues, isDirty]);

    const [showAdditionalItem, setShowAdditionalItem] = useState(false);

    const { submitAssessment, isSubmitting: oldIsSubmitting } = useAssessmentSubmit();

    const onSubmit = async (formData: any) => {
        if (!id || !isAuthenticated) {
            toast.error('Authentication required');
            return;
        }

        try {
            console.log('Form data:', formData);
            
            // Convert form data to BuildingAssessmentDocument format
            const updateData: Partial<BuildingAssessmentDocument> = {
                ownerName: formData.ownerDetails?.owner || '',
                transactionCode: formData.ownerDetails?.transactionCode || '',
                tdArp: formData.ownerDetails?.td || '',
                pin: formData.ownerDetails?.pin || '',
                barangay: formData.update_buildingLocation?.update_address_barangay || '',
                municipality: formData.update_buildingLocation?.update_address_municipality || '',
                province: formData.update_buildingLocation?.update_address_province || '',
                marketValueTotal: formData.update_propertyAssessment?.market_value || 0,
                taxable: formData.update_propertyAssessment?.taxable === 1,
                effYear: formData.update_propertyAssessment?.eff_year || '',
                effQuarter: formData.update_propertyAssessment?.eff_quarter || '',
                totalArea: formData.generalDescription?.total_floor_area ? parseFloat(formData.generalDescription.total_floor_area) : 0,
                userId: user?.$id,
                synced: false,
                
                // Update JSON fields
                owner_details: JSON.stringify({
                    id: formData.ownerDetails?.id || '',
                    pin: formData.ownerDetails?.pin || '',
                    owner: formData.ownerDetails?.owner || '',
                    td: formData.ownerDetails?.td || '',
                    transaction_code: formData.ownerDetails?.transactionCode || '',
                    ownerAddress: formData.ownerDetails?.ownerAddress || '',
                    admin_ben_user: formData.ownerDetails?.admin_ben_user || '',
                    admin_ben_user_address: formData.ownerDetails?.admin_ben_user_address || '',
                    tin: formData.ownerDetails?.tin || '',
                    telNo: formData.ownerDetails?.telNo || '',
                    image_list: formData.ownerDetails?.image_list || []
                }),
                
                building_location: JSON.stringify({
                    address_province: formData.update_buildingLocation?.update_address_province || '',
                    address_municipality: formData.update_buildingLocation?.update_address_municipality || '',
                    address_barangay: formData.update_buildingLocation?.update_address_barangay || '',
                    street: formData.update_buildingLocation?.update_street || '',
                    year: formData.update_buildingLocation?.update_year || '',
                    gr_name: formData.update_buildingLocation?.update_gr_name || '',
                    gr_code: formData.update_buildingLocation?.update_gr_code || '',
                    mun_code: '', // Will be calculated
                    bcode: '', // Will be calculated
                    image_list: formData.update_buildingLocation?.image_list || []
                }),
                
                land_reference: JSON.stringify(formData.landReference || {}),
                
                general_description: JSON.stringify({
                    building_permit_no: formData.generalDescription?.building_permit_no || '',
                    certificate_of_completion_issued_on: formData.generalDescription?.certificate_of_completion_issued_on || '',
                    certificate_of_occupancy_issued_on: formData.generalDescription?.certificate_of_occupancy_issued_on || '',
                    date_of_occupied: formData.generalDescription?.date_of_occupied || '',
                    bldg_age: formData.generalDescription?.bldg_age || '',
                    no_of_storeys: formData.generalDescription?.no_of_storeys || '',
                    area_of_1st_floor: formData.generalDescription?.area_of_1st_floor || '',
                    area_of_2nd_floor: formData.generalDescription?.area_of_2nd_floor || '',
                    area_of_3rd_floor: formData.generalDescription?.area_of_3rd_floor || '',
                    area_of_4th_floor: formData.generalDescription?.area_of_4th_floor || '',
                    total_floor_area: formData.generalDescription?.total_floor_area || '',
                    kind_of_bldg: formData.generalDescription?.kind_of_bldg || '',
                    structural_type: formData.generalDescription?.structural_type || '',
                    unit_value: formData.generalDescription?.unitValue || 0,
                    cct_image: formData.generalDescription?.cct_image || [],
                    floor_plan_image: formData.generalDescription?.floor_plan_image || []
                }),
                
                structural_materials: JSON.stringify({
                    material_data: formData.structuralMaterial || {}
                }),
                
                property_appraisal: JSON.stringify({
                    market_value: formData.update_propertyAssessment?.market_value || 0
                }),
                
                property_assessment: JSON.stringify({
                    assessment_value: formData.update_propertyAssessment?.assessment_value || 0,
                    assessment_level: formData.update_propertyAssessment?.assessment_level || '',
                    building_category: formData.update_propertyAssessment?.building_category || '',
                    eff_year: formData.update_propertyAssessment?.eff_year || '',
                    eff_quarter: formData.update_propertyAssessment?.eff_quarter || '',
                    total_area: formData.update_propertyAssessment?.total_area || 0
                }),
                
                additionalItems: JSON.stringify(formData.additionalItems || { items: [], subTotal: 0, total: 0 }),
                
                memoranda: JSON.stringify(formData.memoranda || []),
                
                superseded_records: JSON.stringify(formData.recordOfSupersededAssessment || { records: [] })
            };

            await databaseService.updateBuildingAssessment(BUILDING_COLLECTION_ID, id, updateData);
            
            toast.success('Assessment updated successfully!');
            navigate(`/assessment/view/${id}`);
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update assessment: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };



    return (
        <div className="panel hidden sm:block md:w-[900px] lg:w-[1200px]">
            <div className="flex flex-col gap-2.5 ">
                <div className='mt-5'>
                    <Header />
                </div>
                {/* <FillDummyButton setValue={setValue as any} /> */}

                {/* ###########ENTRY############## */}

                <div className="px-10 mt-2">
                    <UpdateBuildingLocation
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        reset={reset}
                        municipalitySuggestions={municipalitySuggestions}
                        provinceSuggestions={provinceSuggestions}
                        barangaySuggestions={barangaySuggestions}
                        showMunicipalitySuggestions={showMunicipalitySuggestions}
                        showProvinceSuggestions={showProvinceSuggestions}
                        showBarangaySuggestions={showBarangaySuggestions}
                        handleInputChangeMunicipality={handleInputChangeMunicipality}
                        handleInputChangeProvince={handleInputChangeProvince}
                        handleInputChangeBarangay={handleInputChangeBarangay}
                        handleSuggestionClickMunicipality={handleSuggestionClickMunicipality}
                        handleSuggestionClickProvince={handleSuggestionClickProvince}
                        handleSuggestionClickBarangay={handleSuggestionClickBarangay}
                        setShowMunicipalitySuggestions={setShowMunicipalitySuggestions}
                        setShowProvinceSuggestions={setShowProvinceSuggestions}
                        setShowBarangaySuggestions={setShowBarangaySuggestions}
                    />
                </div>
                {/* ##########END############### */}
                <div className="p-10">
                    <UpdateOwnerDetails 
                        register={register} 
                        watch={watch} 
                        setValue={setValue}
                    />
                </div>
                {/* ##########ENTRY############### */}
                <div className="px-10 ">
                    <LandReference 
                        register={register} 
                        watch={watch}
                        setValue={setValue}
                    />
                </div>

                {/* ###########END############## */}
                {/* ##########ENTRY############### */}

                {/* General Description Section - Collapsible */}
                <div className="px-10">
                    <button
                        type="button"
                        className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                        onClick={() => setShowGeneralDescription(!showGeneralDescription)}
                    >
                        <span className="flex items-center">
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                            <span className="text-black dark:text-white-dark font-medium">General Description</span>
                        </span>
                        <span className={`transform transition-transform duration-300 ${showGeneralDescription ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    {showGeneralDescription && (
                        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                            <GeneralDescription
                                register={register}
                                control={control}
                                setValue={setValue}
                                watch={watch}
                                images1={images1}
                                images2={images2}
                                onChange1={onChange1}
                                onChange2={onChange2}
                                onInputChange={(field, value) => handleGeneralDescriptionChange(field as keyof GeneralDescriptionData, value)}
                                onPreviewImage={setPreviewImage}
                            />
                        </div>
                    )}
                </div>
                {/* ###########END############## */}

                {/* Structural Material Checklist Section - Collapsible */}
                <div className="px-10">
                    <button
                        type="button"
                        className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                        onClick={() => setShowStructuralMaterial(!showStructuralMaterial)}
                    >
                        <span className="flex items-center">
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                            <span className="text-black dark:text-white-dark font-medium">Structural Material Checklist</span>
                        </span>
                        <span className={`transform transition-transform duration-300 ${showStructuralMaterial ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    {showStructuralMaterial && (
                        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                            <StructuralMaterialChecklist 
                                register={register} 
                                watch={watch}
                                setValue={setValue}
                            />
                        </div>
                    )}
                </div>

                {/* Property Appraisal Section - Collapsible */}
                <div className="px-10">
                    <button
                        type="button"
                        className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                        onClick={() => setShowPropertyAppraisal(!showPropertyAppraisal)}
                    >
                        <span className="flex items-center">
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                            <span className="text-black dark:text-white-dark font-medium">Property Appraisal</span>
                        </span>
                        <span className={`transform transition-transform duration-300 ${showPropertyAppraisal ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    {showPropertyAppraisal && (
                        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                            <PropertyAppraisal register={register} setValue={setValue} watch={watch} />
                        </div>
                    )}
                </div>
                {/* Additional Item Section - Collapsible */}
                <div className="px-10">
                    <button
                        type="button"
                        className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                        onClick={() => setShowAdditionalItem(!showAdditionalItem)}
                    >
                        <span className="flex items-center">
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                            <span className="text-black dark:text-white-dark font-medium">Additional Item</span>
                        </span>
                        <span className={`transform transition-transform duration-300 ${showAdditionalItem ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    {showAdditionalItem && (
                        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                            <AdditionalItems register={register} setValue={setValue} watch={watch} />
                        </div>
                    )}
                </div>

                {/* Property Assessment Section - Collapsible */}
                <div className="px-10">
                    <button
                        type="button"
                        className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                        onClick={() => setShowPropertyAssessment(!showPropertyAssessment)}
                    >
                        <span className="flex items-center">
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                            <span className="text-black dark:text-white-dark font-medium">Property Assessment</span>
                        </span>
                        <span className={`transform transition-transform duration-300 ${showPropertyAssessment ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    {showPropertyAssessment && (
                        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                            <UpdatePropertyAssessment register={register} setValue={setValue} watch={watch} />
                        </div>
                    )}
                </div>



                {/* Approval Section */}
                <div className="px-10 ">
                    <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-6 bg-white dark:bg-[#0e1726]">
                        <div className="grid grid-cols-3 gap-6">
                            {/* Appraised/Assessed by */}
                            <div className="flex flex-col">
                                <label className="mb-2 font-semibold text-center">Appraised/Assessed by:</label>
                                <input
                                    type="text"
                                    className="form-input text-center"
                                    placeholder="Enter name"
                                    {...register('approvalSection.appraisedBy')}
                                />
                                <label className="mb-2  mt-3 font-semibold text-center">Appraised/Assessed by:</label>
                                <div className="mt-2">
                                    <input
                                        type="date"
                                        className="form-input text-center"
                                        {...register('approvalSection.appraisedDate')}
                                    />
                                </div>
                            </div>

                            {/* Recommending Approval */}
                            <div className="flex flex-col">
                                <label className="mb-2 font-semibold text-center">Recommending Approval:</label>
                                <input
                                    type="text"
                                    className="form-input text-center"
                                    placeholder="Enter name"
                                    {...register('approvalSection.recommendingApproval')}
                                />
                                <label className="mb-2  mt-3 font-semibold text-center">Municipality Assessor</label>
                                <div className="mt-2">
                                    <input
                                        type="date"
                                        className="form-input text-center"
                                        {...register('approvalSection.municipalityAssessorDate')}
                                    />
                                </div>
                            </div>

                            {/* Approved by */}
                            <div className="flex flex-col">
                                <label className="mb-2 font-semibold text-center">Approved by:</label>
                                <input
                                    type="text"
                                    className="form-input text-center"
                                    placeholder="Enter name"
                                    {...register('approvalSection.approvedByProvince')}
                                />
                                <label className="mb-2  mt-3 font-semibold text-center">Provincial Assessor</label>
                                <div className="mt-2">
                                    <input
                                        type="date"
                                        className="form-input text-center"
                                        {...register('approvalSection.provincialAssessorDate')}
                                    />
                                </div>


                            </div>

                        </div>
                    </div>
                </div>

                {/* Memoranda Section - Collapsible */}
                <div className="px-10 mt-4">
                    <button
                        type="button"
                        className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                        onClick={() => setShowMemorada(!showMemorada)}
                    >
                        <span className="flex items-center">
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                            <span className="text-black dark:text-white-dark font-medium">Memoranda</span>
                        </span>
                        <span className={`transform transition-transform duration-300 ${showMemorada ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    {showMemorada && (
                        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                            <Memoranda setValue={setValue} watch={watch} register={register} onMemorandaChange={handleMemorandaChange} />
                        </div>
                    )}
                </div>

                {/* Record of Superseded Section - Collapsible */}
                <div className="px-10">
                    <button
                        type="button"
                        className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                        onClick={() => setShowSuperseded(!showSuperseded)}
                    >
                        <span className="flex items-center">
                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                            <span className="text-black dark:text-white-dark font-medium">Record of Superseded</span>
                        </span>
                        <span className={`transform transition-transform duration-300 ${showSuperseded ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </button>
                    {showSuperseded && (
                        <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                            <UpdateRecordOfSupersededAssessment register={register} setValue={setValue} watch={watch} />
                        </div>
                    )}
                </div>

                {/* Submit button component */}
                <SubmitAssessment
                    handleSubmit={handleSubmit as any}
                    onSubmit={onSubmit as any}
                    isSubmitting={isSubmitting}
                    isValid={true}
                    isDirty={isDirty}
                />

            </div>



            {previewImage && (
                <ImagePreviewModal
                    isOpen={!!previewImage}
                    imageUrl={previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}

            {/* Add debug component without values */}
            {/* <ValidationDebug 
                errors={errors} 
                isValid={isValid} 
                isDirty={isDirty}
            /> */}

            {/* ErrorValidator errors={errors} */}
        </div>
    );
};

export default UpdateAssessment;
