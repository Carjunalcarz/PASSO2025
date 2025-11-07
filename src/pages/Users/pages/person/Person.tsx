import { DataTable } from 'mantine-datatable';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import IconTrash from '../../../../components/Icon/IconTrash';
import IconEdit from '../../../../components/Icon/IconEdit';
import IconEye from '../../../../components/Icon/IconEye';
import IconPlus from '../../../../components/Icon/IconPlus';
import IconRefresh from '../../../../components/Icon/IconRefresh';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { type PersonResponse } from '../../services/person';
import { useGetAllPersons, useDeletePerson } from '../../hooks/usePersons';
import { useVerifyUserAccount } from '../../hooks/useAccountVerification';
import { useGetAllTeams } from '../../hooks/useTeams';

type PersonData = PersonResponse;

const getModalStyles = (isDark: boolean) => ({
    bgPrimary: isDark ? 'linear-gradient(to right, #1f2937, #111827)' : 'linear-gradient(to right, #f9fafb, #ffffff)',
    bgSecondary: isDark ? '#111827' : '#ffffff',
    borderColor: isDark ? '#374151' : '#e5e7eb',
    labelColor: isDark ? '#9ca3af' : '#374151',
    valueColor: isDark ? '#d1d5db' : '#111827',
    secondaryTextColor: isDark ? '#9ca3af' : '#6b7280',
    popupBg: isDark ? '#1f2937' : '#ffffff',
    titleColor: isDark ? '#60a5fa' : '#4361ee',
    emptyColor: isDark ? '#6b7280' : '#9ca3af',
});

const formatFieldValue = (value: any, emptyColor: string): string => {
    return value || `<em style="color: ${emptyColor};">N/A</em>`;
};

