import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Dropdown from '../../components/Dropdown';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import axios from 'axios';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';
import { Modal } from '@mantine/core';
import { toast } from 'react-toastify';
import SuggesstionSearchInput from './Components/SuggesstionSearchInput';
import TaxableSwitch from './Components/TaxableSwitch';
import { Link } from 'react-router-dom';
import SubclassSuggesstion from './Components/SubclassSuggesstion';
import GRFilter from './Components/GRFilter';
import UnitCostCategoryFilter from './Components/UnitCostCategoryFilter';
import AddUnitCost from './Components/AddUnitCost';
import UnitColSearchWithSuggestions from './Components/UnitColSearch';
import UnitValueChart from './Components/UnitValueChart';

// Define column interface
interface Column {
    accessor: keyof Assessment | 'actions';
    title: string;
    sortable: boolean;
    render?: (record: Assessment) => React.ReactNode;
}

// Define the Assessment interface (renamed from AssessmentData for consistency)
interface Assessment {
    id: string;
    struct_class_type: string;
    category: string;
    smv_year: string;
    smv_code: string;
    smv_name: string;
    date_input: string;
    inputed_by: string;
    increase : number;
    remarks : string;
    unit_cost : number;
}

const formatCurrency = (amount: number) => {
    return `₱${new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)}`;
};

