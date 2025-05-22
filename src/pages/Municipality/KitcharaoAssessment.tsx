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

// Define column interface
interface Column {
    accessor: keyof Assessment | 'actions';
    title: string;
    sortable: boolean;
    render?: (record: Assessment) => React.ReactNode;
}

// Define the Assessment interface (renamed from AssessmentData for consistency)
interface Assessment {
    tdn: string;
    market_val: number;
    ass_value: number;
    sub_class: string;
    eff_date: string;
    classification: string;
    ass_level: string;
    area: number;
    taxability: string;
    gr_code: string;
    gr: string;
    mun_code: string;
    municipality: string;
    barangay_code: string;
    barangay: string;
}

const formatCurrency = (amount: number) => {
    return `₱${new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)}`;
};

const KitcharaoAssessment = () => {
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [hideCols, setHideCols] = useState<Array<keyof Assessment>>(['barangay_code', 'mun_code', 'gr_code', 'eff_date']);
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
        {
            accessor: 'market_val',
            title: 'Market Value',
            render: (record: Assessment) => <div>{formatCurrency(record.market_val)}</div>,
            sortable: true
        },
        {
            accessor: 'ass_value',
            title: 'Assessment Value',
            render: (record: Assessment) => <div>{formatCurrency(record.ass_value)}</div>,
            sortable: true
        },

        { accessor: 'eff_date', title: 'Effective Date', sortable: true },
        { accessor: 'classification', title: 'Classification', sortable: true },
        { accessor: 'sub_class', title: 'Sub Class', sortable: true },
        { accessor: 'ass_level', title: 'Assessment Level', sortable: true },
        { accessor: 'area', title: 'Area', sortable: true },
        { accessor: 'taxability', title: 'Taxability', sortable: true },
        { accessor: 'gr_code', title: 'GR Code', sortable: true },
        { accessor: 'gr', title: 'Transaction Code', sortable: true },
        { accessor: 'mun_code', title: 'Municipality Code', sortable: true },
        { accessor: 'municipality', title: 'Municipality', sortable: true },
        { accessor: 'barangay_code', title: 'Barangay Code', sortable: true },
        { accessor: 'barangay', title: 'Barangay', sortable: true },
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
        }
    ];

    useEffect(() => {
        dispatch(setPageTitle('Kitcharao'));
    }, [dispatch]);

    const fetchAssessments = async (): Promise<Assessment[]> => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments?municipality=kitcharao&skip=0&limit=300000`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    };

    const { data: rowData = [], isLoading: queryLoading, refetch } = useQuery<Assessment[]>({
        queryKey: ['assessments', 'kitcharao'],
        queryFn: fetchAssessments,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    const filteredData = rowData.filter((item: Assessment) =>
        cols.some((col) => {
            if (col.accessor === 'actions') return false;
            const value = item[col.accessor as keyof Assessment];
            return (value?.toString() ?? '').toLowerCase().includes(search.toLowerCase());
        })
    );

    const sortedData = sortBy(filteredData, sortStatus.columnAccessor);
    const finalData = sortStatus.direction === 'desc' ? sortedData.reverse() : sortedData;

    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const recordsData = finalData.slice(from, to);

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
            const response = await axios.put(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/${data.tdn}`, data, {
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
        mutationFn: async (tdn: string) => {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/${tdn}`, {
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

    const handleDelete = (tdn: string) => {
        setDeletingTdn(tdn);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingTdn) {
            deleteMutation.mutate(deletingTdn);
            setIsDeleteModalOpen(false);
            setDeletingTdn(null);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRecord) {
            updateMutation.mutate(editingRecord);
        }
    };

    return (
        <div className="panel md:w-[920px] xl:w-full">
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Kitcharao Assessment Data-2025</h5>
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
                    fetching={false}
                />
            </div>
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
    );
};

export default KitcharaoAssessment;
