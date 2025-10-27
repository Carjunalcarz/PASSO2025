import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import {
  getAllBuildingPartRates,
  createBuildingPartRate,
  updateBuildingPartRate,
  deleteBuildingPartRate,
  BuildingPartRateResponse,
} from '../services/buildingPartRate';
import {
  getAllBuildingParts,
  BuildingPartResponse,
} from '../services/buildingPart';

interface BuildingPartsRateData {
  $id?: string;
  unit_value: number;
  status: string;
  building_parts_id: string;
  $createdAt?: string;
  $updatedAt?: string;
}

const BuildingPartsRate = () => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState<BuildingPartsRateData[]>([]);
  const [recordsData, setRecordsData] = useState<BuildingPartsRateData[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BuildingPartsRateData[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buildingParts, setBuildingParts] = useState<BuildingPartResponse[]>([]);
  const [formData, setFormData] = useState<Partial<BuildingPartsRateData>>({
    unit_value: 0,
    status: 'active',
    building_parts_id: '',
  });

  // Fetch building parts for dropdown
  const fetchBuildingParts = async () => {
    try {
      const response = await getAllBuildingParts();
      if (response.success && response.data) {
        setBuildingParts(response.data);
      }
    } catch (error) {
      console.error('Error fetching building parts:', error);
    }
  };

  // Fetch data from Appwrite
  const fetchBuildingPartRates = async () => {
    setLoading(true);
    try {
      const response = await getAllBuildingPartRates();
      if (response.success && response.data) {
        setInitialRecords(response.data as BuildingPartsRateData[]);
      } else {
        Swal.fire('Error', response.error || 'Failed to fetch building part rates', 'error');
      }
    } catch (error) {
      console.error('Error fetching building part rates:', error);
      Swal.fire('Error', 'An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get building part name by ID
  const getBuildingPartName = (partId: string) => {
    const part = buildingParts.find(p => p.$id === partId);
    return part ? part.name : partId;
  };

  const columns = [
    { 
      accessor: 'building_parts_id', 
      title: 'Building Part', 
      sortable: true,
      render: ({ building_parts_id }: BuildingPartsRateData) => (
        <span>{getBuildingPartName(building_parts_id)}</span>
      ),
    },
    {
      accessor: 'unit_value',
      title: 'Unit Value (₱)',
      sortable: true,
      render: ({ unit_value }: BuildingPartsRateData) => <span>₱{unit_value.toFixed(2)}</span>,
    },
    {
      accessor: 'status',
      title: 'Status',
      sortable: true,
      render: ({ status }: BuildingPartsRateData) => (
        <span className={`badge ${status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>{status}</span>
      ),
    },
    {
      accessor: 'actions',
      title: 'Actions',
      titleClassName: '!text-center',
      render: (record: BuildingPartsRateData) => (
        <div className="flex items-center justify-center gap-2">
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleView(record)}><IconEye /></button>
          <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(record)}><IconEdit /></button>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(record.$id!)}><IconTrash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => { 
    fetchBuildingParts();
    fetchBuildingPartRates(); 
  }, []);
  
  useEffect(() => { 
    setPage(1); 
  }, [pageSize, search]);

  useEffect(() => {
    if (!search) {
      setFilteredRecords(initialRecords);
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      setRecordsData(initialRecords.slice(from, to));
    } else {
      const filtered = initialRecords.filter((item) => {
        const partName = getBuildingPartName(item.building_parts_id).toLowerCase();
        const searchLower = search.toLowerCase();
        return (
          partName.includes(searchLower) ||
          item.unit_value.toString().includes(searchLower) ||
          item.status.toLowerCase().includes(searchLower)
        );
      });
      setFilteredRecords(filtered);
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      setRecordsData(filtered.slice(from, to));
    }
  }, [search, initialRecords, page, pageSize, buildingParts]);

  const handleAdd = () => { setIsEdit(false); setFormData({ unit_value: 0, status: 'active', building_parts_id: '' }); setShowModal(true); };
  const handleEdit = (record: BuildingPartsRateData) => { setIsEdit(true); setFormData(record); setShowModal(true); };
  const handleView = (record: BuildingPartsRateData) => {
    Swal.fire({
      title: '<strong style="color: #4361ee;">Building Parts Rate Details</strong>',
      html: `
        <div class="overflow-x-auto" style="margin-top: 20px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <tbody>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; width: 40%;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    Building Part
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #111827; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${getBuildingPartName(record.building_parts_id)}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Unit Value
                  </span>
                </td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-size: 18px; font-weight: 700; color: #059669;">₱${record.unit_value.toFixed(2)}</span>
                </td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Status
                  </span>
                </td>
                <td style="padding: 14px 16px;">
                  <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; ${record.status === 'active' ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'}">${record.status.toUpperCase()}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      width: '600px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'swal2-rounded',
        title: 'swal2-title-custom'
      }
    });
  };
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setLoading(true);
      const response = await deleteBuildingPartRate(id);
      if (response.success) {
        Swal.fire('Deleted!', 'Rate has been deleted.', 'success');
        fetchBuildingPartRates();
      } else {
        Swal.fire('Error', response.error || 'Failed to delete rate', 'error');
      }
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isEdit && formData.$id) {
      const response = await updateBuildingPartRate(formData.$id, {
        unit_value: formData.unit_value,
        status: formData.status,
        building_parts_id: formData.building_parts_id,
      });
      if (response.success) {
        Swal.fire('Updated!', 'Rate has been updated.', 'success');
        fetchBuildingPartRates();
        setShowModal(false);
      } else {
        Swal.fire('Error', response.error || 'Failed to update rate', 'error');
      }
    } else {
      const response = await createBuildingPartRate({
        unit_value: formData.unit_value!,
        status: formData.status!,
        building_parts_id: formData.building_parts_id!,
      });
      if (response.success) {
        Swal.fire('Created!', 'Rate has been created.', 'success');
        fetchBuildingPartRates();
        setShowModal(false);
      } else {
        Swal.fire('Error', response.error || 'Failed to create rate', 'error');
      }
    }
    setLoading(false);
  };

  return (
    <div className="panel">
      <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
        <h5 className="font-semibold text-lg dark:text-white-light">Building Parts Rate</h5>
        <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
          <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={handleAdd}><IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />Add New</button>
        </div>
      </div>
      <div className="datatables">
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataTable className="whitespace-nowrap table-hover" records={recordsData} columns={columns} totalRecords={filteredRecords.length} recordsPerPage={pageSize} page={page} onPageChange={(p) => setPage(p)} recordsPerPageOptions={PAGE_SIZES} onRecordsPerPageChange={setPageSize} minHeight={200} paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`} />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[75vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-primary px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Building Parts Rate</h3>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-1 max-h-[calc(75vh-140px)] overflow-y-auto">
                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                  <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Building Part:</label>
                  <select 
                    className="form-select flex-1" 
                    value={formData.building_parts_id} 
                    onChange={(e) => setFormData({ ...formData, building_parts_id: e.target.value })} 
                    required
                  >
                    <option value="">Select Building Part</option>
                    {buildingParts
                      .filter((part) => part.status === 'active')
                      .map((part) => (
                        <option key={part.$id} value={part.$id}>
                          {part.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded"><label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Unit Value (₱):</label><input type="number" step="0.01" className="form-input flex-1" placeholder="0.00" value={formData.unit_value} onChange={(e) => setFormData({ ...formData, unit_value: parseFloat(e.target.value) })} required /></div>
                <div className="flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded"><label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Status:</label><select className="form-select flex-1" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button type="button" className="btn btn-outline-danger" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEdit ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingPartsRate;
