import { DataTable } from 'mantine-datatable';
import { useEffect, useState, useMemo } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import { type ProductResponse } from '../services/products';
import {
    useGetAllProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
} from '../hooks/useProducts';

type ProductData = ProductResponse;

const Products = () => {
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState<Partial<ProductData>>({
        name: '',
        description: '',
        status: 'active',
    });

    // TanStack Query hooks
    const { data: products = [], isLoading, error } = useGetAllProducts();
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    // Filter and paginate data
    const filteredData = useMemo(() => {
        if (!products) return [];
        
        return products.filter((item) => {
            const searchLower = search.toLowerCase();
            return (
                item.name?.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower) ||
                item.status?.toLowerCase().includes(searchLower)
            );
        });
    }, [products, search]);

    const paginatedData = useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return filteredData.slice(from, to);
    }, [filteredData, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [pageSize, search]);

    const handleAdd = () => {
        setIsEdit(false);
        setFormData({
            name: '',
            description: '',
            status: 'active',
        });
        setShowModal(true);
    };

    const handleEdit = (data: ProductData) => {
        setIsEdit(true);
        setFormData({
            $id: data.$id,
            name: data.name,
            description: data.description,
            status: data.status,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEdit(false);
        setFormData({
            name: '',
            description: '',
            status: 'active',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Product name is required',
            });
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
                    },
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Product updated successfully',
                    timer: 2000,
                });
            } else {
                await createMutation.mutateAsync({
                    name: formData.name,
                    description: formData.description,
                    status: formData.status || 'active',
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Product created successfully',
                    timer: 2000,
                });
            }

            handleCloseModal();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred',
            });
        }
    };

    const handleView = (record: ProductData) => {
        Swal.fire({
            title: `<span style="color: #1e40af; font-size: 22px; font-weight: 700;">Product Details</span>`,
            html: `
        <div style="text-align: left; padding: 8px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <tbody>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; width: 35%; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    Name
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #111827; font-weight: 500; border-bottom: 1px solid #e5e7eb;">${record.name}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    Description
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${record.description || '-'}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
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
              <tr style="background: #ffffff;">
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
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
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
            title: '<span style="color: #dc2626; font-size: 20px; font-weight: 600;">Delete Product?</span>',
            html: `
        <div style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; margin-bottom: 16px;">
            <svg style="width: 32px; height: 32px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">This action cannot be undone. The product will be permanently removed.</p>
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
                        html: '<p style="color: #6b7280; font-size: 14px;">Product has been deleted successfully.</p>',
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

    if (error) {
        return (
            <div className="panel">
                <div className="text-center text-danger">
                    Error loading products: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Products</h5>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        className="form-input w-full sm:w-auto"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        type="button"
                        className="btn btn-primary gap-2"
                        onClick={handleAdd}
                    >
                        <IconPlus />
                        Add Product
                    </button>
                </div>
            </div>

            <div className="datatables">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={paginatedData}
                    columns={[
                        {
                            accessor: '$id',
                            title: 'ID',
                            sortable: true,
                            render: (row) => (
                                <div className="font-mono text-xs">{row.$id.slice(0, 8)}...</div>
                            ),
                        },
                        {
                            accessor: 'name',
                            title: 'Name',
                            sortable: true,
                            render: (row) => (
                                <div className="font-semibold">{row.name}</div>
                            ),
                        },
                        {
                            accessor: 'description',
                            title: 'Description',
                            sortable: true,
                            render: (row) => (
                                <div className="max-w-md truncate">{row.description || '-'}</div>
                            ),
                        },
                        {
                            accessor: 'status',
                            title: 'Status',
                            sortable: true,
                            render: (row) => (
                                <span
                                    className={`badge ${
                                        row.status === 'active'
                                            ? 'badge-outline-success'
                                            : 'badge-outline-danger'
                                    }`}
                                >
                                    {row.status}
                                </span>
                            ),
                        },
                        {
                            accessor: '$createdAt',
                            title: 'Created At',
                            sortable: true,
                            render: (row) => (
                                <div className="text-xs">
                                    {new Date(row.$createdAt).toLocaleDateString()}
                                </div>
                            ),
                        },
                        {
                            accessor: 'actions',
                            title: 'Actions',
                            titleClassName: '!text-center',
                            render: (row) => (
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleView(row)}
                                    >
                                        <IconEye />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-warning"
                                        onClick={() => handleEdit(row)}
                                    >
                                        <IconEdit />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(row.$id)}
                                    >
                                        <IconTrash />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    totalRecords={filteredData.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    minHeight={200}
                    fetching={isLoading}
                    loaderVariant="dots"
                    loaderSize="lg"
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[75vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-primary px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Product</h3>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-4 space-y-1 max-h-[calc(75vh-140px)] overflow-y-auto">
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Name:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter product name"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300 pt-2">Description:</label>
                                    <textarea
                                        className="form-textarea flex-1"
                                        rows={3}
                                        placeholder="Enter product description"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Status:</label>
                                    <select
                                        className="form-select flex-1"
                                        value={formData.status || 'active'}
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

export default Products;
