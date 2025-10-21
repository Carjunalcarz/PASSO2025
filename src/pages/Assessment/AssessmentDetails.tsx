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
import IconCaretDown from '../../components/Icon/IconCaretDown';
import ImageUploadGallery from '../../components/ImageUploadGallery';
import ImagePreviewModal from '../Assessment/components/ImagePreviewModal';
import FaasPdfListing from './components/FaasPdfListing';

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
    
    // Collapsible sections state
    const [collapsedSections, setCollapsedSections] = useState({
        faas: true,
        owner: true,
        location: true,
        landRef: true,
        general: true,
        structural: true,
        appraisal: true,
        assessment: true,
        tax: true,
        additional: true,
        memoranda: true,
        system: true
    });

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

    // Toggle section collapse
    const toggleSection = (section: keyof typeof collapsedSections) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Collapsible Section Header Component
    const CollapsibleSectionHeader = ({ 
        title, 
        sectionKey, 
        icon, 
        badge 
    }: { 
        title: string; 
        sectionKey: keyof typeof collapsedSections; 
        icon?: React.ReactNode;
        badge?: string;
    }) => (
        <button
            onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 border-b border-slate-200 dark:border-slate-700"
        >
            <div className="flex items-center gap-3">
                {icon}
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
                {badge && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                        {badge}
                    </span>
                )}
            </div>
            <IconCaretDown 
                className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${
                    collapsedSections[sectionKey] ? 'rotate-180' : ''
                }`} 
            />
        </button>
    );

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
                        {/* <button 
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
                        </button> */}
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

            {/* FAAS PDF Listing Section */}
            <FaasPdfListing
                faasData={assessment.faas}
                tdnNumber={assessment.tdArp}
                ownerName={assessment.ownerName || ownerDetails.owner}
                pin={assessment.pin || ownerDetails.pin}
                userId={assessment.userId}
            />

            {/* Owner Details Section */}
            <div className="panel overflow-hidden">
                <CollapsibleSectionHeader 
                    title="Owner Details" 
                    sectionKey="owner"
                    icon={
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                    badge={assessment.ownerName ? "Complete" : "Incomplete"}
                />
                {!collapsedSections.owner && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                <label className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Owner Name</label>
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mt-1">{assessment.ownerName || ownerDetails.owner || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                                <label className="text-xs font-semibold text-green-800 dark:text-green-300 uppercase tracking-wide">TDN/ARP No.</label>
                                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mt-1 font-mono">{assessment.tdArp || ownerDetails.td || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                                <label className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">PIN</label>
                                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mt-1 font-mono">{assessment.pin || ownerDetails.pin || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                                <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Transaction Code</label>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mt-1">{assessment.transactionCode || ownerDetails.transaction_code || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">TIN</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 font-mono">{ownerDetails.tin || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">Tel No.</label>
                                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mt-1">{ownerDetails.telNo || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 p-3 rounded-lg border border-rose-200 dark:border-rose-700">
                                <label className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wide">Owner Address</label>
                                <p className="text-sm font-semibold text-rose-900 dark:text-rose-100 mt-1 leading-relaxed">{ownerDetails.address || ownerDetails.ownerAddress || 'N/A'}</p>
                            </div>
                    
                    {/* Administrator/Beneficiary Section */}
                    {ownerDetails.hasAdministratorBeneficiary && ownerDetails.administratorBeneficiary && (
                        <>
                            <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                <h3 className="text-sm font-semibold mb-4">Administrator/Beneficial User</h3>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                <label className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Name</label>
                                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mt-1">{ownerDetails.administratorBeneficiary.name || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-3 rounded-lg border border-teal-200 dark:border-teal-700">
                                <label className="text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wide">TIN</label>
                                <p className="text-sm font-semibold text-teal-900 dark:text-teal-100 mt-1 font-mono">{ownerDetails.administratorBeneficiary.tin || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-3 rounded-lg border border-cyan-200 dark:border-cyan-700">
                                <label className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 uppercase tracking-wide">Tel No.</label>
                                <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100 mt-1">{ownerDetails.administratorBeneficiary.telNo || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 p-3 rounded-lg border border-sky-200 dark:border-sky-700">
                                <label className="text-xs font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wide">Address</label>
                                <p className="text-sm font-semibold text-sky-900 dark:text-sky-100 mt-1 leading-relaxed">{ownerDetails.administratorBeneficiary.address || 'N/A'}</p>
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
                )}
            </div>

            {/* Building Location Section */}
            <div className="panel overflow-hidden">
                <CollapsibleSectionHeader 
                    title="Building Location" 
                    sectionKey="location"
                    icon={
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                    badge={buildingLocation.latitude && buildingLocation.longitude ? "With Coordinates" : "Basic Info"}
                />
                {!collapsedSections.location && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                <label className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Street</label>
                                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mt-1">{buildingLocation.street || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-3 rounded-lg border border-teal-200 dark:border-teal-700">
                                <label className="text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wide">Barangay</label>
                                <p className="text-sm font-semibold text-teal-900 dark:text-teal-100 mt-1">{buildingLocation.barangay || assessment.barangay || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-3 rounded-lg border border-cyan-200 dark:border-cyan-700">
                                <label className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 uppercase tracking-wide">Municipality</label>
                                <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100 mt-1">{buildingLocation.municipality || assessment.municipality || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 p-3 rounded-lg border border-sky-200 dark:border-sky-700">
                                <label className="text-xs font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wide">Province</label>
                                <p className="text-sm font-semibold text-sky-900 dark:text-sky-100 mt-1">{buildingLocation.province || assessment.province || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-lime-50 to-lime-100 dark:from-lime-900/20 dark:to-lime-800/20 p-3 rounded-lg border border-lime-200 dark:border-lime-700">
                                <label className="text-xs font-semibold text-lime-800 dark:text-lime-300 uppercase tracking-wide">Latitude</label>
                                <p className="text-sm font-semibold text-lime-900 dark:text-lime-100 mt-1 font-mono">{buildingLocation.latitude || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                <label className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 uppercase tracking-wide">Longitude</label>
                                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mt-1 font-mono">{buildingLocation.longitude || 'N/A'}</p>
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
                )}
            </div>

            {/* Land Reference Section */}
            <div className="panel overflow-hidden">
                <CollapsibleSectionHeader 
                    title="Land Reference" 
                    sectionKey="landRef"
                    icon={
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    badge={landReference.titleNumber ? "With Title" : "Basic Info"}
                />
                {!collapsedSections.landRef && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                                <label className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wide">Land Owner</label>
                                <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mt-1">{landReference.owner || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                                <label className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide">Title Number</label>
                                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mt-1 font-mono">{landReference.titleNumber || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-3 rounded-lg border border-pink-200 dark:border-pink-700">
                                <label className="text-xs font-semibold text-pink-800 dark:text-pink-300 uppercase tracking-wide">Lot Number</label>
                                <p className="text-sm font-semibold text-pink-900 dark:text-pink-100 mt-1 font-mono">{landReference.lotNumber || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-900/20 dark:to-fuchsia-800/20 p-3 rounded-lg border border-fuchsia-200 dark:border-fuchsia-700">
                                <label className="text-xs font-semibold text-fuchsia-800 dark:text-fuchsia-300 uppercase tracking-wide">Block Number</label>
                                <p className="text-sm font-semibold text-fuchsia-900 dark:text-fuchsia-100 mt-1 font-mono">{landReference.blockNumber || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 p-3 rounded-lg border border-violet-200 dark:border-violet-700">
                                <label className="text-xs font-semibold text-violet-800 dark:text-violet-300 uppercase tracking-wide">Survey Number</label>
                                <p className="text-sm font-semibold text-violet-900 dark:text-violet-100 mt-1 font-mono">{landReference.surveyNumber || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                                <label className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">TDN/ARP Number</label>
                                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mt-1 font-mono">{landReference.tdnArpNumber || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">Land Area</label>
                                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mt-1">{landReference.area ? `${landReference.area} sqm` : 'N/A'}</p>
                            </div>
                    
                    {/* Superseded Assessment */}
                    {landReference.superseded_assessment && (
                        <>
                            <div className="md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                <h3 className="text-sm font-semibold mb-4">Superseded Assessment</h3>
                            </div>
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Date of Entry</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{landReference.superseded_assessment.dateOfEntry || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Previous PIN</label>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 font-mono">{landReference.superseded_assessment.pin || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800/20 dark:to-zinc-700/20 p-3 rounded-lg border border-zinc-200 dark:border-zinc-600">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Previous TDN/ARP</label>
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 font-mono">{landReference.superseded_assessment.tdArpNo || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-800/20 dark:to-stone-700/20 p-3 rounded-lg border border-stone-200 dark:border-stone-600">
                                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">Total Assessed Value</label>
                                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-1">{landReference.superseded_assessment.totalAssessedValue ? formatCurrency(landReference.superseded_assessment.totalAssessedValue) : 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800/20 dark:to-neutral-700/20 p-3 rounded-lg border border-neutral-200 dark:border-neutral-600">
                                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">Previous Owner</label>
                                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-1">{landReference.superseded_assessment.previousOwner || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                                <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Effectivity Period</label>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mt-1">{landReference.superseded_assessment.effectivityOfAssessment || 'N/A'}</p>
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
                )}
            </div>

            {/* General Description Section */}
            <div className="panel overflow-hidden">
                <CollapsibleSectionHeader 
                    title="General Description" 
                    sectionKey="general"
                    icon={
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                    badge={generalDescription.kindOfBuilding || generalDescription.kind_of_bldg ? "Complete" : "Basic Info"}
                />
                {!collapsedSections.general && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                <label className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Kind of Building</label>
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mt-1">{generalDescription.kindOfBuilding || generalDescription.kind_of_bldg || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                                <label className="text-xs font-semibold text-green-800 dark:text-green-300 uppercase tracking-wide">Structural Type</label>
                                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mt-1">{generalDescription.structuralType || generalDescription.structural_type || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                                <label className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">Number of Storeys</label>
                                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mt-1">{generalDescription.numberOfStoreys || generalDescription.no_of_storeys || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                                <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Total Floor Area</label>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mt-1">{generalDescription.totalFloorArea || assessment.totalArea || generalDescription.total_floor_area || 'N/A'} sqm</p>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                <label className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Unit Value</label>
                                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mt-1">{formatCurrency(generalDescription.unit_value || 0)}</p>
                            </div>
                            <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-3 rounded-lg border border-teal-200 dark:border-teal-700">
                                <label className="text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wide">Building Age</label>
                                <p className="text-sm font-semibold text-teal-900 dark:text-teal-100 mt-1">{generalDescription.buildingAge || generalDescription.bldg_age || 'N/A'} years</p>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-3 rounded-lg border border-cyan-200 dark:border-cyan-700">
                                <label className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 uppercase tracking-wide">Building Permit No.</label>
                                <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100 mt-1 font-mono">{generalDescription.buildingPermitNo || generalDescription.building_permit_no || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 p-3 rounded-lg border border-sky-200 dark:border-sky-700">
                                <label className="text-xs font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wide">Condominium CCT</label>
                                <p className="text-sm font-semibold text-sky-900 dark:text-sky-100 mt-1">{generalDescription.condominiumCCT || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-lime-50 to-lime-100 dark:from-lime-900/20 dark:to-lime-800/20 p-3 rounded-lg border border-lime-200 dark:border-lime-700">
                                <label className="text-xs font-semibold text-lime-800 dark:text-lime-300 uppercase tracking-wide">Date Constructed</label>
                                <p className="text-sm font-semibold text-lime-900 dark:text-lime-100 mt-1">{generalDescription.dateConstructed ? new Date(generalDescription.dateConstructed).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                <label className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 uppercase tracking-wide">Date Occupied</label>
                                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mt-1">{generalDescription.dateOccupied ? new Date(generalDescription.dateOccupied).toLocaleDateString() : generalDescription.date_of_occupied || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                                <label className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wide">Completion Certificate Date</label>
                                <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mt-1">{generalDescription.completionCertificateDate ? new Date(generalDescription.completionCertificateDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                                <label className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide">Occupancy Certificate Date</label>
                                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mt-1">{generalDescription.occupancyCertificateDate ? new Date(generalDescription.occupancyCertificateDate).toLocaleDateString() : 'N/A'}</p>
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
                )}
            </div>

            {/* Structural Materials Section */}
            <div className="panel overflow-hidden">
                <CollapsibleSectionHeader 
                    title="Structural Materials" 
                    sectionKey="structural"
                    icon={
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                    badge={structuralMaterials.foundation || structuralMaterials.columns ? "Materials Listed" : "Basic Info"}
                />
                {!collapsedSections.structural && (
                    <div className="p-4">
                        <div className="space-y-4">
                    {/* Foundation */}
                    {structuralMaterials.foundation && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Foundation</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.foundation.reinforceConcrete && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Reinforce Concrete</span>}
                                {structuralMaterials.foundation.plainConcrete && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Plain Concrete</span>}
                                {structuralMaterials.foundation.others && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Others: {structuralMaterials.foundation.othersSpecify}</span>}
                            </div>
                        </div>
                    )}
                    
                    {/* Columns */}
                    {structuralMaterials.columns && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Columns</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.columns.steel && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Steel</span>}
                                {structuralMaterials.columns.reinforceConcrete && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Reinforce Concrete</span>}
                                {structuralMaterials.columns.wood && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Wood</span>}
                                {structuralMaterials.columns.others && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Others: {structuralMaterials.columns.othersSpecify}</span>}
                            </div>
                        </div>
                    )}
                    
                    {/* Beams */}
                    {structuralMaterials.beams && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Beams</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.beams.steel && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Steel</span>}
                                {structuralMaterials.beams.reinforceConcrete && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Reinforce Concrete</span>}
                                {structuralMaterials.beams.others && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Others: {structuralMaterials.beams.othersSpecify}</span>}
                            </div>
                        </div>
                    )}
                    
                    {/* Truss Framing */}
                    {structuralMaterials.trussFraming && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Truss Framing</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {structuralMaterials.trussFraming.steel && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Steel</span>}
                                {structuralMaterials.trussFraming.wood && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Wood</span>}
                                {structuralMaterials.trussFraming.others && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Others: {structuralMaterials.trussFraming.othersSpecify}</span>}
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
                )}
            </div>

            {/* Property Appraisal and Additional Items Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Property Appraisal */}
                <div className="panel overflow-hidden">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Property Appraisal
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                            <label className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Area</label>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mt-1">{propertyAppraisal.area || 'N/A'} sqm</p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                            <label className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">Unit Value</label>
                            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mt-1">{formatCurrency(propertyAppraisal.unit_value || 0)}</p>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                            <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">BUCC</label>
                            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mt-1 font-mono">{propertyAppraisal.bucc || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <label className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Base Market Value</label>
                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mt-1">{formatCurrency(propertyAppraisal.baseMarketValue || 0)}</p>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                            <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Depreciation</label>
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mt-1">{propertyAppraisal.depreciation || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                            <label className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide">Depreciation Cost</label>
                            <p className="text-sm font-bold text-red-900 dark:text-red-100 mt-1">-{formatCurrency(propertyAppraisal.depreciationCost || 0)}</p>
                        </div>
                        <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <label className="text-xs font-semibold text-green-800 dark:text-green-300 uppercase tracking-wide">Final Market Value</label>
                            <p className="text-lg font-bold text-green-900 dark:text-green-100 mt-1">{formatCurrency(propertyAppraisal.marketValue || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Additional Items */}
                {additionalItems && additionalItems.items && Array.isArray(additionalItems.items) && additionalItems.items.length > 0 && (
                    <div className="panel overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Additional Items
                            </h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {additionalItems.items.map((item: any, index: number) => (
                                <div key={index} className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                                            {item.description && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                                            )}
                                            <div className="flex gap-3 mt-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs font-medium">
                                                    Qty: {item.quantity}
                                                </span>
                                                {item.value && item.value.ratePerSqM && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded text-xs font-medium">
                                                        Rate: {formatCurrency(item.value.ratePerSqM)}/sqm
                                                    </span>
                                                )}
                                                {item.value && item.value.percentage && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded text-xs font-medium">
                                                        Rate: {(item.value.percentage * 100).toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(item.amount)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Subtotal and Total */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-3">
                                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Subtotal</label>
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">{formatCurrency(additionalItems.subTotal || 0)}</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Total</label>
                                        <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(additionalItems.total || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Property Assessment Section */}
            <div className="panel overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Property Assessment
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                        <label className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Market Value</label>
                        <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                            {formatCurrency(assessment.marketValueTotal || propertyAppraisal.market_value || 0)}
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <label className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Assessment Value</label>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
                            {formatCurrency(propertyAssessment.assessment_value || 0)}
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                        <label className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">Assessment Level</label>
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mt-1">{propertyAssessment.assessment_level || 'N/A'}%</p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                        <label className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">Building Category</label>
                        <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mt-1">{propertyAssessment.building_category || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                        <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Taxability</label>
                        <div className="mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assessment.taxable 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                                {assessment.taxable ? 'Taxable' : 'Exempt'}
                            </span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-3 rounded-lg border border-teal-200 dark:border-teal-700">
                        <label className="text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wide">Effective Year</label>
                        <p className="text-sm font-semibold text-teal-900 dark:text-teal-100 mt-1">{assessment.effYear || propertyAssessment.eff_year || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-3 rounded-lg border border-cyan-200 dark:border-cyan-700">
                        <label className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 uppercase tracking-wide">Effective Quarter</label>
                        <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100 mt-1">{assessment.effQuarter || propertyAssessment.eff_quarter || 'N/A'}</p>
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