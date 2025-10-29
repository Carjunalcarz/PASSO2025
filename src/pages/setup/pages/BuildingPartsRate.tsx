import { DataTable } from 'mantine-datatable';
import { useEffect, useState, useMemo } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { BuildingPartRateResponse } from '../services/buildingPartRate';
import { BuildingPartResponse } from '../services/buildingPart';
import {
  useGetAllBuildingPartRates,
  useCreateBuildingPartRate,
  useUpdateBuildingPartRate,
  useDeleteBuildingPartRate,
} from '../hooks/useBuildingPartRates';
import { useGetAllBuildingParts } from '../hooks/useBuildingParts';

interface BuildingPartsRateData {
  $id?: string;
  unit_value: number;
  status: string;
  building_parts_id: string;
  $createdAt?: string;
  $updatedAt?: string;
}

const BuildingPartsRate = () => {
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Partial<BuildingPartsRateData>>({
    unit_value: 0,
    status: 'active',
    building_parts_id: '',
  });

  // TanStack Query hooks
  const { data: buildingPartRates = [], isLoading: isLoadingRates, isError: isRatesError, error: ratesError } = useGetAllBuildingPartRates();
  const { data: buildingParts = [], isLoading: isLoadingParts } = useGetAllBuildingParts();
  const createMutation = useCreateBuildingPartRate();
  const updateMutation = useUpdateBuildingPartRate();
  const deleteMutation = useDeleteBuildingPartRate();

  const isLoading = isLoadingRates || isLoadingParts;

  // Show error toast if query fails
  useEffect(() => {
    if (isRatesError) {
      Swal.fire('Error', ratesError?.message || 'Failed to fetch building part rates', 'error');
    }
  }, [isRatesError, ratesError]);

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

  // Filter and paginate data
  const filteredRecords = useMemo(() => {
    if (!search) return buildingPartRates;
    
    return buildingPartRates.filter((item) => {
      const partName = getBuildingPartName(item.building_parts_id).toLowerCase();
      const searchLower = search.toLowerCase();
      return (
        partName.includes(searchLower) ||
        item.unit_value.toString().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower)
      );
    });
  }, [buildingPartRates, search, buildingParts]);

  const recordsData = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return filteredRecords.slice(from, to);
  }, [filteredRecords, page, pageSize]);

  useEffect(() => { 
    setPage(1); 
  }, [pageSize, search]);

  const handleAdd = () => { setIsEdit(false); setFormData({ unit_value: 0, status: 'active', building_parts_id: '' }); setShowModal(true); };
  const handleEdit = (record: BuildingPartsRateData) => { setIsEdit(true); setFormData(record); setShowModal(true); };
  const handleView = (record: BuildingPartsRateData) => {
    const bgPrimary = isDark ? 'linear-gradient(to right, #1f2937, #111827)' : 'linear-gradient(to right, #f9fafb, #ffffff)';
    const bgSecondary = isDark ? '#111827' : '#ffffff';
    const borderColor = isDark ? '#374151' : '#e5e7eb';
    const labelColor = isDark ? '#9ca3af' : '#374151';
    const valueColor = isDark ? '#d1d5db' : '#111827';
    const popupBg = isDark ? '#1f2937' : '#ffffff';
    const iconColor = isDark ? '#9ca3af' : '#6b7280';
    
    Swal.fire({
      title: `<strong style="color: ${isDark ? '#60a5fa' : '#4361ee'};">Building Parts Rate Details</strong>`,
      html: `
        <div class="overflow-x-auto" style="margin-top: 20px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${borderColor}; border-radius: 8px; overflow: hidden;">
            <tbody>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor}; width: 40%;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    Building Part
                  </span>
                </td>
                <td style="padding: 14px 16px; color: ${valueColor}; border-bottom: 1px solid ${borderColor}; font-weight: 500;">${getBuildingPartName(record.building_parts_id)}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Unit Value
                  </span>
                </td>
                <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor};">
                  <span style="font-size: 18px; font-weight: 700; color: #059669;">₱${record.unit_value.toFixed(2)}</span>
                </td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor};">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      background: popupBg,
      customClass: {
        popup: 'swal2-rounded',
        title: 'swal2-title-custom',
        closeButton: isDark ? 'swal2-close-dark' : ''
      }
    });
  };
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '<span style="color: #dc2626; font-size: 20px; font-weight: 600;">Delete Building Part Rate?</span>',
      html: `
        <div style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; margin-bottom: 16px;">
            <svg style="width: 32px; height: 32px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">This action cannot be undone. The rate will be permanently removed.</p>
        </div>
      `,
      icon: undefined,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<span style="font-weight: 500;">Delete</span>',
      cancelButtonText: '<span style="font-weight: 500;">Cancel</span>',
      width: '400px',
      padding: '20px',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg',
        htmlContainer: 'text-sm',
        confirmButton: 'px-6 py-2.5 rounded-lg font-medium',
        cancelButton: 'px-6 py-2.5 rounded-lg font-medium',
      },
      buttonsStyling: true,
    });
    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(id);
        Swal.fire({
          title: '<span style="color: #059669; font-size: 18px; font-weight: 600;">Deleted!</span>',
          html: '<p style="color: #6b7280; font-size: 14px;">Rate has been deleted successfully.</p>',
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'OK',
          width: '380px',
          padding: '20px',
          timer: 2000,
          customClass: {
            popup: 'rounded-xl shadow-2xl',
            confirmButton: 'px-6 py-2.5 rounded-lg font-medium',
          },
        });
      } catch (error: any) {
        Swal.fire({
          title: '<span style="color: #dc2626; font-size: 18px; font-weight: 600;">Error!</span>',
          html: `<p style="color: #6b7280; font-size: 14px;">${error?.message || 'Failed to delete rate'}</p>`,
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
          width: '380px',
          padding: '20px',
          customClass: {
            popup: 'rounded-xl shadow-2xl',
            confirmButton: 'px-6 py-2.5 rounded-lg font-medium',
          },
        });
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && formData.$id) {
        await updateMutation.mutateAsync({
          id: formData.$id,
          data: {
            unit_value: formData.unit_value!,
            status: formData.status!,
            building_parts_id: formData.building_parts_id!,
          },
        });
        Swal.fire('Updated!', 'Rate has been updated.', 'success');
      } else {
        await createMutation.mutateAsync({
          unit_value: formData.unit_value!,
          status: formData.status!,
          building_parts_id: formData.building_parts_id!,
        });
        Swal.fire('Created!', 'Rate has been created.', 'success');
      }
      setShowModal(false);
    } catch (error: any) {
      Swal.fire('Error', error?.message || 'Failed to save rate', 'error');
    }
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
        <DataTable className="whitespace-nowrap table-hover" records={recordsData} columns={columns} totalRecords={filteredRecords.length} recordsPerPage={pageSize} page={page} onPageChange={(p) => setPage(p)} recordsPerPageOptions={PAGE_SIZES} onRecordsPerPageChange={setPageSize} minHeight={200} paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`} fetching={isLoading} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700/50">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 dark:from-blue-600 dark:to-indigo-700 px-5 py-3 border-b border-gray-200 dark:border-gray-700/50">
              <h3 className="text-base font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Building Parts Rate</h3>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-1 bg-gradient-to-b from-transparent to-gray-50/5 dark:to-gray-950/30">
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700/70 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:hover:from-gray-700/40 dark:hover:to-transparent px-2 rounded-lg transition-all duration-200">
                  <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-200">Building Part:</label>
                  <select 
                    className="form-select flex-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/50" 
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
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700/70 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:hover:from-gray-700/40 dark:hover:to-transparent px-2 rounded-lg transition-all duration-200">
                  <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-200">Unit Value (₱):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input flex-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/50" 
                    placeholder="0.00" 
                    value={formData.unit_value} 
                    onChange={(e) => setFormData({ ...formData, unit_value: parseFloat(e.target.value) })} 
                    required 
                  />
                </div>
                <div className="flex items-center gap-3 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:hover:from-gray-700/40 dark:hover:to-transparent px-2 rounded-lg transition-all duration-200">
                  <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-200">Status:</label>
                  <select 
                    className="form-select flex-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/50" 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-5 py-3 border-t border-gray-200 dark:border-gray-700/50 flex justify-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-danger text-sm hover:scale-105 transition-transform duration-200 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary text-sm hover:scale-105 transition-transform duration-200 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 shadow-lg dark:shadow-blue-900/50" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingPartsRate;
