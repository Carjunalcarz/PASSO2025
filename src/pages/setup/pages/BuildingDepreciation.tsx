import { DataTable } from 'mantine-datatable';
import { useEffect, useState, useMemo } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import { type BuildingDepreciationResponse } from '../services/buildingDepreciation';
import {
    useGetAllBuildingDepreciations,
    useCreateBuildingDepreciation,
    useUpdateBuildingDepreciation,
    useDeleteBuildingDepreciation,
} from '../hooks/useBuildingDepreciations';
import { useGetAllBuildingStructuralTypes } from '../hooks/useBuildingStructuralTypes';
import { useGetAllBuildingCodes } from '../hooks/useBuildingCodes';

type BuildingDepreciationData = BuildingDepreciationResponse;

const BuildingDepreciation = () => {
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState<Partial<BuildingDepreciationData>>({
        name: '',
        age: 0,
        rate: 0,
        effectivity_date: '',
        status: 'active',
        building_structural_types_id: '',
        building_code_id: '',
    });

    // TanStack Query hooks
    const { data: buildingDepreciations = [], isLoading, isError, error } = useGetAllBuildingDepreciations();
    const { data: structuralTypes = [] } = useGetAllBuildingStructuralTypes();
    const { data: buildingCodes = [] } = useGetAllBuildingCodes();
    const createMutation = useCreateBuildingDepreciation();
    const updateMutation = useUpdateBuildingDepreciation();
    const deleteMutation = useDeleteBuildingDepreciation();

    // Filter active items for dropdowns
    const activeStructuralTypes = useMemo(() => 
        structuralTypes.filter(type => type.status === 'active'), 
        [structuralTypes]
    );
    const activeBuildingCodes = useMemo(() => 
        buildingCodes.filter(code => code.status === 'active'), 
        [buildingCodes]
    );

    // Show error toast if query fails
    useEffect(() => {
        if (isError) {
            Swal.fire('Error', error?.message || 'Failed to fetch building depreciations', 'error');
        }
    }, [isError, error]);

    const columns = [
        {
            accessor: '$id',
            title: 'ID',
            sortable: true,
            width: 100,
            render: ({ $id }: BuildingDepreciationData) => (
                <span className="text-xs">{$id.substring(0, 8)}...</span>
            ),
        },
        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
        },
        {
            accessor: 'age',
            title: 'Age',
            sortable: true,
        },
        {
            accessor: 'rate',
            title: 'Rate (%)',
            sortable: true,
            render: ({ rate }: BuildingDepreciationData) => (
                <span>{rate.toFixed(2)}%</span>
            ),
        },
        {
            accessor: 'effectivity_date',
            title: 'Effectivity Date',
            sortable: true,
            render: ({ effectivity_date }: BuildingDepreciationData) => (
                <span>{new Date(effectivity_date).toLocaleDateString()}</span>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }: BuildingDepreciationData) => (
                <span className={`badge ${status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {status}
                </span>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (record: BuildingDepreciationData) => (
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
        if (!search) return buildingDepreciations;

        return buildingDepreciations.filter((item) => {
            return Object.keys(item).some((key) => {
                return String(item[key as keyof BuildingDepreciationData]).toLowerCase().includes(search.toLowerCase());
            });
        });
    }, [buildingDepreciations, search]);

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
            age: 0, 
            rate: 0, 
            effectivity_date: new Date().toISOString().split('T')[0],
            status: 'active',
            building_structural_types_id: '',
            building_code_id: '',
        });
        setShowModal(true);
    };

    const handleEdit = (record: BuildingDepreciationData) => {
        setIsEdit(true);
        setFormData({
            ...record,
            effectivity_date: record.effectivity_date.split('T')[0], // Format for input[type="date"]
        });
        setShowModal(true);
    };

    const getStructuralTypeName = (id: string) => {
        const type = structuralTypes.find(t => t.$id === id);
        return type?.name || 'N/A';
    };

    const getBuildingCodeName = (id: string) => {
        const code = buildingCodes.find(c => c.$id === id);
        return code?.name || 'N/A';
    };

    const handleView = (record: BuildingDepreciationData) => {
        Swal.fire({
            title: '<strong style="color: #4361ee;">Building Depreciation Details</strong>',
            html: `
        <div class="overflow-x-auto" style="margin-top: 20px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <tbody>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; width: 40%;">Name</td>
                <td style="padding: 14px 16px; color: #111827; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${record.name}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Age</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${record.age}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Rate</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${record.rate.toFixed(2)}%</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Effectivity Date</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${new Date(record.effectivity_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Structural Type</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${getStructuralTypeName(record.building_structural_types_id)}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Building Code</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${getBuildingCodeName(record.building_code_id)}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Status</td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; ${record.status === 'active' ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'}">${record.status.toUpperCase()}</span>
                </td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Document ID</td>
                <td style="padding: 14px 16px; color: #6b7280; font-family: monospace; font-size: 12px; border-bottom: 1px solid #e5e7eb;">${record.$id}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151;">Created At</td>
                <td style="padding: 14px 16px; color: #6b7280;">${new Date(record.$createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
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
        Swal.fire({
            title: '<span style="color: #dc2626; font-size: 20px; font-weight: 600;">Delete Building Depreciation?</span>',
            html: `
        <div style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; margin-bottom: 16px;">
            <svg style="width: 32px; height: 32px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">This action cannot be undone. The building depreciation will be permanently removed.</p>
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
                        html: '<p style="color: #6b7280; font-size: 14px;">Building depreciation has been deleted successfully.</p>',
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

        try {
            if (isEdit && formData.$id) {
                await updateMutation.mutateAsync({
                    id: formData.$id,
                    data: {
                        name: formData.name,
                        age: formData.age,
                        rate: formData.rate,
                        effectivity_date: formData.effectivity_date,
                        status: formData.status,
                        building_structural_types_id: formData.building_structural_types_id,
                        building_code_id: formData.building_code_id,
                    },
                });
                Swal.fire('Updated!', 'Building depreciation has been updated.', 'success');
            } else {
                await createMutation.mutateAsync({
                    name: formData.name || '',
                    age: formData.age || 0,
                    rate: formData.rate || 0,
                    effectivity_date: formData.effectivity_date || '',
                    status: formData.status || 'active',
                    building_structural_types_id: formData.building_structural_types_id || '',
                    building_code_id: formData.building_code_id || '',
                });
                Swal.fire('Created!', 'Building depreciation has been created.', 'success');
            }
            setShowModal(false);
        } catch (error: any) {
            Swal.fire('Error', error?.message || 'Failed to save', 'error');
        }
    };

    return (
        <div className="panel">
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Building Depreciation</h5>
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-primary px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Building Depreciation</h3>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-4 space-y-1 max-h-[calc(90vh-140px)] overflow-y-auto">
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-48 font-semibold text-gray-700 dark:text-gray-300">Name:</label>
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
                                    <label className="w-48 font-semibold text-gray-700 dark:text-gray-300">Age:</label>
                                    <input
                                        type="number"
                                        className="form-input flex-1"
                                        placeholder="Enter age"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-48 font-semibold text-gray-700 dark:text-gray-300">Rate (%):</label>
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
                                    <label className="w-48 font-semibold text-gray-700 dark:text-gray-300">Effectivity Date:</label>
                                    <input
                                        type="date"
                                        className="form-input flex-1"
                                        value={formData.effectivity_date}
                                        onChange={(e) => setFormData({ ...formData, effectivity_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-48 font-semibold text-gray-700 dark:text-gray-300">Structural Type:</label>
                                    <select
                                        className="form-select flex-1"
                                        value={formData.building_structural_types_id}
                                        onChange={(e) => setFormData({ ...formData, building_structural_types_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Structural Type</option>
                                        {activeStructuralTypes.map((type) => (
                                            <option key={type.$id} value={type.$id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-48 font-semibold text-gray-700 dark:text-gray-300">Building Code:</label>
                                    <select
                                        className="form-select flex-1"
                                        value={formData.building_code_id}
                                        onChange={(e) => setFormData({ ...formData, building_code_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Building Code</option>
                                        {activeBuildingCodes.map((code) => (
                                            <option key={code.$id} value={code.$id}>
                                                {code.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-48 font-semibold text-gray-700 dark:text-gray-300">Status:</label>
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

export default BuildingDepreciation;
