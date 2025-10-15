import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Dropdown from '../../components/Dropdown';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { useQuery, useMutation } from '@tanstack/react-query';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import { Modal } from '@mantine/core';
import { toast } from 'react-toastify';
import SuggesstionSearchInput from '../Municipality/Components/SuggesstionSearchInput';
import TaxableSwitch from '../Municipality/Components/TaxableSwitch';
import { Link, useNavigate } from 'react-router-dom';
import SubclassSuggesstion from '../Municipality/Components/SubclassSuggesstion';
import GRFilter from '../Municipality/Components/GRFilter';
import { useState } from 'react';
import IconEye from '../../components/Icon/IconEye';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService, BuildingAssessmentDocument } from '../../services/databaseService';

// Define column interface
interface Column {
    accessor: keyof Assessment | 'actions';
    title: string;
    sortable: boolean;
    render?: (record: Assessment) => React.ReactNode;
    rowKey?: string;
}

// Define the Assessment interface for display (transformed from BuildingAssessmentDocument)
interface Assessment {
    pin: string;
    name: string;
    tdn: string;
    market_val: number;
    ass_value: number;
    area: number;
    unit_value: number;
    kind: string;
    ass_level: number;
    classification: string;
    sub_class: string;
    taxability: string;
    trans_cd: string;
    tax_beg_yr: number;
    eff_date: string;
    owner_no: string;
    mun_code: string;
    municipality: string;
    barangay_code: string;
    barangay: string;
    gr_code: string;
    gr: string;
    id: string;
    rowKey?: string;
}

const formatCurrency = (amount: number) => {
    return `₱${new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)}`;
};