const UnitValue = () => {
    const [taxabilityFilter, setTaxabilityFilter] = useState('exempt'); // Add this line
    const [subclassFilter, setSubclassFilter] = useState<string>('all');
    const [grFilter, setGrFilter] = useState<string>('all');
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [searchColumn, setSearchColumn] = useState('tdn');
    const [hideCols, setHideCols] = useState<Array<keyof Assessment>>(['date_input', 'inputed_by' , 'increase' , 'remarks']);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'tdn',
        direction: 'asc',
    });

    const [editingRecord, setEditingRecord] = useState<Assessment | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [unitCostCategoryFilter, setUnitCostCategoryFilter] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const cols: Column[] = [
        { accessor: 'id', title: 'id', sortable: true },
        { accessor: 'struct_class_type', title: 'Structural Class Type', sortable: true },
        { accessor: 'category', title: 'Category', sortable: true },
        { accessor: 'smv_year', title: 'SMV Year', sortable: true },
        { accessor: 'smv_code', title: 'SMV Code', sortable: true },
        { accessor: 'smv_name', title: 'SMV Name', sortable: true },
        { accessor: 'unit_cost', title: 'Unit Cost', sortable: true },
        { accessor: 'date_input', title: 'Date Input', sortable: true },
        { accessor: 'inputed_by', title: 'Input By', sortable: true },
        { accessor: 'increase', title: 'Increase', sortable: true },
        { accessor: 'remarks', title: 'Remarks', sortable: true },
      

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
                        onClick={() => handleDelete(record.id)}
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
        dispatch(setPageTitle('Unit Value'));
    }, [dispatch]);

    const fetchUnitValue = async (): Promise<Assessment[]> => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/unit-costs?skip=0&limit=300000`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

     

     
        return response.data.data;
    };

    const { data: rowData = [], isLoading: queryLoading, refetch } = useQuery<Assessment[]>({
        queryKey: ['unit_value', 'unit_value'],
        queryFn: fetchUnitValue,
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


    // 2. Filter by taxability and subclass
    const filteredData = searchFilteredData.filter((item: Assessment) => {
        const matchesCategory =
            unitCostCategoryFilter === 'all' ||
            (unitCostCategoryFilter === 'residential' && item.category === 'Residential') ||
            (unitCostCategoryFilter === 'commercial' && item.category === 'Commercial') ||
            (unitCostCategoryFilter === 'industrial' && item.category === 'Industrial') ||
            (unitCostCategoryFilter === 'building' && item.category === 'Building');
         

       

        return matchesCategory;
    });





    const sortedData = sortBy(filteredData, (item) => {
      
                return item[sortStatus.columnAccessor as keyof Assessment];
        
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
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
    };

    const calculateSums = () => {

        const totalIncrease = filteredData.reduce((sum, record) => sum + (record.increase || 0), 0);
        const totalRemarks = filteredData.length; // Count of records with remarks
        const totalSMVName = filteredData.length; // Count of records with smv_name

        // Only count unique TDNs for recordCount
        const uniqueTdnCount = getUniqueByTdn(filteredData).length;

        return {
            totalIncrease,
            totalRemarks,
            totalSMVName,
            recordCount: uniqueTdnCount
        };
    };



    const sums = calculateSums();

    const toggleColumn = (col: keyof Assessment) => {
        setHideCols((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
    };

    const createMutation = useMutation<Assessment, Error, Partial<Assessment>>({
        mutationFn: (newData) =>
            axios.post('your-endpoint', newData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }).then(response => response.data),
        onSuccess: () => {
            refetch();
        },
    });

    const updateMutation = useMutation<
        any,
        Error,
        Assessment,
        unknown
    >({
        mutationFn: async (data: Assessment) => {
            const response = await axios.put(`${import.meta.env.VITE_API_URL_FASTAPI}/unit-cost/${data.id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
           
            return response.data;
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
        any,
        Error,
        string,
        unknown
    >({
        mutationFn: async (id: string) => {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL_FASTAPI}/unit-cost/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Record deleted successfully');
            refetch();
        },
        onError: (error) => {
            toast.error('Failed to delete record: ' + error.message);
        },
    });

    const handleCreate = (data: Partial<Assessment>) => {
        createMutation.mutate(data);
    };

    const handleUpdate = (record: Assessment) => {
        setEditingRecord(record);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingId) {
            deleteMutation.mutate(deletingId);
            setIsDeleteModalOpen(false);
            setDeletingId(null);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRecord) {
            updateMutation.mutate(editingRecord);
        }
    };

    // First, add this utility function at the top of your file after the imports
    const exportToCSV = (data: Assessment[], fileName: string) => {
        // Group data by category and ensure proper categorization
        const groupedData = data.reduce((acc: { [key: string]: Assessment[] }, item) => {
            // Ensure category is properly set, defaulting to 'Other' if undefined
            const category = item.category?.trim() || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});

        const headers = [
            'ID',
            'Structural Class Type',
            'Category',
            'SMV Year',
            'SMV Code',
            'SMV Name',
            'Unit Cost',
            'Date Input',
            'Input By',
            'Increase',
            'Remarks'
        ];

        let csvContent = [
            ['Unit Value Report'],
            [''],
            [`Generated on: ${new Date().toLocaleDateString()}`],
            [''],
        ];

        // Sort categories to ensure consistent order
        const sortedCategories = Object.keys(groupedData).sort((a, b) => {
            const order = ['Building', 'Industrial', 'Commercial', 'Residential', 'Other'];
            return order.indexOf(a) - order.indexOf(b);
        });

        // Add data by category
        sortedCategories.forEach(category => {
            const items = groupedData[category];
            if (items && items.length > 0) {
                // Add category header
                csvContent.push([`${category} Category`]);
                csvContent.push(headers);

                // Sort items within category by struct_class_type
                const sortedItems = items.sort((a, b) => 
                    (a.struct_class_type || '').localeCompare(b.struct_class_type || '')
                );

                // Add items for this category
                sortedItems.forEach(item => {
                    csvContent.push([
                        item.struct_class_type || '',
                        item.category || '',
                        item.smv_year || '',
                        item.smv_code || '',
                        item.smv_name || '',
                        (item.unit_cost || 0).toString(),
                        item.date_input || '',
                        item.inputed_by || '',
                        (item.increase || 0).toString(),
                        item.remarks || ''
                    ]);
                });

                // Add empty row between categories
                csvContent.push(['']);
            }
        });

        // Convert to CSV string with proper handling of special characters
        const csvString = csvContent
            .map(row => row.map(cell => {
                if (cell === null || cell === undefined) return '';
                const stringCell = cell.toString();
                if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
                    return `"${stringCell.replace(/"/g, '""')}"`;
                }
                return stringCell;
            }).join(','))
            .join('\n');

        // Create and download file
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                    <span>SMV Unit Value</span>
                </li>
            </ul>

             {/* Summary Cards */}
             <UnitValueChart unitCostCategoryFilter={unitCostCategoryFilter} />
            
                <div className="mb-6">
                <div className='flex gap-4 flex-wrap'>
                    <div className="flex flex-col min-w-[200px]">
                       
                        <UnitCostCategoryFilter setUnitCostCategoryFilter={setUnitCostCategoryFilter} />
                    </div>
                </div>
          

            </div>

            <div className="panel md:w-[920px] xl:w-full">
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <div className="flex items-center gap-5 ltr:ml-auto rtl:mr-auto">
                        {/* Add New Unit Cost Button */}
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Unit Cost
                        </button>

                        {/* Add this button before your existing buttons */}
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => exportToCSV(filteredData, 'unit-value-report')}
                        >
                            <svg 
                                className="w-4 h-4 mr-2" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                />
                            </svg>
                            Export to CSV
                        </button>

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
                            <UnitColSearchWithSuggestions setSearchColumn={setSearchColumn} />
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
                                    <label htmlFor="id">ID</label>
                                    <input
                                        type="text"
                                        id="id"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.id}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="increase">Increase</label>
                                    <input
                                        type="number"
                                        id="increase"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.increase}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, increase: parseFloat(e.target.value) }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="remarks">Remarks</label>
                                    <input
                                        type="text"
                                        id="remarks"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.remarks}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, remarks: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="smv_name">SMV Name</label>
                                    <input
                                        type="text"
                                        id="smv_name"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.smv_name}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, smv_name: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <select
                                        id="category"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.category}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, category: e.target.value }))}
                                    >
                                        <option value="Residential">Residential</option>
                                        <option value="Agricultural">Agricultural</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Industrial">Industrial</option>
                                        <option value="Building">Building</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="smv_code">SMV Code</label>
                                    <input
                                        type="text"
                                        id="smv_code"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.smv_code}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, smv_code: e.target.value }))}
                                    />
                                </div>
                            
                                <div className="form-group">
                                        <label htmlFor="smv_year">SMV Year</label>
                                    <input
                                        type="text"
                                        id="smv_year"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.smv_year}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, smv_year: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="unit_cost">Unit Cost</label>
                                    <input
                                        type="number"
                                        id="unit_cost"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.unit_cost}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, unit_cost: parseFloat(e.target.value) }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inputed_by">Inputed By</label>
                                    <input
                                        type="text"
                                        id="inputed_by"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.inputed_by}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, inputed_by: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="date_input">Date Input</label>
                                    <input
                                        type="text"
                                        id="date_input"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.date_input}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, date_input: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="struct_class_type">Structural Class Type</label>
                                    <input
                                        type="text"
                                        id="struct_class_type"
                                        className="form-input dark:bg-white text-black"
                                        value={editingRecord.struct_class_type}
                                        onChange={(e) => setEditingRecord(prev => ({ ...prev!, struct_class_type: e.target.value }))}
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
                        setDeletingId(null);
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
                                    setDeletingId(null);
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

                {/* Add Unit Cost Modal */}
                <AddUnitCost
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        refetch();
                    }}
                />
            </div>
        </div>
    );
};

export default UnitValue;