import { DataTable } from 'mantine-datatable';
import { useEffect, useState, useMemo } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { type MachineryRateResponse } from '../services/machineryRates';
import {
    useGetAllMachineryRates,
    useCreateMachineryRate,
    useUpdateMachineryRate,
    useDeleteMachineryRate,
} from '../hooks/useMachineryRates';
import { useGetAllMachineryTypes } from '../hooks/useMachineryTypes';

type MachineryRateData = MachineryRateResponse;

const MachineryRates = () => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState<Partial<MachineryRateData>>({
        name: '',
        rate: 0,
        effectivity_date: '',
        status: 'active',
        machinery_type_id: '',
    });

    // TanStack Query hooks
    const { data: machineryRates = [], isLoading, isError, error } = useGetAllMachineryRates();
    const { data: machineryTypes = [] } = useGetAllMachineryTypes();
    const createMutation = useCreateMachineryRate();
    const updateMutation = useUpdateMachineryRate();
    const deleteMutation = useDeleteMachineryRate();

    // Show error toast if query fails
    useEffect(() => {
        if (isError) {
            Swal.fire('Error', error?.message || 'Failed to fetch machinery rates', 'error');
        }
    }, [isError, error]);

    // Helper function to get machinery type name
    const getMachineryTypeName = (typeId: string) => {
        const type = machineryTypes.find(t => t.$id === typeId);
        return type?.name || 'Unknown';
    };

    const columns = [
        {
            accessor: '$id',
            title: 'ID',
            sortable: true,
            width: 100,
            render: ({ $id }: MachineryRateData) => (
                <span className="text-xs">{$id.substring(0, 8)}...</span>
            ),
        },
        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
        },
        {
            accessor: 'machinery_type_id',
            title: 'Machinery Type',
            sortable: true,
            render: ({ machinery_type_id }: MachineryRateData) => (
                <span>{getMachineryTypeName(machinery_type_id)}</span>
            ),
        },
        {
            accessor: 'rate',
            title: 'Rate',
            sortable: true,
            render: ({ rate }: MachineryRateData) => (
                <span className="font-semibold text-primary">₱{rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            ),
        },
        {
            accessor: 'effectivity_date',
            title: 'Effectivity Date',
            sortable: true,
            render: ({ effectivity_date }: MachineryRateData) => (
                <span>{new Date(effectivity_date).toLocaleDateString()}</span>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }: MachineryRateData) => (
                <span className={`badge ${status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {status}
                </span>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (record: MachineryRateData) => (
                <div className="flex items-center justify-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleView(record)}>
                        <IconEye />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(record)}>
                        <IconEdit />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(record.$id)}>
                        <IconTrash />
                    </button>
                </div>
            ),
        },
    ];

    // Filter and paginate data
    const filteredRecords = useMemo(() => {
        if (!search) return machineryRates;

        return machineryRates.filter((item) => {
            const typeName = getMachineryTypeName(item.machinery_type_id);
            return (
                item.name?.toLowerCase().includes(search.toLowerCase()) ||
                typeName.toLowerCase().includes(search.toLowerCase()) ||
                item.rate?.toString().includes(search) ||
                item.status?.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [machineryRates, search, machineryTypes]);

    const recordsData = useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return filteredRecords.slice(from, to);
    }, [filteredRecords, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [pageSize, search]);

    const handleAdd = () => {
        setIsEdit(false);
        setFormData({ 
            name: '', 
            rate: 0, 
            effectivity_date: new Date().toISOString().split('T')[0],
            status: 'active',
            machinery_type_id: '',
        });
        setShowModal(true);
    };

    const handleEdit = (record: MachineryRateData) => {
        setIsEdit(true);
        setFormData({
            ...record,
            effectivity_date: record.effectivity_date ? new Date(record.effectivity_date).toISOString().split('T')[0] : '',
        });
        setShowModal(true);
    };

    const handleView = (record: MachineryRateData) => {
        const typeName = getMachineryTypeName(record.machinery_type_id);
        const bgPrimary = isDark ? 'linear-gradient(to right, #1f2937, #111827)' : 'linear-gradient(to right, #f9fafb, #ffffff)';
        const bgSecondary = isDark ? '#111827' : '#ffffff';
        const borderColor = isDark ? '#374151' : '#e5e7eb';
        const labelColor = isDark ? '#9ca3af' : '#374151';
        const valueColor = isDark ? '#d1d5db' : '#111827';
        const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
        const popupBg = isDark ? '#1f2937' : '#ffffff';
        const iconColor = isDark ? '#9ca3af' : '#6b7280';
        
        Swal.fire({
            title: `<strong style="color: ${isDark ? '#60a5fa' : '#4361ee'};">Machinery Rate Details</strong>`,
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
                    Rate Name
                  </span>
                </td>
                <td style="padding: 14px 16px; color: ${valueColor}; border-bottom: 1px solid ${borderColor}; font-weight: 500;">${record.name}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Machinery Type
                  </span>
                </td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; border-bottom: 1px solid ${borderColor};">${typeName}</td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Rate
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #059669; border-bottom: 1px solid ${borderColor}; font-weight: 600; font-size: 16px;">₱${record.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Effectivity Date
                  </span>
                </td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; border-bottom: 1px solid ${borderColor};">${new Date(record.effectivity_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Status
                  </span>
                </td>
                <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor};">
                  <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; ${record.status === 'active' ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'}">${record.status.toUpperCase()}</span>
                </td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                    Document ID
                  </span>
                </td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; font-family: monospace; font-size: 12px; border-bottom: 1px solid ${borderColor};">${record.$id}</td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor};">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Created At
                  </span>
                </td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor};">${new Date(record.$createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
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
        Swal.fire({
            title: '<span style="color: #dc2626; font-size: 20px; font-weight: 600;">Delete Machinery Rate?</span>',
            html: `
        <div style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; margin-bottom: 16px;">
            <svg style="width: 32px; height: 32px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">This action cannot be undone. The machinery rate will be permanently removed.</p>
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteMutation.mutateAsync(id);
                    Swal.fire({
                        title: '<span style="color: #059669; font-size: 18px; font-weight: 600;">Deleted!</span>',
                        html: '<p style="color: #6b7280; font-size: 14px;">Machinery rate has been deleted successfully.</p>',
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
                        html: `<p style="color: #6b7280; font-size: 14px;">${error?.message || 'Failed to delete'}</p>`,
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
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.machinery_type_id) {
            Swal.fire('Error', 'Please select a machinery type', 'error');
            return;
        }

        try {
            if (isEdit && formData.$id) {
                await updateMutation.mutateAsync({
                    id: formData.$id,
                    data: {
                        name: formData.name,
                        rate: formData.rate,
                        effectivity_date: formData.effectivity_date,
                        status: formData.status,
                        machinery_type_id: formData.machinery_type_id,
                    },
                });
                Swal.fire('Updated!', 'Machinery rate has been updated.', 'success');
            } else {
                await createMutation.mutateAsync({
                    name: formData.name || '',
                    rate: formData.rate || 0,
                    effectivity_date: formData.effectivity_date || new Date().toISOString(),
                    status: formData.status || 'active',
                    machinery_type_id: formData.machinery_type_id || '',
                });
                Swal.fire('Created!', 'Machinery rate has been created.', 'success');
            }
            setShowModal(false);
        } catch (error: any) {
            Swal.fire('Error', error?.message || 'Failed to save', 'error');
        }
    };

    return (
        <div className="panel">
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Machinery Rates</h5>
                <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
                    <input
                        type="text"
                        className="form-input w-auto"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="button" className="btn btn-primary" onClick={handleAdd}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Add New
                    </button>
                </div>
            </div>
            <div className="datatables">
                <DataTable
                    className="whitespace-nowrap table-hover"
                    records={recordsData}
                    columns={columns}
                    totalRecords={filteredRecords.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    fetching={isLoading}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[75vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-primary px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Machinery Rate</h3>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-4 space-y-1 max-h-[calc(75vh-140px)] overflow-y-auto">
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Name:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Machinery Type:</label>
                                    <select
                                        className="form-select flex-1"
                                        value={formData.machinery_type_id}
                                        onChange={(e) => setFormData({ ...formData, machinery_type_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Machinery Type</option>
                                        {machineryTypes.filter(t => t.status === 'active').map((type) => (
                                            <option key={type.$id} value={type.$id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Rate (₱):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input flex-1"
                                        placeholder="Enter rate"
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Effectivity Date:</label>
                                    <input
                                        type="date"
                                        className="form-input flex-1"
                                        value={formData.effectivity_date}
                                        onChange={(e) => setFormData({ ...formData, effectivity_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Status:</label>
                                    <select
                                        className="form-select flex-1"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                <button type="button" className="btn btn-outline-danger" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
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

export default MachineryRates;