const BuildingAssessment = () => {
    const [taxabilityFilter, setTaxabilityFilter] = useState('exempt');
    const [subclassFilter, setSubclassFilter] = useState<string>('all');
    const [grFilter, setGrFilter] = useState<string>('all');
    const { user, isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const navigate = useNavigate();
    
    // Collection ID for building assessments - you'll need to set this in your environment
    const BUILDING_COLLECTION_ID = import.meta.env.VITE_APPWRITE_BUILDING_ASSESSMENTS_COLLECTION_ID || 'building-assessments';
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [searchColumn, setSearchColumn] = useState('tdn');
    const [hideCols, setHideCols] = useState<Array<keyof Assessment>>(['name', 'barangay_code', 'mun_code', 'gr_code', 'eff_date', 'owner_no']);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'tdn',
        direction: 'asc',
    });

    const [editingRecord, setEditingRecord] = useState<Assessment | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTdn, setDeletingTdn] = useState<string | null>(null);

    const cols: Column[] = [
        { accessor: 'tdn', title: 'TDN', sortable: true },
        { accessor: 'pin', title: 'PIN', sortable: true },
        { accessor: 'name', title: 'Name', sortable: true },
        {
            accessor: 'market_val',
            title: 'Market Value',
            render: (record: Assessment) => <div>{record.market_val ? formatCurrency(record.market_val) : 0}</div>,
            sortable: true
        },
        {
            accessor: 'ass_value',
            title: 'Assessment Value',
            render: (record: Assessment) => <div>{record.ass_value ? formatCurrency(record.ass_value) : 0}</div>,
            sortable: true
        },
        {
            accessor: 'area',
            title: 'Area',
            render: (record: Assessment) => <div>{record.area ? record.area : 0}</div>,
            sortable: true
        },
        {
            accessor: 'unit_value',
            title: 'Unit Value',
            render: (record: Assessment) => <div>{record.unit_value ? record.unit_value : 0}</div>,
            sortable: true
        },
        {
            accessor: 'kind',
            title: 'Kind',
            render: (record: Assessment) => <div>{record.kind ? record.kind : 0}</div>,
            sortable: true
        },
        {
            accessor: 'ass_level',
            title: 'Ass Level',
            render: (record: Assessment) => <div>{record.ass_level ? record.ass_level : 0}</div>,
            sortable: true
        },
        
        { accessor: 'classification', title: 'Classification', sortable: true },
        { accessor: 'sub_class', title: 'Sub Class', sortable: true },
        {
            accessor: 'taxability',
            title: 'Taxability',
            sortable: true,
        },
        {
            accessor: 'trans_cd',
            title: 'Transaction Code',
            sortable: true,
        },
        {
            accessor: 'tax_beg_yr',
            title: 'Tax Beg Yr',
            render: (record: Assessment) => <div>{record.tax_beg_yr ? record.tax_beg_yr : 0}</div>,
            sortable: true
        },
        {
            accessor: 'eff_date',
            title: 'Eff Date',
            render: (record: Assessment) => <div>{record.eff_date ? record.eff_date : 0}</div>,
            sortable: true
        },
        {
            accessor: 'owner_no',
            title: 'Owner No',
            render: (record: Assessment) => <div>{record.owner_no ? record.owner_no : 0}</div>,
            sortable: true
        },
     
        { accessor: 'mun_code', title: 'Municipality Code', sortable: true },
        { accessor: 'municipality', title: 'Municipality', sortable: true },
        { accessor: 'barangay_code', title: 'Barangay Code', sortable: true },
        { accessor: 'barangay', title: 'Barangay', sortable: true },
        { accessor: 'gr_code', title: 'GR Code', sortable: true },
        { accessor: 'gr', title: 'GR', sortable: true },

        {
            accessor: 'actions',
            sortable: false,
            title: 'Actions',
            render: (record: Assessment) => (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleView(record)}
                        className="p-1 bg-transparent border border-primary text-primary rounded hover:bg-primary hover:text-white hover:border-primary transition-colors duration-200"
                        title="View Record"
                    >
                        <IconEye className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleUpdate(record)}
                        className="p-1 bg-transparent border border-primary text-primary rounded hover:bg-primary hover:text-white hover:border-primary transition-colors duration-200"
                        title="Edit Record"
                    >
                        <IconEdit className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(record.tdn)}
                        className="p-1 bg-transparent border border-danger text-danger rounded hover:bg-danger hover:text-white hover:border-danger transition-colors duration-200"
                        title="Delete Record"
                    >
                        <IconTrash className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    useEffect(() => {
        dispatch(setPageTitle('Building'));
    }, [dispatch]);

    // Transform BuildingAssessmentDocument to Assessment interface
    const transformBuildingAssessment = (data: BuildingAssessmentDocument): Assessment => {
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

        return {
            id: data.$id ?? '',
            pin: data.pin ?? ownerDetails.pin ?? '',
            name: data.ownerName ?? ownerDetails.owner ?? '',
            tdn: data.tdArp ?? ownerDetails.td ?? '',
            market_val: data.marketValueTotal ?? propertyAppraisal.market_value ?? 0,
            ass_value: propertyAssessment.assessment_value ?? 0,
            area: data.totalArea ?? Number(generalDescription.total_floor_area ?? 0),
            unit_value: generalDescription.unit_value ?? 0,
            kind: generalDescription.kind_of_bldg ?? '',
            ass_level: Number(propertyAssessment.assessment_level ?? 0),
            classification: propertyAssessment.building_category ?? '',
            sub_class: generalDescription.structural_type ?? '',
            taxability: data.taxable ? 'Taxable' : 'Exempt',
            trans_cd: data.transactionCode ?? ownerDetails.transaction_code ?? '',
            tax_beg_yr: Number(data.effYear ?? propertyAssessment.eff_year ?? 0),
            eff_date: data.effYear ?? propertyAssessment.eff_year ?? '',
            owner_no: ownerDetails.id?.toString() ?? '',
            mun_code: buildingLocation.mun_code ?? '',
            municipality: data.municipality ?? buildingLocation.address_municipality ?? '',
            barangay_code: buildingLocation.bcode ?? '',
            barangay: data.barangay ?? buildingLocation.address_barangay ?? '',
            gr_code: buildingLocation.gr_code ?? '',
            gr: buildingLocation.gr_name ?? '',
        };
    };

    const fetchBuildingAssessments = async (): Promise<Assessment[]> => {
        if (!isAuthenticated) {
            throw new Error('User not authenticated');
        }
        
        console.log('🏢 Fetching building assessments from collection:', BUILDING_COLLECTION_ID);
        const buildingAssessments = await databaseService.getBuildingAssessments(BUILDING_COLLECTION_ID);
        
        // Transform to Assessment interface for display
        return buildingAssessments.map(transformBuildingAssessment);
    };

    const { data: rowData = [], isLoading: queryLoading, refetch } = useQuery<Assessment[]>({
        queryKey: ['building-assessments'],
        queryFn: fetchBuildingAssessments,
        enabled: isAuthenticated,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 5 * 60 * 1000,
    });
    console.log("rowData", rowData);

    // First filter by search
    const searchFilteredData = rowData.filter((item: Assessment) => {
        const value = item[searchColumn.toLowerCase() as keyof Assessment];
        return (value?.toString() ?? '').toLowerCase().includes(search.toLowerCase());
    });

    // 2. Filter by taxability and subclass
    const filteredData = searchFilteredData.filter((item: Assessment) => {
        const matchesTaxability =
            taxabilityFilter === 'all' ||
            (taxabilityFilter === 'taxable' && item.taxability === 'Taxable') ||
            (taxabilityFilter === 'exempt' && item.taxability === 'Exempt');

        const matchesSubclass =
            subclassFilter === 'all' || item.sub_class?.toLowerCase() === subclassFilter.toLowerCase();

        const matchesGR =
            grFilter === 'all' || item.gr_code?.toLowerCase() === grFilter.toLowerCase();

        return matchesTaxability && matchesSubclass && matchesGR;
    });

    const sortedData = sortBy(filteredData, (item) => {
        switch (sortStatus.columnAccessor) {
            case 'market_val':
                return item.market_val || 0;
            case 'ass_value':
                return item.ass_value || 0;
            case 'area':
                return item.area || 0;
            default:
                return item[sortStatus.columnAccessor as keyof Assessment];
        }
    });
    const finalData = sortStatus.direction === 'desc' ? sortedData.reverse() : sortedData;

    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const recordsData = finalData.slice(from, to);

    // Calculate sums for filtered data
    // Utility to deduplicate by tdn
    const getUniqueByTdn = (data: Assessment[]) => {
        const seen = new Set();
        return data.filter(item => {
            if (seen.has(item.tdn)) return false;
            seen.add(item.tdn);
            return true;
        });
    };

    const calculateSums = () => {

        const totalMarketValue = filteredData.reduce((sum, record) => sum + (record.market_val || 0), 0);
        const totalAssessmentValue = filteredData.reduce((sum, record) => sum + (record.ass_value || 0), 0);
        const totalArea = filteredData.reduce((sum, record) => sum + (record.area || 0), 0);

        // Only count unique TDNs for recordCount
        const uniqueTdnCount = getUniqueByTdn(filteredData).length;

        return {
            totalMarketValue,
            totalAssessmentValue,
            totalArea,
            recordCount: uniqueTdnCount
        };
    };

    const sums = calculateSums();

    const toggleColumn = (col: keyof Assessment) => {
        setHideCols((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
    };

    const createMutation = useMutation<BuildingAssessmentDocument, Error, Partial<Assessment>>({
        mutationFn: async (newData: Partial<Assessment>) => {
            if (!isAuthenticated) {
                throw new Error('User not authenticated');
            }
            
            // Convert Assessment to BuildingAssessmentDocument format
            const createData: Omit<BuildingAssessmentDocument, '$id' | '$createdAt' | '$updatedAt'> = {
                ownerName: newData.name || '',
                transactionCode: newData.trans_cd || '',
                tdArp: newData.tdn || '',
                pin: newData.pin || '',
                barangay: newData.barangay || '',
                municipality: newData.municipality || '',
                marketValueTotal: newData.market_val || 0,
                taxable: newData.taxability === 'Taxable',
                effYear: newData.eff_date || '',
                totalArea: newData.area || 0,
                userId: user?.$id,
                synced: false,
                // Create JSON fields
                owner_details: JSON.stringify({
                    id: newData.owner_no,
                    pin: newData.pin,
                    owner: newData.name,
                    td: newData.tdn,
                    transaction_code: newData.trans_cd
                }),
                building_location: JSON.stringify({
                    mun_code: newData.mun_code,
                    address_municipality: newData.municipality,
                    bcode: newData.barangay_code,
                    address_barangay: newData.barangay,
                    gr_code: newData.gr_code,
                    gr_name: newData.gr
                }),
                general_description: JSON.stringify({
                    total_floor_area: newData.area,
                    unit_value: newData.unit_value,
                    kind_of_bldg: newData.kind,
                    structural_type: newData.sub_class
                }),
                property_appraisal: JSON.stringify({
                    market_value: newData.market_val
                }),
                property_assessment: JSON.stringify({
                    assessment_value: newData.ass_value,
                    assessment_level: newData.ass_level,
                    building_category: newData.classification,
                    eff_year: newData.eff_date
                })
            };
            
            return await databaseService.createBuildingAssessment(BUILDING_COLLECTION_ID, createData);
        },
        onSuccess: () => {
            toast.success('Building assessment created successfully');
            refetch();
        },
        onError: (error) => {
            console.error('Create error:', error);
            toast.error('Failed to create building assessment: ' + error.message);
        },
    });

    const updateMutation = useMutation<
        BuildingAssessmentDocument,
        Error,
        Assessment,
        unknown
    >({
        mutationFn: async (data: Assessment) => {
            if (!isAuthenticated) {
                throw new Error('User not authenticated');
            }
            
            // Convert Assessment back to BuildingAssessmentDocument format
            const updateData: Partial<BuildingAssessmentDocument> = {
                ownerName: data.name,
                transactionCode: data.trans_cd,
                tdArp: data.tdn,
                pin: data.pin,
                barangay: data.barangay,
                municipality: data.municipality,
                marketValueTotal: data.market_val,
                taxable: data.taxability === 'Taxable',
                effYear: data.eff_date,
                totalArea: data.area,
                // Update JSON fields as needed
                owner_details: JSON.stringify({
                    id: data.owner_no,
                    pin: data.pin,
                    owner: data.name,
                    td: data.tdn,
                    transaction_code: data.trans_cd
                }),
                building_location: JSON.stringify({
                    mun_code: data.mun_code,
                    address_municipality: data.municipality,
                    bcode: data.barangay_code,
                    address_barangay: data.barangay,
                    gr_code: data.gr_code,
                    gr_name: data.gr
                }),
                general_description: JSON.stringify({
                    total_floor_area: data.area,
                    unit_value: data.unit_value,
                    kind_of_bldg: data.kind,
                    structural_type: data.sub_class
                }),
                property_appraisal: JSON.stringify({
                    market_value: data.market_val
                }),
                property_assessment: JSON.stringify({
                    assessment_value: data.ass_value,
                    assessment_level: data.ass_level,
                    building_category: data.classification,
                    eff_year: data.eff_date
                })
            };
            
            return await databaseService.updateBuildingAssessment(BUILDING_COLLECTION_ID, data.id, updateData);
        },
        onSuccess: () => {
            toast.success('Building assessment updated successfully');
            setIsEditModalOpen(false);
            setEditingRecord(null);
            refetch();
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error('Failed to update building assessment: ' + error.message);
        },
    });

    const deleteMutation = useMutation<
        void,
        Error,
        string,
        unknown
    >({
        mutationFn: async (documentId: string) => {
            if (!isAuthenticated) {
                throw new Error('User not authenticated');
            }
            
            await databaseService.deleteBuildingAssessment(BUILDING_COLLECTION_ID, documentId);
        },
        onSuccess: () => {
            toast.success('Building assessment deleted successfully');
            setIsDeleteModalOpen(false);
            setDeletingTdn(null);
            refetch();
        },
        onError: (error) => {
            console.error('Delete error:', error);
            toast.error('Failed to delete building assessment: ' + error.message);
        },
    });

    const handleCreate = (data: Partial<Assessment>) => {
        createMutation.mutate(data);
    };

    const handleUpdate = (record: Assessment) => {
        setEditingRecord(record);
        setIsEditModalOpen(true);
    };

    const handleDelete = (tdn: string) => {
        // Find the record to get the document ID
        const record = rowData.find(r => r.tdn === tdn);
        if (record) {
            setDeletingTdn(record.id); // Store document ID instead of TDN
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDelete = () => {
        if (deletingTdn) {
            deleteMutation.mutate(deletingTdn); // deletingTdn now contains document ID
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRecord) {
            updateMutation.mutate(editingRecord);
        }
    };

    const handleView = (record: Assessment) => {
        navigate(`/assessment/view/${record.id}`);
    };

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-5">
                <li>
                    <Link to="/" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Building Assessment Data-2025</span>
                </li>
            </ul>

            {/* Summary Cards */}
             {/* Summary Cards */}
             <div className="overflow-x-auto scrollbar-hidden scrollbar-hover">
                <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-4 mb-6 w-max min-w-full">
                    {/* Panel 1 */}
                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col items-start gap-2">
                                <img src="/mun_logo/carmen.png" alt="carmen Logo" className="w-20 h-20 rounded-sm" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-3xl font-bold">{sums.recordCount.toLocaleString()}</div>
                                <div className="text-blue-100">Total RPU Records</div>
                            </div>
                        </div>
                        <p className="text-left text-xl m-2">Building</p>
                    </div>

                    {/* Panel 2 */}
                    <div className="panel bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-md">
                        <div className="text-xl font-bold">{formatCurrency(sums.totalMarketValue)}</div>
                        <div className="text-green-100">Total Market Value</div>
                    </div>

                    {/* Panel 3 */}
                    <div className="panel bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
                        <div className="text-xl font-bold">{formatCurrency(sums.totalAssessmentValue)}</div>
                        <div className="text-purple-100">Total Assessment Value</div>
                    </div>

                    {/* Panel 4 */}
                    <div className="panel bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-md">
                        <div className="text-xl font-bold">{sums.totalArea.toLocaleString()} sqm</div>
                        <div className="text-orange-100">Total Area</div>
                    </div>

                    {/* Panel 5 */}
                    <div className="panel bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-lg shadow-md">
                        <div className="text-xl font-bold">{formatCurrency(sums.totalAssessmentValue*0.02)}</div>
                        <div className="text-pink-100">Tax Due 1% SEF + 1 % Basic</div>
                    </div>

                </div>
            </div>

                <div className="mb-6">
                <div className='flex gap-4 flex-wrap'>
                    <div className="flex flex-col min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Taxability Filter
                        </label>
                        <TaxableSwitch setTaxabilityFilter={setTaxabilityFilter} />
                    </div>
                    <div className="flex flex-col min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Subclass Filter
                        </label>
                        <SubclassSuggesstion setSubclassFilter={setSubclassFilter} />
                    </div>
                    <div className="flex flex-col min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            GR Filter
                        </label>
                        <GRFilter setGrFilter={setGrFilter} />
                    </div>
                </div>
          

            </div>

            <div className="panel md:w-[920px] xl:w-full">
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="flex items-center gap-5 ltr:ml-auto rtl:mr-auto">
                        <Dropdown
                            placement={isRtl ? 'bottom-end' : 'bottom-start'}
                            btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                            button={
                                <>
                                    <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                    <IconCaretDown className="w-5 h-5" />
                                </>
                            }
                        >
                            <ul className="!min-w-[140px] bg-white shadow-md rounded-md dark:bg-[#1b2e4b]">
                                {cols.map((col) => (
                                    <li key={col.accessor} onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center px-4 py-1">
                                            <label className="cursor-pointer mb-0">
                                                <input
                                                    type="checkbox"
                                                    checked={!hideCols.includes(col.accessor as keyof Assessment)}
                                                    className="form-checkbox"
                                                    onChange={() => toggleColumn(col.accessor as keyof Assessment)}
                                                />
                                                <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Dropdown>

                        <div>
                            <SuggesstionSearchInput setSearchColumn={setSearchColumn} />
                        </div>
                        <div className="text-right">
                            <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={recordsData}
                        columns={cols.filter(col => !hideCols.includes(col.accessor as keyof Assessment))}
                        highlightOnHover
                        totalRecords={finalData.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                        fetching={queryLoading}
                    />
                </div>

                {/* Rest of your modals remain the same */}
                <Modal
                    opened={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingRecord(null);
                    }}
                    title="Edit Assessment Record"
                    size="lg"
                >
                    {editingRecord && (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4" >
                                <div className="form-group">
                                    <label htmlFor="tdn">TDN</label>
                                    <input
                                        type="text"
                                        id="tdn"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.tdn}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="market_val">Market Value</label>
                                    <input
                                        type="number"
                                        id="market_val"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.market_val}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, market_val: parseFloat(e.target.value) }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ass_value">Assessment Value</label>
                                    <input
                                        type="number"
                                        id="ass_value"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.ass_value}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, ass_value: parseFloat(e.target.value) }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sub_class">Sub Class</label>
                                    <input
                                        type="text"
                                        id="sub_class"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.sub_class}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, sub_class: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="classification">Classification</label>
                                    <select
                                        id="classification"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.classification}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, classification: e.target.value }))}
                                    >
                                        <option value="RESIDENTIAL">Residential</option>
                                        <option value="AGRICULTURAL">Agricultural</option>
                                        <option value="COMMERCIAL">Commercial</option>
                                        <option value="INDUSTRIAL">Industrial</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="area">Area</label>
                                    <input
                                        type="number"
                                        id="area"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.area}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, area: parseFloat(e.target.value) }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="taxability">Taxability</label>
                                    <input
                                        type="text"
                                        id="taxability"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.taxability}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, taxability: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="gr_code">GR Code</label>
                                    <input
                                        type="text"
                                        id="gr_code"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.gr_code}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, gr_code: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="gr">GR</label>
                                    <input
                                        type="text"
                                        id="gr"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.gr}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, gr: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mun_code">Municipality Code</label>
                                    <input
                                        type="text"
                                        id="mun_code"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.mun_code}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, mun_code: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="municipality">Municipality</label>
                                    <input
                                        type="text"
                                        id="municipality"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.municipality}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, municipality: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="barangay_code">Barangay Code</label>
                                    <input
                                        type="text"
                                        id="barangay_code"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.barangay_code}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, barangay_code: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="barangay">Barangay</label>
                                    <input
                                        type="text"
                                        id="barangay"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.barangay}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, barangay: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="eff_date">Effective Date</label>
                                    <input
                                        type="date"
                                        id="eff_date"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.eff_date}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, eff_date: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingRecord(null);
                                    }}
                                    disabled={updateMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        <span>Save Changes</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>

                <Modal
                    opened={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingTdn(null);
                    }}
                    title="Delete Record"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeletingTdn(null);
                                }}
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Deleting...</span>
                                    </div>
                                ) : (
                                    <span>Delete</span>
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default BuildingAssessment;