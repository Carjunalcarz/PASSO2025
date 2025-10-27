import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';

interface MainTableProps {
  data?: any[];
  columns?: any[];
}

const MainTable = ({ data = [], columns = [] }: MainTableProps) => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState<any[]>([]);
  const [recordsData, setRecordsData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Default columns if none provided
  const defaultColumns = [
    {
      accessor: 'id',
      title: 'ID',
      sortable: true,
    },
    {
      accessor: 'name',
      title: 'Name',
      sortable: true,
    },
    {
      accessor: 'email',
      title: 'Email',
      sortable: true,
    },
    {
      accessor: 'status',
      title: 'Status',
      sortable: true,
      render: ({ status }: any) => (
        <span className={`badge ${status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
          {status}
        </span>
      ),
    },
    {
      accessor: 'actions',
      title: 'Actions',
      titleClassName: '!text-center',
      render: ({ id }: any) => (
        <div className="flex items-center justify-center gap-2">
          <button type="button" className="btn btn-sm btn-outline-primary">
            <IconEye />
          </button>
          <button type="button" className="btn btn-sm btn-outline-warning">
            <IconEdit />
          </button>
          <button type="button" className="btn btn-sm btn-outline-danger">
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  // Default data if none provided
  const defaultData = [
    { id: 1, name: 'Sample User 1', email: 'user1@example.com', status: 'active' },
    { id: 2, name: 'Sample User 2', email: 'user2@example.com', status: 'inactive' },
    { id: 3, name: 'Sample User 3', email: 'user3@example.com', status: 'active' },
  ];

  const tableData = data.length > 0 ? data : defaultData;
  const tableColumns = columns.length > 0 ? columns : defaultColumns;

  useEffect(() => {
    setInitialRecords(tableData);
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    if (!search) {
      setInitialRecords(tableData);
    } else {
      setInitialRecords(
        tableData.filter((item: any) => {
          return Object.keys(item).some((key) => {
            return String(item[key]).toLowerCase().includes(search.toLowerCase());
          });
        })
      );
    }
  }, [search]);

  return (
    <div className="panel">
      <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
        <h5 className="font-semibold text-lg dark:text-white-light">Dashboard Settings Table</h5>
        <div className="ltr:ml-auto rtl:mr-auto">
          <input
            type="text"
            className="form-input w-auto"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="datatables">
        <DataTable
          className="whitespace-nowrap table-hover"
          records={recordsData}
          columns={tableColumns}
          totalRecords={initialRecords.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          minHeight={200}
          paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
        />
      </div>
    </div>
  );
};

export default MainTable;
