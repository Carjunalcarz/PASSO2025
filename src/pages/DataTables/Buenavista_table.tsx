import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Dropdown from '../../components/Dropdown';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import axios from 'axios';

const Buenavista = () => {
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [rowData, setRowData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    const [recordsData, setRecordsData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [hideCols, setHideCols] = useState<string[]>([]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'tdn',
        direction: 'asc',
    });

    const cols = [
        { accessor: 'tdn', title: 'TDN' },
        { accessor: 'market_val', title: 'Market Value' },
        { accessor: 'ass_value', title: 'Assessment Value' },
        { accessor: 'sub_class', title: 'Sub Class' },
        { accessor: 'eff_date', title: 'Effective Date' },
        { accessor: 'classification', title: 'Classification' },
        { accessor: 'ass_level', title: 'Assessment Level' },
        { accessor: 'area', title: 'Area' },
        { accessor: 'taxability', title: 'Taxability' },
        { accessor: 'gr_code', title: 'GR Code' },
        { accessor: 'gr', title: 'GR' },
        { accessor: 'mun_code', title: 'Municipality Code' },
        { accessor: 'municipality', title: 'Municipality' },
        { accessor: 'barangay_code', title: 'Barangay Code' },
        { accessor: 'barangay', title: 'Barangay' },
    ];

    useEffect(() => {
        dispatch(setPageTitle('Buenavista'));
    }, [dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/assessments?municipality=buenavista&skip=0&limit=300000', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRowData(response.data.data);
                setInitialRecords(sortBy(response.data.data, 'tdn'));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData(initialRecords.slice(from, to));
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const filtered = rowData.filter((item) => cols.some((col) => (item[col.accessor] ?? '').toString().toLowerCase().includes(search.toLowerCase())));
        setInitialRecords(filtered);
        setPage(1);
    }, [search, rowData]);

    useEffect(() => {
        const sorted = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? sorted.reverse() : sorted);
    }, [sortStatus]);

    const toggleColumn = (col: string) => {
        setHideCols((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
    };

    return (
        <div className="panel">
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Beunavista Assessment Data-2025</h5>
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
                                                checked={!hideCols.includes(col.accessor)}
                                                className="form-checkbox"
                                                onChange={() => toggleColumn(col.accessor)}
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
                    columns={cols.map((col) => ({
                        accessor: col.accessor,
                        title: col.title,
                        sortable: true,
                        hidden: hideCols.includes(col.accessor),
                    }))}
                    highlightOnHover
                    totalRecords={initialRecords.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
        </div>
    );
};

export default Buenavista;
