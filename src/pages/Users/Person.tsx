import { DataTable } from 'mantine-datatable';
import { useEffect, useState, useMemo } from 'react';
import IconTrash from '../../components/Icon/IconTrash';
import IconEdit from '../../components/Icon/IconEdit';
import IconEye from '../../components/Icon/IconEye';
import IconPlus from '../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { type PersonResponse } from '../setup/services/person';
import {
    useGetAllPersons,
    useCreatePerson,
    useUpdatePerson,
    useDeletePerson,
} from './hooks/usePersons';

type PersonData = PersonResponse;

const Person = () => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState<Partial<PersonData>>({
        firstName: '',
        middleName: '',
        lastName: '',
        ownerTypeId: '',
        barangayId: '',
        street: '',
        tin: '',
        contactNo: '',
        status: 'active',
        uid: '',
    });
    const [similarPersons, setSimilarPersons] = useState<PersonData[]>([]);

    // TanStack Query hooks
    const { data: persons = [], isLoading, isError, error } = useGetAllPersons();
    const createMutation = useCreatePerson();
    const updateMutation = useUpdatePerson();
    const deleteMutation = useDeletePerson();

    // Show error toast if query fails
    useEffect(() => {
        if (isError) {
            Swal.fire('Error', error?.message || 'Failed to fetch persons', 'error');
        }
    }, [isError, error]);

    const columns = [
        {
            accessor: '$id',
            title: 'ID',
            sortable: true,
            width: 100,
            render: ({ $id }: PersonData) => (
                <span className="text-xs">{$id.substring(0, 8)}...</span>
            ),
        },
        {
            accessor: 'firstName',
            title: 'First Name',
            sortable: true,
        },
        {
            accessor: 'lastName',
            title: 'Last Name',
            sortable: true,
        },
        {
            accessor: 'contactNo',
            title: 'Contact No',
            sortable: true,
        },
        {
            accessor: 'tin',
            title: 'TIN',
            sortable: true,
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }: PersonData) => (
                <span className={`badge ${status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {status}
                </span>
            ),
        },
        {
            accessor: '$createdAt',
            title: 'Created At',
            sortable: true,
            render: ({ $createdAt }: PersonData) => (
                <span>{new Date($createdAt).toLocaleDateString()}</span>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (record: PersonData) => (
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
        if (!search) return persons;

        return persons.filter((item) => {
            return Object.keys(item).some((key) => {
                return String(item[key as keyof PersonData]).toLowerCase().includes(search.toLowerCase());
            });
        });
    }, [persons, search]);

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
            firstName: '',
            middleName: '',
            lastName: '',
            ownerTypeId: '',
            barangayId: '',
            street: '',
            tin: '',
            contactNo: '',
            status: 'active',
            uid: '',
        });
        setSimilarPersons([]);
        setShowModal(true);
    };

    const handleEdit = (record: PersonData) => {
        setIsEdit(true);
        setFormData(record);
        setShowModal(true);
    };

    const handleView = (record: PersonData) => {
        const bgPrimary = isDark ? 'linear-gradient(to right, #1f2937, #111827)' : 'linear-gradient(to right, #f9fafb, #ffffff)';
        const bgSecondary = isDark ? '#111827' : '#ffffff';
        const borderColor = isDark ? '#374151' : '#e5e7eb';
        const labelColor = isDark ? '#9ca3af' : '#374151';
        const valueColor = isDark ? '#d1d5db' : '#111827';
        const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
        const popupBg = isDark ? '#1f2937' : '#ffffff';
        const iconColor = isDark ? '#9ca3af' : '#6b7280';

        Swal.fire({
            title: `<strong style="color: ${isDark ? '#60a5fa' : '#4361ee'};">Person Details</strong>`,
            html: `
        <div class="overflow-x-auto" style="margin-top: 20px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${borderColor}; border-radius: 8px; overflow: hidden;">
            <tbody>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor}; width: 40%;">First Name</td>
                <td style="padding: 14px 16px; color: ${valueColor}; border-bottom: 1px solid ${borderColor}; font-weight: 500;">${record.firstName}</td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">Middle Name</td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; border-bottom: 1px solid ${borderColor};">${record.middleName || `<em style="color: ${isDark ? '#6b7280' : '#9ca3af'};">N/A</em>`}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">Last Name</td>
                <td style="padding: 14px 16px; color: ${valueColor}; border-bottom: 1px solid ${borderColor}; font-weight: 500;">${record.lastName}</td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">Owner Type ID</td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; border-bottom: 1px solid ${borderColor};">${record.ownerTypeId || `<em style="color: ${isDark ? '#6b7280' : '#9ca3af'};">N/A</em>`}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">Barangay ID</td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; border-bottom: 1px solid ${borderColor};">${record.barangayId || `<em style="color: ${isDark ? '#6b7280' : '#9ca3af'};">N/A</em>`}</td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">Street</td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; border-bottom: 1px solid ${borderColor};">${record.street || `<em style="color: ${isDark ? '#6b7280' : '#9ca3af'};">N/A</em>`}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">TIN</td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; border-bottom: 1px solid ${borderColor};">${record.tin || `<em style="color: ${isDark ? '#6b7280' : '#9ca3af'};">N/A</em>`}</td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">Contact No</td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; border-bottom: 1px solid ${borderColor};">${record.contactNo || `<em style="color: ${isDark ? '#6b7280' : '#9ca3af'};">N/A</em>`}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">UID</td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; font-family: monospace; font-size: 12px; border-bottom: 1px solid ${borderColor};">${record.uid || `<em style="color: ${isDark ? '#6b7280' : '#9ca3af'};">N/A</em>`}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">Status</td>
                <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor};">
                  <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; ${record.status === 'active' ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'}">${record.status.toUpperCase()}</span>
                </td>
              </tr>
              <tr style="background: ${bgPrimary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor}; border-bottom: 1px solid ${borderColor};">Document ID</td>
                <td style="padding: 14px 16px; color: ${secondaryTextColor}; font-family: monospace; font-size: 12px; border-bottom: 1px solid ${borderColor};">${record.$id}</td>
              </tr>
              <tr style="background: ${bgSecondary};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${labelColor};">Created At</td>
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
            title: '<span style="color: #dc2626; font-size: 20px; font-weight: 600;">Delete Person?</span>',
            html: `
        <div style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; margin-bottom: 16px;">
            <svg style="width: 32px; height: 32px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">This action cannot be undone. The person will be permanently removed.</p>
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
                        html: '<p style="color: #6b7280; font-size: 14px;">Person has been deleted successfully.</p>',
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
                        firstName: formData.firstName || '',
                        middleName: formData.middleName,
                        lastName: formData.lastName || '',
                        ownerTypeId: formData.ownerTypeId,
                        barangayId: formData.barangayId,
                        street: formData.street,
                        tin: formData.tin,
                        contactNo: formData.contactNo,
                        status: formData.status || 'active',
                        uid: formData.uid,
                    },
                });
                Swal.fire('Updated!', 'Person has been updated.', 'success');
            } else {
                await createMutation.mutateAsync({
                    firstName: formData.firstName || '',
                    middleName: formData.middleName,
                    lastName: formData.lastName || '',
                    ownerTypeId: formData.ownerTypeId,
                    barangayId: formData.barangayId,
                    street: formData.street,
                    tin: formData.tin,
                    contactNo: formData.contactNo,
                    status: formData.status || 'active',
                    uid: formData.uid,
                });
                Swal.fire('Created!', 'Person has been created.', 'success');
            }
            setShowModal(false);
        } catch (error: any) {
            Swal.fire('Error', error?.message || 'Failed to save', 'error');
        }
    };

    return (
        <div className="panel">
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Persons</h5>
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
                            <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Person</h3>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-4 space-y-1 max-h-[calc(90vh-140px)] overflow-y-auto">
                                {/* Similar Persons Warning - Only show when adding new person */}
                                {!isEdit && similarPersons.length > 0 && (
                                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <div className="flex items-start gap-2 mb-3">
                                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Similar Persons Found</h4>
                                                <p className="text-sm text-yellow-700 dark:text-yellow-400">The following persons have similar names. Please verify before creating a new record.</p>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-yellow-100 dark:bg-yellow-900/30">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-yellow-900 dark:text-yellow-200">Name</th>
                                                        <th className="px-3 py-2 text-left text-yellow-900 dark:text-yellow-200">Contact</th>
                                                        <th className="px-3 py-2 text-left text-yellow-900 dark:text-yellow-200">TIN</th>
                                                        <th className="px-3 py-2 text-left text-yellow-900 dark:text-yellow-200">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {similarPersons.slice(0, 3).map((person) => (
                                                        <tr key={person.$id} className="border-t border-yellow-200 dark:border-yellow-800">
                                                            <td className="px-3 py-2 text-yellow-900 dark:text-yellow-100">
                                                                {person.firstName} {person.middleName || ''} {person.lastName}
                                                            </td>
                                                            <td className="px-3 py-2 text-yellow-800 dark:text-yellow-200">{person.contactNo || 'N/A'}</td>
                                                            <td className="px-3 py-2 text-yellow-800 dark:text-yellow-200">{person.tin || 'N/A'}</td>
                                                            <td className="px-3 py-2">
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    person.status === 'active' 
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                }`}>
                                                                    {person.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {similarPersons.length > 3 && (
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2 text-center">
                                                    +{similarPersons.length - 3} more similar person(s) found
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">First Name:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter first name"
                                        value={formData.firstName}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData({ ...formData, firstName: value });
                                            // Search for similar persons when typing
                                            if (!isEdit && value.length >= 2) {
                                                const searchTerm = `${value} ${formData.middleName || ''} ${formData.lastName || ''}`.trim().toLowerCase();
                                                const similar = persons.filter(p => {
                                                    const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.toLowerCase();
                                                    return fullName.includes(value.toLowerCase()) || p.firstName.toLowerCase().includes(value.toLowerCase());
                                                });
                                                setSimilarPersons(similar);
                                            } else if (!isEdit && value.length < 2) {
                                                setSimilarPersons([]);
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Middle Name:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter middle name"
                                        value={formData.middleName}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData({ ...formData, middleName: value });
                                            // Update search when middle name changes
                                            if (!isEdit && (formData.firstName || formData.lastName)) {
                                                const searchTerm = `${formData.firstName} ${value} ${formData.lastName}`.trim().toLowerCase();
                                                const similar = persons.filter(p => {
                                                    const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.toLowerCase();
                                                    return fullName.includes(searchTerm);
                                                });
                                                setSimilarPersons(similar);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Last Name:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter last name"
                                        value={formData.lastName}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData({ ...formData, lastName: value });
                                            // Search for similar persons when typing
                                            if (!isEdit && value.length >= 2) {
                                                const searchTerm = `${formData.firstName} ${formData.middleName || ''} ${value}`.trim().toLowerCase();
                                                const similar = persons.filter(p => {
                                                    const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.toLowerCase();
                                                    return fullName.includes(value.toLowerCase()) || p.lastName.toLowerCase().includes(value.toLowerCase());
                                                });
                                                setSimilarPersons(similar);
                                            } else if (!isEdit && value.length < 2) {
                                                setSimilarPersons([]);
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Owner Type ID:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter owner type ID"
                                        value={formData.ownerTypeId}
                                        onChange={(e) => setFormData({ ...formData, ownerTypeId: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Barangay ID:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter barangay ID"
                                        value={formData.barangayId}
                                        onChange={(e) => setFormData({ ...formData, barangayId: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Street:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter street"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">TIN:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter TIN"
                                        value={formData.tin}
                                        onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Contact No:</label>
                                    <input
                                        type="tel"
                                        className="form-input flex-1"
                                        placeholder="Enter contact number"
                                        value={formData.contactNo}
                                        onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                                    <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">UID:</label>
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Enter UID"
                                        value={formData.uid}
                                        onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
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

export default Person;
