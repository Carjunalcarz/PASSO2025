import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Dropdown from '../../components/Dropdown';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { databaseService, AssessmentDocument } from '../../services/databaseService';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import { Modal } from '@mantine/core';
import { toast } from 'react-toastify';
import SuggesstionSearchInput from './Components/SuggesstionSearchInput';
import TaxableSwitch from './Components/TaxableSwitch';
import GRFilter from './Components/GRFilter';
import { Link } from 'react-router-dom';
import SubclassSuggesstion from './Components/SubclassSuggesstion';
import CSVImport from './Components/CSVImport';
import IconUpload from '../../components/Icon/IconUpload';

// Use AssessmentDocument from databaseService
type Assessment = AssessmentDocument;

// Define column interface
interface Column {
    accessor: keyof AssessmentDocument | 'actions';
    title: string;
    sortable: boolean;
    render?: (record: AssessmentDocument) => React.ReactNode;
}

// Collection ID for ADN assessments from environment variables
const ADN_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROPERTY_ASSESSMENTS_COLLECTION_ID || 'property_assessments';

const formatCurrency = (amount: number) => {
    return `₱${new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)}`;
};

const ADNAssessment = () => {
    const [taxabilityFilter, setTaxabilityFilter] = useState('exempt');
    const [subclassFilter, setSubclassFilter] = useState<string>('all');
    const [grFilter, setGrFilter] = useState<string>('all');

    // Appwrite handles authentication automatically through the client
    const dispatch = useDispatch();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [searchColumn, setSearchColumn] = useState('tdn');
    const [hideCols, setHideCols] = useState<Array<keyof Assessment>>(['name', 'bcode', 'mun_code', 'gr_code', 'eff_date' ,'owner_no']);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'tdn',
        direction: 'asc',
    });

    const [editingRecord, setEditingRecord] = useState<Assessment | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingRecord, setDeletingRecord] = useState<Assessment | null>(null);
    const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
    const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
    const [clearProgress, setClearProgress] = useState<{ processed: number; total: number; deleted: number; failed: number } | null>(null);
    const [clearResult, setClearResult] = useState<{ deleted: number; failed: number; errors: string[] } | null>(null);
    const [clearConfirmText, setClearConfirmText] = useState('');

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
        { accessor: 'bcode', title: 'Barangay Code', sortable: true },
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
        dispatch(setPageTitle('ADN'));
    }, [dispatch]);

    const fetchAssessments = async (): Promise<Assessment[]> => {
        try {
            const assessments = await databaseService.getAssessments(ADN_COLLECTION_ID, 300000);
            return assessments;
        } catch (error) {
            console.error('Error fetching assessments from Appwrite:', error);
            throw error;
        }
    };

    const { data: rowData = [], isLoading: queryLoading, refetch } = useQuery<Assessment[]>({
        queryKey: ['assessments', 'adn'],
        queryFn: fetchAssessments,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    // const filteredData = rowData.filter((item: Assessment) => {
    //     const value = item[searchColumn.toLowerCase() as keyof Assessment];
    //     return (value?.toString() ?? '').toLowerCase().includes(search.toLowerCase());
    // });

    // First filter by search
    const searchFilteredData = rowData.filter((item: Assessment) => {
        const value = item[searchColumn.toLowerCase() as keyof Assessment];
        return (value?.toString() ?? '').toLowerCase().includes(search.toLowerCase());
    });

    // // Then filter by taxability
    // const filteredData = searchFilteredData.filter((item: Assessment) => {
    //     if (taxabilityFilter === 'all') return true;
    //     if (taxabilityFilter === 'taxable') return item.taxability === 'Taxable';
    //     if (taxabilityFilter === 'exempt') return item.taxability === 'Exempt';
    //     return true;
    // });


    // 2. Filter by taxability, subclass, and gr
    const filteredData = searchFilteredData.filter((item: Assessment) => {
        const matchesTaxability =
            taxabilityFilter === 'all' ||
            (taxabilityFilter === 'taxable' && item.taxability === 'Taxable') ||
            (taxabilityFilter === 'exempt' && item.taxability === 'Exempt');

        const matchesSubclass =
            subclassFilter === 'all' || item.sub_class?.toLowerCase() === subclassFilter.toLowerCase();

        const matchesGr =
            grFilter === 'all' || item.gr_code === grFilter;

        return matchesTaxability && matchesSubclass && matchesGr;
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

    const createMutation = useMutation<Assessment, Error, Partial<Assessment>>({
        mutationFn: async (newData) => {
            const data = newData as Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>;
            return await databaseService.createAssessment(ADN_COLLECTION_ID, data);
        },
        onSuccess: () => {
            toast.success('Record created successfully');
            refetch();
        },
        onError: (error) => {
            toast.error('Failed to create record: ' + error.message);
        },
    });

    const updateMutation = useMutation<
        Assessment,
        Error,
        Assessment,
        unknown
    >({
        mutationFn: async (data: Assessment) => {
            if (!data.$id) {
                throw new Error('Document ID is required for update');
            }
            return await databaseService.updateAssessment(ADN_COLLECTION_ID, data.$id, data);
        },
        onSuccess: () => {
            toast.success('Record updated successfully');
            setIsEditModalOpen(false);
            refetch();
        },
        onError: (error) => {
            toast.error('Failed to update record: ' + error.message);
        },
    });

    const deleteMutation = useMutation<
        void,
        Error,
        { tdn: string; documentId: string },
        unknown
    >({
        mutationFn: async ({ documentId }) => {
            await databaseService.deleteAssessment(ADN_COLLECTION_ID, documentId);
        },
        onSuccess: () => {
            toast.success('Record deleted successfully');
            refetch();
        },
        onError: (error) => {
            toast.error('Failed to delete record: ' + error.message);
        },
    });

    const clearAllMutation = useMutation<
        { deleted: number; failed: number; errors: string[] },
        Error,
        void,
        unknown
    >({
        mutationFn: async () => {
            return await databaseService.clearAllAssessments(
                ADN_COLLECTION_ID,
                (progress) => {
                    setClearProgress(progress);
                }
            );
        },
        onSuccess: (result) => {
            setClearResult(result);
            toast.success(`Successfully cleared ${result.deleted} records from the table`);
            if (result.failed > 0) {
                toast.warning(`${result.failed} records failed to delete. You can retry the failed deletions.`);
            } else {
                // Only close modal if all succeeded
                setTimeout(() => {
                    setIsClearAllModalOpen(false);
                    setClearResult(null);
                }, 2000);
            }
            setClearProgress(null);
            refetch();
        },
        onError: (error) => {
            toast.error('Failed to clear table: ' + error.message);
            setClearProgress(null);
            setIsClearAllModalOpen(false);
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
        // Find the record by TDN to get the document ID
        const record = rowData.find(item => item.tdn === tdn);
        if (record) {
            setDeletingRecord(record);
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDelete = () => {
        if (deletingRecord && deletingRecord.$id) {
            deleteMutation.mutate({ 
                tdn: deletingRecord.tdn, 
                documentId: deletingRecord.$id 
            });
            setIsDeleteModalOpen(false);
            setDeletingRecord(null);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRecord) {
            updateMutation.mutate(editingRecord);
        }
    };

    const handleClearAll = () => {
        setClearConfirmText('');
        setClearResult(null);
        setIsClearAllModalOpen(true);
    };

    const confirmClearAll = () => {
        clearAllMutation.mutate();
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
                    <span>Province of Agusan del Norte Assessment Data-2025</span>
                </li>
            </ul>

            {/* Summary Cards */}
            <div className="overflow-x-auto scrollbar-hidden scrollbar-hover">
                <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-4 mb-6 w-max min-w-full">
                    {/* Panel 1 */}
                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col items-start gap-2">
                                <img src="/mun_logo/pgan.webp" alt="ADN Logo" className="w-20 h-20 rounded-sm" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-3xl font-bold">{sums.recordCount.toLocaleString()}</div>
                                <div className="text-blue-100">Total RPU Records</div>
                            </div>
                        </div>
                        <p className="text-left text-xl m-2">Province of Agusan del Norte</p>
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


            {/* Filter Section with Labels */}
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
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCSVImportOpen(true)}
                            className="btn btn-primary gap-2"
                        >
                            <IconUpload className="w-4 h-4" />
                            Import CSV
                        </button>
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="btn btn-danger gap-2"
                            disabled={rowData.length === 0}
                        >
                            <IconTrashLines className="w-4 h-4" />
                            Clear All
                        </button>
                    </div>
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
                                    <label htmlFor="bcode">Barangay Code</label>
                                    <input
                                        type="text"
                                        id="bcode"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.bcode}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, bcode: e.target.value }))}
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
                        setDeletingRecord(null);
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
                                    setDeletingRecord(null);
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

                {/* Clear All Confirmation Modal */}
                <Modal
                    opened={isClearAllModalOpen}
                    onClose={() => {
                        if (!clearAllMutation.isPending) {
                            setIsClearAllModalOpen(false);
                            setClearProgress(null);
                            setClearResult(null);
                            setClearConfirmText('');
                        }
                    }}
                    title="Clear All Records"
                    size="md"
                    closeOnClickOutside={!clearAllMutation.isPending}
                    closeOnEscape={!clearAllMutation.isPending}
                >
                    <div className="space-y-4">
                        {clearResult ? (
                            <div className="text-center py-6">
                                <div className="mb-4">
                                    {clearResult.failed === 0 ? (
                                        <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {clearResult.failed === 0 ? 'All Records Cleared Successfully!' : 'Clear Operation Completed with Issues'}
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-green-600 dark:text-green-400">
                                        ✅ Successfully deleted: {clearResult.deleted} records
                                    </p>
                                    {clearResult.failed > 0 && (
                                        <>
                                            <p className="text-red-600 dark:text-red-400">
                                                ❌ Failed to delete: {clearResult.failed} records
                                            </p>
                                            {clearResult.errors.length > 0 && (
                                                <details className="mt-3">
                                                    <summary className="cursor-pointer text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                                                        View Error Details ({clearResult.errors.length} errors)
                                                    </summary>
                                                    <div className="mt-2 max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs">
                                                        {clearResult.errors.slice(0, 10).map((error, index) => (
                                                            <div key={index} className="mb-1 text-red-600 dark:text-red-400 font-mono">
                                                                {error}
                                                            </div>
                                                        ))}
                                                        {clearResult.errors.length > 10 && (
                                                            <div className="text-gray-500 italic">
                                                                ... and {clearResult.errors.length - 10} more errors
                                                            </div>
                                                        )}
                                                    </div>
                                                </details>
                                            )}
                                        </>
                                    )}
                                </div>
                                
                                <div className="flex justify-center gap-3 mt-6">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setIsClearAllModalOpen(false);
                                            setClearResult(null);
                                            setClearConfirmText('');
                                        }}
                                    >
                                        Close
                                    </button>
                                    {clearResult.failed > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-warning gap-2"
                                            onClick={() => {
                                                setClearResult(null);
                                                clearAllMutation.mutate();
                                            }}
                                            disabled={clearAllMutation.isPending}
                                        >
                                            <IconTrashLines className="w-4 h-4" />
                                            Retry Failed Deletions
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : !clearAllMutation.isPending && !clearProgress ? (
                            <>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <IconTrashLines className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                                                Warning: This action cannot be undone!
                                            </h3>
                                            <p className="text-red-700 dark:text-red-300 text-sm">
                                                You are about to permanently delete <strong>{rowData.length.toLocaleString()}</strong> records from the ADN Assessment table. 
                                                This will remove all property assessment data and cannot be recovered.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Please type <strong>"CLEAR ALL"</strong> to confirm this action:
                                </p>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Type CLEAR ALL to confirm"
                                    value={clearConfirmText}
                                    onChange={(e) => setClearConfirmText(e.target.value)}
                                />
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="mb-4">
                                    <svg className="animate-spin h-8 w-8 mx-auto text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Clearing All Records...</h3>
                                {clearProgress && (
                                    <div className="space-y-2">
                                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${(clearProgress.processed / clearProgress.total) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Processed: {clearProgress.processed} / {clearProgress.total}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Deleted: {clearProgress.deleted}
                                        </p>
                                        {clearProgress.failed > 0 && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                Failed: {clearProgress.failed}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mt-4">
                                    Please wait while we delete all records...
                                </p>
                            </div>
                        )}
                        
                        {!clearAllMutation.isPending && !clearProgress && (
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setIsClearAllModalOpen(false);
                                        setClearProgress(null);
                                        setClearConfirmText('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmClearAll}
                                    disabled={clearConfirmText !== 'CLEAR ALL'}
                                >
                                    Clear All Records
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>

                {/* CSV Import Modal */}
                <CSVImport
                    isOpen={isCSVImportOpen}
                    onClose={() => setIsCSVImportOpen(false)}
                    onImportComplete={() => {
                        refetch(); // Refresh the data after import
                    }}
                    collectionId={ADN_COLLECTION_ID}
                />
            </div>
        </div >
    );
};

export default ADNAssessment;