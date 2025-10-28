import { DataTable } from 'mantine-datatable';
import { useEffect, useState, useMemo } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import { type SubClassificationResponse } from '../services/subClassification';
import {
    useGetAllSubClassifications,
    useCreateSubClassification,
    useUpdateSubClassification,
    useDeleteSubClassification,
} from '../hooks/useSubClassifications';
import { useGetAllClassifications } from '../hooks/useClassifications';

type SubClassificationData = SubClassificationResponse;

const SubClassifications = () => {
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState<Partial<SubClassificationData>>({
        name: '',
        description: '',
        status: 'active',
        classification_id: '',
    });

    // TanStack Query hooks
    const { data: subClassifications = [], isLoading, isError, error } = useGetAllSubClassifications();
    const { data: classifications = [] } = useGetAllClassifications();
    const createMutation = useCreateSubClassification();
    const updateMutation = useUpdateSubClassification();
    const deleteMutation = useDeleteSubClassification();

    // Show error toast if query fails
    useEffect(() => {
        if (isError) {
            Swal.fire('Error', error?.message || 'Failed to fetch sub-classifications', 'error');
        }
    }, [isError, error]);

    // Helper function to get classification name
    const getClassificationName = (classificationId: string) => {
        const classification = classifications.find(c => c.$id === classificationId);
        return classification?.name || 'Unknown';
    };

    const columns = [
        {
            accessor: '$id',
            title: 'ID',
            sortable: true,
            width: 100,
            render: ({ $id }: SubClassificationData) => (
                <span className="text-xs">{$id.substring(0, 8)}...</span>
            ),
        },
        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
        },
        {
            accessor: 'classification_id',
            title: 'Classification',
            sortable: true,
            render: ({ classification_id }: SubClassificationData) => (
                <span className="badge badge-outline-info">
                    {getClassificationName(classification_id)}
                </span>
            ),
        },
        {
            accessor: 'description',
            title: 'Description',
            sortable: true,
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }: SubClassificationData) => (
                <span className={`badge ${status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {status}
                </span>
            ),
        },
        {
            accessor: '$createdAt',
            title: 'Created At',
            sortable: true,
            render: ({ $createdAt }: SubClassificationData) => (
                <span>{new Date($createdAt).toLocaleDateString()}</span>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (record: SubClassificationData) => (
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
        if (!search) return subClassifications;

        return subClassifications.filter((item) => {
            const classificationName = getClassificationName(item.classification_id);
            return Object.keys(item).some((key) => {
                return String(item[key as keyof SubClassificationData]).toLowerCase().includes(search.toLowerCase());
            }) || classificationName.toLowerCase().includes(search.toLowerCase());
        });
    }, [subClassifications, search, classifications]);

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
        setFormData({ name: '', description: '', status: 'active', classification_id: '' });
        setShowModal(true);
    };

    const handleEdit = (record: SubClassificationData) => {
        setIsEdit(true);
        setFormData(record);
        setShowModal(true);
    };

    const handleView = (record: SubClassificationData) => {
        Swal.fire({
            title: '<strong style="color: #4361ee;">Sub-Classification Details</strong>',
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
                    Sub-Classification Name
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #111827; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${record.name}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                    Classification
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #111827; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${getClassificationName(record.classification_id)}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    Description
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${record.description || '<em style="color: #9ca3af;">No description</em>'}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Status
                  </span>
                </td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; ${record.status === 'active' ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'}">${record.status.toUpperCase()}</span>
                </td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                    Document ID
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #6b7280; font-family: monospace; font-size: 12px; border-bottom: 1px solid #e5e7eb;">${record.$id}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Created At
                  </span>
                </td>
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
            title: '<span style="color: #dc2626; font-size: 20px; font-weight: 600;">Delete Sub-Classification?</span>',
            html: `
        <div style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; margin-bottom: 16px;">
            <svg style="width: 32px; height: 32px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">This action cannot be undone. The sub-classification will be permanently removed.</p>
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
                        html: '<p style="color: #6b7280; font-size: 14px;">Sub-classification has been deleted successfully.</p>',
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

        if (!formData.classification_id) {
            Swal.fire('Error', 'Please select a classification', 'error');
            return;
        }

        try {
            if (isEdit && formData.$id) {
                await updateMutation.mutateAsync({
                    id: formData.$id,
                    data: {
                        name: formData.name,
                        description: formData.description,
                        status: formData.status,
                        classification_id: formData.classification_id,
                    },
                });
                Swal.fire('Updated!', 'Sub-classification has been updated.', 'success');
            } else {
                await createMutation.mutateAsync({
                    name: formData.name || '',
                    description: formData.description || '',
                    status: formData.status || 'active',
                    classification_id: formData.classification_id,
                });
                Swal.fire('Created!', 'Sub-classification has been created.', 'success');
            }
            setShowModal(false);
        } catch (error: any) {
            Swal.fire('Error', error?.message || 'Failed to save', 'error');
        }
    };

    return (
        <div className="panel">
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Sub-Classifications</h5>
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
                            <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Sub-Classification</h3>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-4 space-y-1 max-h-[calc(75vh-140px)] overflow-y-auto">
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Classification:</label>
                                    <select
                                        className="form-select flex-1"
                                        value={formData.classification_id}
                                        onChange={(e) => setFormData({ ...formData, classification_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Classification</option>
                                        {classifications.filter(c => c.status === 'active').map((classification) => (
                                            <option key={classification.$id} value={classification.$id}>
                                                {classification.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                <div className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300 pt-2">Description:</label>
                                    <textarea
                                        className="form-textarea flex-1"
                                        rows={3}
                                        placeholder="Enter description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default SubClassifications;