const Person = () => {
    const navigate = useNavigate();
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');

    // TanStack Query hooks with pagination
    const { data: personsData, isLoading, isError, error, refetch } = useGetAllPersons({
        limit: 1000, // Fetch all for client-side pagination (or implement server-side)
        offset: 0
    });
    const persons = personsData?.data || [];
    const totalPersons = personsData?.total || 0;
    const { data: teams = [] } = useGetAllTeams();
    const deleteMutation = useDeletePerson();
    const verifyMutation = useVerifyUserAccount();

    // Helper function to get team names from teamIds
    const getTeamNames = (teamIds?: string[]) => {
        if (!teamIds || teamIds.length === 0) return null;
        return teamIds
            .map(teamId => teams.find((t: any) => t.$id === teamId)?.name)
            .filter(Boolean)
            .join(', ');
    };

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
            accessor: 'email',
            title: 'Email',
            sortable: true,
            render: ({ email, userAccountId }: PersonData) => {
                if (!userAccountId) {
                    return <span className="text-gray-400 text-sm italic">No account</span>;
                }
                return email ? (
                    <span className="text-sm">{email}</span>
                ) : (
                    <span className="text-gray-400 text-sm italic">—</span>
                );
            },
        },
        {
            accessor: 'tin',
            title: 'TIN',
            sortable: true,
        },
        {
            accessor: 'teamIds',
            title: 'Teams',
            sortable: false,
            render: (record: PersonData) => {
                const teamNames = getTeamNames(record.teamIds);
                if (!teamNames) {
                    return <span className="text-gray-400 text-xs italic">No teams</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {record.teamIds?.map(teamId => {
                            const team = teams.find((t: any) => t.$id === teamId);
                            return team ? (
                                <span key={teamId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {team.name}
                                </span>
                            ) : null;
                        })}
                    </div>
                );
            },
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
            accessor: 'userAccountId',
            title: 'User Account',
            sortable: false,
            render: (record: PersonData) => {
                if (!record.userAccountId) {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            No Account
                        </span>
                    );
                }
                
                // Check if verified using the accountVerified field
                const isVerified = record.accountVerified === true;
                
                return (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        isVerified 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            {isVerified ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            )}
                        </svg>
                        {isVerified ? 'Verified' : 'Unverified'}
                    </span>
                );
            },
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

    const handleRefresh = async () => {
        setSearch('');
        setPage(1);
        await refetch();
        Swal.fire({
            icon: 'success',
            title: 'Refreshed!',
            text: 'Person data has been refreshed.',
            timer: 1500,
            showConfirmButton: false,
        });
    };

    const handleAdd = () => {
        navigate('/users/person/add');
    };

    const handleEdit = (record: PersonData) => {
        navigate(`/users/person/edit/${record.$id}`);
    };

    const handleView = (record: PersonData) => {
        const styles = getModalStyles(isDark);
        const statusStyle = record.status === 'active' 
            ? 'background: #d1fae5; color: #065f46;' 
            : 'background: #fee2e2; color: #991b1b;';

        const teamNames = getTeamNames(record.teamIds);
        const teamBadges = record.teamIds?.map(teamId => {
            const team = teams.find((t: any) => t.$id === teamId);
            return team ? `<span style="display: inline-block; margin: 2px 4px 2px 0; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #dbeafe; color: #1e40af;">${team.name}</span>` : '';
        }).join('') || `<em style="color: ${styles.emptyColor};">No teams</em>`;

        const tableRows = [
            { label: 'First Name', value: record.firstName, bg: styles.bgPrimary, weight: 500 },
            { label: 'Middle Name', value: formatFieldValue(record.middleName, styles.emptyColor), bg: styles.bgPrimary },
            { label: 'Last Name', value: record.lastName, bg: styles.bgSecondary, weight: 500 },
            { label: 'Owner Type ID', value: formatFieldValue(record.ownerTypeId, styles.emptyColor), bg: styles.bgPrimary },
            { label: 'Barangay ID', value: formatFieldValue(record.barangayId, styles.emptyColor), bg: styles.bgSecondary },
            { label: 'Street', value: formatFieldValue(record.street, styles.emptyColor), bg: styles.bgPrimary },
            { label: 'TIN', value: formatFieldValue(record.tin, styles.emptyColor), bg: styles.bgSecondary },
            { label: 'Contact No', value: formatFieldValue(record.contactNo, styles.emptyColor), bg: styles.bgPrimary },
            { label: 'UID', value: formatFieldValue(record.uid, styles.emptyColor), bg: styles.bgSecondary, mono: true },
            { label: 'Teams', value: teamBadges, bg: styles.bgPrimary, html: true },
        ];

        const rowsHtml = tableRows.map(row => `
            <tr style="background: ${row.bg};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${styles.labelColor}; border-bottom: 1px solid ${styles.borderColor}; width: 40%;">${row.label}</td>
                <td style="padding: 14px 16px; color: ${row.weight ? styles.valueColor : styles.secondaryTextColor}; border-bottom: 1px solid ${styles.borderColor}; ${row.weight ? `font-weight: ${row.weight};` : ''} ${row.mono ? 'font-family: monospace; font-size: 12px;' : ''}">${row.value}</td>
            </tr>
        `).join('');

        Swal.fire({
            title: `<strong style="color: ${styles.titleColor};">Person Details</strong>`,
            html: `
                <div class="overflow-x-auto" style="margin-top: 20px;">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${styles.borderColor}; border-radius: 8px; overflow: hidden;">
                        <tbody>
                            ${rowsHtml}
                            <tr style="background: ${styles.bgSecondary};">
                                <td style="padding: 14px 16px; font-weight: 600; color: ${styles.labelColor}; border-bottom: 1px solid ${styles.borderColor};">Status</td>
                                <td style="padding: 14px 16px; border-bottom: 1px solid ${styles.borderColor};">
                                    <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; ${statusStyle}">${record.status.toUpperCase()}</span>
                                </td>
                            </tr>
                            <tr style="background: ${styles.bgPrimary};">
                                <td style="padding: 14px 16px; font-weight: 600; color: ${styles.labelColor}; border-bottom: 1px solid ${styles.borderColor};">Document ID</td>
                                <td style="padding: 14px 16px; color: ${styles.secondaryTextColor}; font-family: monospace; font-size: 12px; border-bottom: 1px solid ${styles.borderColor};">${record.$id}</td>
                            </tr>
                            <tr style="background: ${styles.bgSecondary};">
                                <td style="padding: 14px 16px; font-weight: 600; color: ${styles.labelColor};">Created At</td>
                                <td style="padding: 14px 16px; color: ${styles.secondaryTextColor};">${new Date(record.$createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `,
            width: '600px',
            showCloseButton: true,
            showConfirmButton: false,
            background: styles.popupBg,
            customClass: {
                popup: 'swal2-rounded',
                title: 'swal2-title-custom',
                closeButton: isDark ? 'swal2-close-dark' : ''
            }
        });
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
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
                confirmButton: 'px-6 py-2.5 rounded-lg font-medium',
                cancelButton: 'px-6 py-2.5 rounded-lg font-medium',
            },
        });

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
                    customClass: {
                        popup: 'rounded-xl shadow-2xl',
                        confirmButton: 'px-6 py-2.5 rounded-lg font-medium',
                    },
                });
            }
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
                    <button 
                        type="button" 
                        className="btn btn-info" 
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <IconRefresh className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Refresh
                    </button>
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
        </div>
    );
};

export default Person;
