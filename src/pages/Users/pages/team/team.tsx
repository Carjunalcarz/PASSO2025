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
import { type TeamResponse } from '../../services/team';
import { useGetAllTeams, useDeleteTeam } from '../../hooks/useTeams';

type TeamData = TeamResponse;

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

const Team = () => {
    const navigate = useNavigate();
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');

    // TanStack Query hooks
    const { data: teams = [], isLoading, isError, error, refetch } = useGetAllTeams();
    const deleteMutation = useDeleteTeam();

    // Show error toast if query fails
    useEffect(() => {
        if (isError) {
            Swal.fire('Error', error?.message || 'Failed to fetch teams', 'error');
        }
    }, [isError, error]);

    const columns = [
        {
            accessor: '$id',
            title: 'ID',
            sortable: true,
            width: 100,
            render: ({ $id }: TeamData) => (
                <span className="text-xs font-mono">{$id.substring(0, 8)}...</span>
            ),
        },
        {
            accessor: 'name',
            title: 'Team Name',
            sortable: true,
            render: ({ name }: TeamData) => (
                <span className="font-semibold">{name}</span>
            ),
        },
        {
            accessor: 'members',
            title: 'Members',
            sortable: false,
            render: ({ members = [], total }: TeamData) => {
                if (members.length === 0) {
                    return <span className="text-gray-400 italic text-sm">No members</span>;
                }
                
                // Show first 3 members
                const displayMembers = members.slice(0, 3);
                const remainingCount = members.length - 3;
                
                return (
                    <div className="flex flex-wrap gap-1">
                        {displayMembers.map((member: any) => (
                            <span 
                                key={member.$id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                title={`${member.firstName} ${member.lastName}`}
                            >
                                {member.firstName} {member.lastName}
                            </span>
                        ))}
                        {remainingCount > 0 && (
                            <span 
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                title={members.slice(3).map((m: any) => `${m.firstName} ${m.lastName}`).join(', ')}
                            >
                                +{remainingCount} more
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessor: '$createdAt',
            title: 'Created At',
            sortable: true,
            render: ({ $createdAt }: TeamData) => (
                <span className="text-sm">{new Date($createdAt).toLocaleDateString()}</span>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (record: TeamData) => (
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
        if (!search) return teams;

        return teams.filter((item) => {
            return Object.keys(item).some((key) => {
                return String(item[key as keyof TeamData]).toLowerCase().includes(search.toLowerCase());
            });
        });
    }, [teams, search]);

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
            text: 'Team data has been refreshed.',
            timer: 1500,
            showConfirmButton: false,
        });
    };

    const handleAdd = () => {
        navigate('/users/team/add');
    };

    const handleEdit = (record: TeamData) => {
        navigate(`/users/team/edit/${record.$id}`);
    };

    const handleView = (record: TeamData) => {
        const styles = getModalStyles(isDark);
        const members = record.members || [];

        // Build members list HTML
        const membersListHtml = members.length > 0 
            ? members.map((member: any, index: number) => `
                <div style="display: flex; align-items: center; padding: 10px 12px; background: ${index % 2 === 0 ? styles.bgPrimary : styles.bgSecondary}; border-bottom: 1px solid ${styles.borderColor};">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; margin-right: 12px;">
                        ${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: ${styles.valueColor}; font-size: 14px;">
                            ${member.firstName} ${member.lastName}
                        </div>
                        ${member.contactNo ? `<div style="font-size: 12px; color: ${styles.secondaryTextColor};">${member.contactNo}</div>` : ''}
                    </div>
                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${member.status === 'active' ? '#d1fae5' : '#fee2e2'}; color: ${member.status === 'active' ? '#065f46' : '#991b1b'};">
                        ${member.status || 'active'}
                    </span>
                </div>
            `).join('')
            : `<div style="padding: 20px; text-align: center; color: ${styles.secondaryTextColor}; font-style: italic;">No members in this team</div>`;

        const tableRows = [
            { label: 'Team Name', value: record.name, bg: styles.bgPrimary, weight: 600 },
            { label: 'Total Members', value: record.total.toString(), bg: styles.bgSecondary },
        ];

        const rowsHtml = tableRows.map(row => `
            <tr style="background: ${row.bg};">
                <td style="padding: 14px 16px; font-weight: 600; color: ${styles.labelColor}; border-bottom: 1px solid ${styles.borderColor}; width: 40%;">${row.label}</td>
                <td style="padding: 14px 16px; color: ${row.weight ? styles.valueColor : styles.secondaryTextColor}; border-bottom: 1px solid ${styles.borderColor}; ${row.weight ? `font-weight: ${row.weight};` : ''}">${row.value}</td>
            </tr>
        `).join('');

        Swal.fire({
            title: `<strong style="color: ${styles.titleColor};">Team Details</strong>`,
            html: `
                <div class="overflow-x-auto" style="margin-top: 20px;">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${styles.borderColor}; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                        <tbody>
                            ${rowsHtml}
                            <tr style="background: ${styles.bgPrimary};">
                                <td style="padding: 14px 16px; font-weight: 600; color: ${styles.labelColor}; border-bottom: 1px solid ${styles.borderColor};">Team ID</td>
                                <td style="padding: 14px 16px; color: ${styles.secondaryTextColor}; font-family: monospace; font-size: 12px; border-bottom: 1px solid ${styles.borderColor};">${record.$id}</td>
                            </tr>
                            <tr style="background: ${styles.bgSecondary};">
                                <td style="padding: 14px 16px; font-weight: 600; color: ${styles.labelColor}; border-bottom: 1px solid ${styles.borderColor};">Created At</td>
                                <td style="padding: 14px 16px; color: ${styles.secondaryTextColor};">${new Date(record.$createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                            </tr>
                            <tr style="background: ${styles.bgPrimary};">
                                <td style="padding: 14px 16px; font-weight: 600; color: ${styles.labelColor};">Updated At</td>
                                <td style="padding: 14px 16px; color: ${styles.secondaryTextColor};">${new Date(record.$updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Members Section -->
                    <div style="margin-top: 20px;">
                        <h4 style="color: ${styles.titleColor}; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-left: 4px;">Team Members</h4>
                        <div style="border: 1px solid ${styles.borderColor}; border-radius: 8px; overflow: hidden; max-height: 300px; overflow-y: auto;">
                            ${membersListHtml}
                        </div>
                    </div>
                </div>
            `,
            width: '650px',
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
            title: '<span style="color: #dc2626; font-size: 20px; font-weight: 600;">Delete Team?</span>',
            html: `
                <div style="text-align: center;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; margin-bottom: 16px;">
                        <svg style="width: 32px; height: 32px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">This action cannot be undone. The team will be permanently removed.</p>
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
                    html: '<p style="color: #6b7280; font-size: 14px;">Team has been deleted successfully.</p>',
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
                <h5 className="font-semibold text-lg dark:text-white-light">Teams</h5>
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

export default Team;
