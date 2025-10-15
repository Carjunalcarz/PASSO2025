import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService, BuildingAssessmentDocument } from '../../services/databaseService';
import { toast } from 'react-toastify';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import IconX from '../../components/Icon/IconX';
import IconEdit from '../../components/Icon/IconEdit';
import IconDownload from '../../components/Icon/IconDownload';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconCode from '../../components/Icon/IconCode';
import ImageUploadGallery from '../../components/ImageUploadGallery';
import ImagePreviewModal from '../Assessment/components/ImagePreviewModal';

const AssessmentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user, isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [assessment, setAssessment] = useState<BuildingAssessmentDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDebugModal, setShowDebugModal] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');

    // Collection ID for building assessments
    const BUILDING_COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_ASSESSMENTS_COLLECTION_ID || 'building-assessments';

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

    // Parse JSON data (always call this to maintain hook order)
    const ownerDetails = parseJSON(assessment?.owner_details);
    const buildingLocation = parseJSON(assessment?.building_location);
    const landReference = parseJSON(assessment?.land_reference);
    const generalDescription = parseJSON(assessment?.general_description);
    const structuralMaterials = parseJSON(assessment?.structural_materials);
    const propertyAppraisal = parseJSON(assessment?.property_appraisal);
    const propertyAssessment = parseJSON(assessment?.property_assessment);
    const additionalItems = parseJSON(assessment?.additionalItems);
    const supersededRecords = parseJSON(assessment?.superseded_records);
    const memoranda = parseJSON(assessment?.memoranda);

    // Image preview functions
    const handleImagePreview = (imageUrl: string) => {
        setPreviewImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setPreviewImageUrl('');
    };

    // Convert image URLs to ImageUploadGallery format
    const convertToImageList = (imageUrls: string[]) => {
        if (!imageUrls || !Array.isArray(imageUrls)) return [];
        
        return imageUrls
            .filter(url => url && typeof url === 'string' && url.trim() !== '') // Filter out invalid URLs
            .map((url, index) => ({
                data_url: url, // Use data_url to match ImageUploading library
                dataURL: url,  // Also set dataURL for compatibility
                file: undefined
            }));
    };


    useEffect(() => {
        dispatch(setPageTitle('Building Assessment Details'));
    }, [dispatch]);

    useEffect(() => {
        const fetchAssessment = async () => {
            if (!id || !isAuthenticated) return;
            
            try {
                setLoading(true);
                setError(null);
                
                const response = await databaseService.getBuildingAssessments(BUILDING_COLLECTION_ID);
                const foundAssessment = response.find(item => item.$id === id);
                
                if (foundAssessment) {
                    setAssessment(foundAssessment);
                } else {
                    setError('Assessment not found');
                }
            } catch (err) {
                console.error('Error fetching assessment:', err);
                setError('Failed to load assessment details');
                toast.error('Failed to load assessment details');
            } finally {
                setLoading(false);
            }
        };

        fetchAssessment();
    }, [id, isAuthenticated, BUILDING_COLLECTION_ID]);


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !assessment) {
        return (
            <div className="panel">
                <div className="text-center py-10">
                    <div className="text-red-500 text-xl mb-4">{error || 'Assessment not found'}</div>
                    <Link to="/assessment/building_assessment" className="btn btn-primary">
                        Back to Building Assessments
                    </Link>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `₱${new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount || 0)}`;
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="panel">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/assessment/building_assessment')}
                            className="btn btn-outline-primary"
                        >
                            <IconArrowLeft className="w-4 h-4 mr-2" />
                            Back to List
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Building Assessment Details</h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                TDN: {assessment.tdArp || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <button
                            onClick={() => navigate(`/assessment/update/${id}`)}
                            className="btn btn-primary"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit
                        </button> */}
                        {/* <button className="btn btn-secondary">
                            <IconDownload className="w-4 h-4 mr-2" />
                            Export
                        </button> */}
                        <button 
                            className="btn btn-info"
                            onClick={() => {
                                if (assessment?.faas) {
                                    window.open(assessment.faas, '_blank');
                                } else {
                                    toast.error('FAAS document not available');
                                }
                            }}
                        >
                            <IconPrinter className="w-4 h-4 mr-2" />
                            Print
                        </button>
                        <button
                            onClick={() => setShowDebugModal(true)}
                            className="btn btn-warning"
                            title="Debug: View Raw JSON Data"
                        >
                            <IconCode className="w-4 h-4 mr-2" />
                            Debug JSON
                        </button>
                    </div>
                </div>
            </div>

            {/* Owner Details Section */}
            <div className="panel">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">Owner Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">Owner Name</label>
                        <p className="text-lg mt-1">{assessment.ownerName || ownerDetails.owner || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">TDN/ARP No.</label>
                        <p className="text-lg mt-1">{assessment.tdArp || ownerDetails.td || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">PIN</label>
                        <p className="text-lg mt-1">{assessment.pin || ownerDetails.pin || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">Transaction Code</label>
                        <p className="text-lg mt-1">{assessment.transactionCode || ownerDetails.transaction_code || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">TIN</label>
                        <p className="text-lg mt-1">{ownerDetails.tin || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">Tel No.</label>
                        <p className="text-lg mt-1">{ownerDetails.telNo || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="font-medium text-slate-700 dark:text-slate-300">Owner Address</label>
                        <p className="text-lg mt-1">{ownerDetails.address || ownerDetails.ownerAddress || 'N/A'}</p>
                    </div>
                    
                    {/* Administrator/Beneficiary Section */}
                    {ownerDetails.hasAdministratorBeneficiary && ownerDetails.administratorBeneficiary && (
                        <>
                            <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                <h3 className="text-lg font-semibold mb-4">Administrator/Beneficial User</h3>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 dark:text-slate-300">Name</label>
                                <p className="text-lg mt-1">{ownerDetails.administratorBeneficiary.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 dark:text-slate-300">TIN</label>
                                <p className="text-lg mt-1">{ownerDetails.administratorBeneficiary.tin || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700 dark:text-slate-300">Tel No.</label>
                                <p className="text-lg mt-1">{ownerDetails.administratorBeneficiary.telNo || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="font-medium text-slate-700 dark:text-slate-300">Address</label>
                                <p className="text-lg mt-1">{ownerDetails.administratorBeneficiary.address || 'N/A'}</p>
                            </div>
                        </>
                    )}
                    
                    {/* Valid ID Images */}
                    {ownerDetails.validIdImages && Array.isArray(ownerDetails.validIdImages) && ownerDetails.validIdImages.length > 0 && (
                        <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <h3 className="text-lg font-semibold mb-4">Owner Valid ID Images</h3>
                            <ImageUploadGallery
                                images={convertToImageList(ownerDetails.validIdImages)}
                                onChange={() => {}} // Read-only for viewing
                                maxNumber={5}
                                multiple={true}
                                maxImageHeight="400px"
                                imageFit="contain"
                            />
                        </div>
                    )}
                    
                    {/* Administrator Valid ID Images */}
                    {ownerDetails.administratorBeneficiary?.validIdImages && Array.isArray(ownerDetails.administratorBeneficiary.validIdImages) && ownerDetails.administratorBeneficiary.validIdImages.length > 0 && (
                        <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <h3 className="text-lg font-semibold mb-4">Administrator Valid ID Images</h3>
                            <ImageUploadGallery
                                images={convertToImageList(ownerDetails.administratorBeneficiary.validIdImages)}
                                onChange={() => {}} // Read-only for viewing
                                maxNumber={5}
                                multiple={true}
                                maxImageHeight="400px"
                                imageFit="contain"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Building Location Section */}
            <div className="panel">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">Building Location</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">Province</label>
                        <p className="text-lg mt-1">{assessment.province || buildingLocation.address_province || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">Municipality</label>
                        <p className="text-lg mt-1">{assessment.municipality || buildingLocation.address_municipality || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-slate-700 dark:text-slate-300">Barangay</label>
                        <p className="text-lg mt-1">{assessment.barangay || buildingLocation.address_barangay || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Street</label>
                        <p className="text-lg mt-1">{buildingLocation.street || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Municipality Code</label>
                        <p className="text-lg mt-1">{buildingLocation.mun_code || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Barangay Code</label>
                        <p className="text-lg mt-1">{buildingLocation.bcode || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">GR Code</label>
                        <p className="text-lg mt-1">{buildingLocation.gr_code || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">GR Name</label>
                        <p className="text-lg mt-1">{buildingLocation.gr_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                        <p className="text-lg mt-1">{buildingLocation.latitude || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                        <p className="text-lg mt-1">{buildingLocation.longitude || 'N/A'}</p>
                    </div>
                    
                    {/* Google Maps Link */}
                    {buildingLocation.latitude && buildingLocation.longitude && (
                        <div className="md:col-span-3">
                            <label className="font-medium text-gray-700 dark:text-gray-300">Location on Map</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <a
                                    href={`https://www.google.com/maps?q=${buildingLocation.latitude},${buildingLocation.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    View on Google Maps
                                </a>
                                <a
                                    href={`https://maps.google.com/maps?q=${buildingLocation.latitude},${buildingLocation.longitude}&t=k`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Satellite View
                                </a>
                                <button
                                    onClick={() => {
                                        const coordinates = `${buildingLocation.latitude},${buildingLocation.longitude}`;
                                        navigator.clipboard.writeText(coordinates);
                                        toast.success('Coordinates copied to clipboard!');
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Coordinates
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                Coordinates: {buildingLocation.latitude}, {buildingLocation.longitude}
                            </p>
                        </div>
                    )}
                    
                    {/* Building Images */}
                    {buildingLocation.buildingImages && Array.isArray(buildingLocation.buildingImages) && buildingLocation.buildingImages.length > 0 && (
                        <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <h3 className="text-lg font-semibold mb-4">Building Images</h3>
                            <ImageUploadGallery
                                images={convertToImageList(buildingLocation.buildingImages)}
                                onChange={() => {}} // Read-only for viewing
                                maxNumber={10}
                                multiple={true}
                                maxImageHeight="400px"
                                imageFit="contain"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Land Reference Section */}
            <div className="panel">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">Land Reference</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Land Owner</label>
                        <p className="text-lg mt-1">{landReference.owner || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Title Number</label>
                        <p className="text-lg mt-1">{landReference.titleNumber || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Lot Number</label>
                        <p className="text-lg mt-1">{landReference.lotNumber || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Block Number</label>
                        <p className="text-lg mt-1">{landReference.blockNumber || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Survey Number</label>
                        <p className="text-lg mt-1">{landReference.surveyNumber || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">TDN/ARP Number</label>
                        <p className="text-lg mt-1">{landReference.tdnArpNumber || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Land Area</label>
                        <p className="text-lg mt-1">{landReference.area ? `${landReference.area} sqm` : 'N/A'}</p>
                    </div>
                    
                    {/* Superseded Assessment */}
                    {landReference.superseded_assessment && (
                        <>
                            <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                <h3 className="text-lg font-semibold mb-4">Superseded Assessment</h3>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Date of Entry</label>
                                <p className="text-lg mt-1">{landReference.superseded_assessment.dateOfEntry || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Previous PIN</label>
                                <p className="text-lg mt-1">{landReference.superseded_assessment.pin || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Previous TDN/ARP</label>
                                <p className="text-lg mt-1">{landReference.superseded_assessment.tdArpNo || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Total Assessed Value</label>
                                <p className="text-lg mt-1">{landReference.superseded_assessment.totalAssessedValue ? formatCurrency(landReference.superseded_assessment.totalAssessedValue) : 'N/A'}</p>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Previous Owner</label>
                                <p className="text-lg mt-1">{landReference.superseded_assessment.previousOwner || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Effectivity Period</label>
                                <p className="text-lg mt-1">{landReference.superseded_assessment.effectivityOfAssessment || 'N/A'}</p>
                            </div>
                        </>
                    )}
                    
                    {/* Memoranda */}
                    {landReference.memoranda?.memoranda && (
                        <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <label className="font-medium text-gray-700 dark:text-gray-300">Land Reference Memoranda</label>
                            <p className="text-sm mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded">{landReference.memoranda.memoranda}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* General Description Section */}
            <div className="panel">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">General Description</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Kind of Building</label>
                        <p className="text-lg mt-1">{generalDescription.kindOfBuilding || generalDescription.kind_of_bldg || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Structural Type</label>
                        <p className="text-lg mt-1">{generalDescription.structuralType || generalDescription.structural_type || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Number of Storeys</label>
                        <p className="text-lg mt-1">{generalDescription.numberOfStoreys || generalDescription.no_of_storeys || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Total Floor Area</label>
                        <p className="text-lg mt-1">{generalDescription.totalFloorArea || assessment.totalArea || generalDescription.total_floor_area || 'N/A'} sqm</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Unit Value</label>
                        <p className="text-lg mt-1">{formatCurrency(generalDescription.unit_value || 0)}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Building Age</label>
                        <p className="text-lg mt-1">{generalDescription.buildingAge || generalDescription.bldg_age || 'N/A'} years</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Building Permit No.</label>
                        <p className="text-lg mt-1">{generalDescription.buildingPermitNo || generalDescription.building_permit_no || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Condominium CCT</label>
                        <p className="text-lg mt-1">{generalDescription.condominiumCCT || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Date Constructed</label>
                        <p className="text-lg mt-1">{generalDescription.dateConstructed ? new Date(generalDescription.dateConstructed).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Date Occupied</label>
                        <p className="text-lg mt-1">{generalDescription.dateOccupied ? new Date(generalDescription.dateOccupied).toLocaleDateString() : generalDescription.date_of_occupied || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Completion Certificate Date</label>
                        <p className="text-lg mt-1">{generalDescription.completionCertificateDate ? new Date(generalDescription.completionCertificateDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Occupancy Certificate Date</label>
                        <p className="text-lg mt-1">{generalDescription.occupancyCertificateDate ? new Date(generalDescription.occupancyCertificateDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    
                    {/* Floor Areas */}
                    {generalDescription.floorAreas && generalDescription.floorAreas.length > 0 && (
                        <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <label className="font-medium text-gray-700 dark:text-gray-300 block mb-3">Floor Areas</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {generalDescription.floorAreas.map((floor: any, index: number) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                        <p className="font-medium">{floor.floorNumber}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{floor.area} sqm</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Floor Plan Images */}
                    {generalDescription.floorPlanImages && Array.isArray(generalDescription.floorPlanImages) && generalDescription.floorPlanImages.length > 0 && (
                        <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <h3 className="text-lg font-semibold mb-4">Floor Plan Images</h3>
                            <ImageUploadGallery
                                images={convertToImageList(generalDescription.floorPlanImages)}
                                onChange={() => {}} // Read-only for viewing
                                maxNumber={10}
                                multiple={true}
                                maxImageHeight="400px"
                                imageFit="contain"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Structural Materials Section */}
            <div className="panel">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">Structural Materials</h2>
                </div>
                <div className="space-y-6">
                    {/* Foundation */}
                    {structuralMaterials.foundation && (
                        <div>
                            <h3 className="font-semibold mb-2">Foundation</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.foundation.reinforceConcrete && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Reinforce Concrete</span>}
                                {structuralMaterials.foundation.plainConcrete && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Plain Concrete</span>}
                                {structuralMaterials.foundation.others && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Others: {structuralMaterials.foundation.othersSpecify}</span>}
                            </div>
                        </div>
                    )}
                    
                    {/* Columns */}
                    {structuralMaterials.columns && (
                        <div>
                            <h3 className="font-semibold mb-2">Columns</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.columns.steel && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Steel</span>}
                                {structuralMaterials.columns.reinforceConcrete && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Reinforce Concrete</span>}
                                {structuralMaterials.columns.wood && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Wood</span>}
                                {structuralMaterials.columns.others && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Others: {structuralMaterials.columns.othersSpecify}</span>}
                            </div>
                        </div>
                    )}
                    
                    {/* Beams */}
                    {structuralMaterials.beams && (
                        <div>
                            <h3 className="font-semibold mb-2">Beams</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.beams.steel && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Steel</span>}
                                {structuralMaterials.beams.reinforceConcrete && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Reinforce Concrete</span>}
                                {structuralMaterials.beams.others && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Others: {structuralMaterials.beams.othersSpecify}</span>}
                            </div>
                        </div>
                    )}
                    
                    {/* Truss Framing */}
                    {structuralMaterials.trussFraming && (
                        <div>
                            <h3 className="font-semibold mb-2">Truss Framing</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.trussFraming.steel && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Steel</span>}
                                {structuralMaterials.trussFraming.wood && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Wood</span>}
                                {structuralMaterials.trussFraming.others && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Others: {structuralMaterials.trussFraming.othersSpecify}</span>}
                            </div>
                        </div>
                    )}
                    
                    {/* Roof */}
                    {structuralMaterials.roof && (
                        <div>
                            <h3 className="font-semibold mb-2">Roof</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.roof.reinforceConcrete && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Reinforce Concrete</span>}
                                {structuralMaterials.roof.tiles && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Tiles</span>}
                                {structuralMaterials.roof.giSheet && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">GI Sheet</span>}
                                {structuralMaterials.roof.aluminum && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Aluminum</span>}
                                {structuralMaterials.roof.asbestos && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Asbestos</span>}
                                {structuralMaterials.roof.longSpan && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Long Span</span>}
                                {structuralMaterials.roof.concreteDesk && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Concrete Desk</span>}
                                {structuralMaterials.roof.nipaAnahawCogon && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Nipa/Anahaw/Cogon</span>}
                                {structuralMaterials.roof.others && <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Others: {structuralMaterials.roof.othersSpecify}</span>}
                            </div>
                        </div>
                    )}
                    
                    {/* Flooring */}
                    {structuralMaterials.flooring && structuralMaterials.flooring.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Flooring</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {structuralMaterials.flooring.map((floor: any, index: number) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                        <p className="font-medium">{floor.floorName}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{floor.material}</p>
                                        {floor.otherSpecify && <p className="text-xs text-gray-500">{floor.otherSpecify}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Walls & Partitions */}
                    {structuralMaterials.wallsPartitions && structuralMaterials.wallsPartitions.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Walls & Partitions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {structuralMaterials.wallsPartitions.map((wall: any, index: number) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                        <p className="font-medium">{wall.wallName}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{wall.material}</p>
                                        {wall.otherSpecify && <p className="text-xs text-gray-500">{wall.otherSpecify}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Property Appraisal and Additional Items Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Property Appraisal */}
                <div className="panel">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                        <h2 className="text-xl font-semibold">Property Appraisal</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium text-gray-700 dark:text-gray-300">Area</label>
                            <p className="text-lg mt-1">{propertyAppraisal.area || 'N/A'} sqm</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-700 dark:text-gray-300">Unit Value</label>
                            <p className="text-lg mt-1">{formatCurrency(propertyAppraisal.unit_value || 0)}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-700 dark:text-gray-300">BUCC</label>
                            <p className="text-lg mt-1">{propertyAppraisal.bucc || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-700 dark:text-gray-300">Base Market Value</label>
                            <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(propertyAppraisal.baseMarketValue || 0)}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-700 dark:text-gray-300">Depreciation</label>
                            <p className="text-lg mt-1">{propertyAppraisal.depreciation || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-700 dark:text-gray-300">Depreciation Cost</label>
                            <p className="text-lg text-red-600 mt-1">-{formatCurrency(propertyAppraisal.depreciationCost || 0)}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="font-medium text-gray-700 dark:text-gray-300">Final Market Value</label>
                            <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(propertyAppraisal.marketValue || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Additional Items */}
                {additionalItems && additionalItems.items && Array.isArray(additionalItems.items) && additionalItems.items.length > 0 && (
                    <div className="panel">
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                            <h2 className="text-xl font-semibold">Additional Items</h2>
                        </div>
                        <div className="space-y-3">
                            {additionalItems.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.label}</p>
                                        {item.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                                        )}
                                        <div className="flex gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                            <span>Qty: {item.quantity}</span>
                                            {item.value && item.value.ratePerSqM && (
                                                <span>Rate: {formatCurrency(item.value.ratePerSqM)}/sqm</span>
                                            )}
                                            {item.value && item.value.percentage && (
                                                <span>Rate: {(item.value.percentage * 100).toFixed(1)}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(item.amount)}</p>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Subtotal and Total */}
                            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-4">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold">Subtotal:</p>
                                    <p className="font-bold">{formatCurrency(additionalItems.subTotal || 0)}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <p className="font-bold text-lg">Total:</p>
                                    <p className="font-bold text-lg text-primary">{formatCurrency(additionalItems.total || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Property Assessment Section */}
            <div className="panel">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">Property Assessment</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Market Value</label>
                        <p className="text-xl font-bold text-green-600 mt-1">
                            {formatCurrency(assessment.marketValueTotal || propertyAppraisal.market_value || 0)}
                        </p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Assessment Value</label>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                            {formatCurrency(propertyAssessment.assessment_value || 0)}
                        </p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Assessment Level</label>
                        <p className="text-lg mt-1">{propertyAssessment.assessment_level || 'N/A'}%</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Building Category</label>
                        <p className="text-lg mt-1">{propertyAssessment.building_category || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Taxability</label>
                        <p className="text-lg mt-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                assessment.taxable 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                                {assessment.taxable ? 'Taxable' : 'Exempt'}
                            </span>
                        </p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Effective Year</label>
                        <p className="text-lg mt-1">{assessment.effYear || propertyAssessment.eff_year || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Effective Quarter</label>
                        <p className="text-lg mt-1">{assessment.effQuarter || propertyAssessment.eff_quarter || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Tax Calculation */}
            <div className="panel bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">Tax Calculation</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Basic Tax (1%)</label>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                            {formatCurrency((propertyAssessment.assessment_value || 0) * 0.01)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <label className="font-medium text-gray-700 dark:text-gray-300">SEF (1%)</label>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                            {formatCurrency((propertyAssessment.assessment_value || 0) * 0.01)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Total Tax Due (2%)</label>
                        <p className="text-2xl font-bold text-red-600 mt-2">
                            {formatCurrency((propertyAssessment.assessment_value || 0) * 0.02)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Memoranda */}
                {memoranda && memoranda.length > 0 && (
                    <div className="panel">
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                            <h2 className="text-xl font-semibold">Memoranda</h2>
                        </div>
                        <div className="space-y-3">
                            {memoranda.map((memo: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                    <p className="text-sm text-gray-600 mb-1">{memo.date}</p>
                                    <p>{memo.details}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* System Information */}
            <div className="panel bg-gray-50 dark:bg-gray-800">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h2 className="text-xl font-semibold">System Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Document ID</label>
                        <p className="mt-1 font-mono text-xs">{assessment.$id}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Created At</label>
                        <p className="mt-1">{assessment.$createdAt ? new Date(assessment.$createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Updated At</label>
                        <p className="mt-1">{assessment.$updatedAt ? new Date(assessment.$updatedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">Synced</label>
                        <p className="mt-1">
                            <span className={`px-2 py-1 rounded text-xs ${
                                assessment.synced 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                                {assessment.synced ? 'Yes' : 'Pending'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={isPreviewOpen}
                imageUrl={previewImageUrl}
                onClose={handleClosePreview}
                title="Image Preview"
            />

            {/* Debug JSON Modal */}
            {showDebugModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4"
                    onClick={() => setShowDebugModal(false)}
                >
                    <div 
                        className="relative bg-white dark:bg-gray-900 rounded-lg max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Debug: Raw Appwrite Data
                            </h3>
                            <button
                                onClick={() => setShowDebugModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <IconX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="overflow-y-auto max-h-[80vh]">
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">Raw Assessment Document</h3>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(assessment, null, 2));
                                    toast.success('JSON data copied to clipboard!');
                                }}
                                className="btn btn-sm btn-outline-primary"
                            >
                                Copy JSON
                            </button>
                        </div>
                        <pre className="bg-black text-green-400 p-4 rounded text-xs overflow-auto max-h-96 font-mono">
                            {JSON.stringify(assessment, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Parsed JSON Fields</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assessment && (
                                <>
                                    <div>
                                        <h4 className="font-medium mb-2">Owner Details</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.owner_details), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Building Location</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.building_location), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">General Description</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.general_description), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Property Appraisal</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.property_appraisal), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Property Assessment</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.property_assessment), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Structural Materials</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.structural_materials), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Additional Items</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.additionalItems), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Memoranda</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.memoranda), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Land Reference</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.land_reference), null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Superseded Records</h4>
                                        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32 font-mono">
                                            {JSON.stringify(parseJSON(assessment.superseded_records), null, 2)}
                                        </pre>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Collection Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Collection ID:</span>
                                <p className="font-mono bg-white dark:bg-gray-800 p-1 rounded mt-1">{BUILDING_COLLECTION_ID}</p>
                            </div>
                            <div>
                                <span className="font-medium">Document ID:</span>
                                <p className="font-mono bg-white dark:bg-gray-800 p-1 rounded mt-1">{assessment?.$id}</p>
                            </div>
                            <div>
                                <span className="font-medium">Created At:</span>
                                <p className="font-mono bg-white dark:bg-gray-800 p-1 rounded mt-1">
                                    {assessment?.$createdAt ? new Date(assessment.$createdAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium">Updated At:</span>
                                <p className="font-mono bg-white dark:bg-gray-800 p-1 rounded mt-1">
                                    {assessment?.$updatedAt ? new Date(assessment.$updatedAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                console.log('Raw Assessment Data:', assessment);
                                console.log('Parsed Owner Details:', parseJSON(assessment?.owner_details));
                                console.log('Parsed Building Location:', parseJSON(assessment?.building_location));
                                console.log('Parsed General Description:', parseJSON(assessment?.general_description));
                                console.log('Parsed Property Assessment:', parseJSON(assessment?.property_assessment));
                                toast.success('Data logged to browser console!');
                            }}
                            className="btn btn-outline-info"
                        >
                            Log to Console
                        </button>
                        <button
                            onClick={() => setShowDebugModal(false)}
                            className="btn btn-primary"
                        >
                            Close
                        </button>
                    </div>
                </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentDetails;