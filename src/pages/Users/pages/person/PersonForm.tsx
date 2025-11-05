import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { type PersonResponse } from '../../services/person';
import {
    useGetAllPersons,
    useGetPersonById,
    useCreatePerson,
    useUpdatePerson,
} from '../../hooks/usePersons';
import { useGetActiveTeams } from '../../hooks/useTeams';
import { 
    usePersonHasUserAccount, 
    useGetPersonWithUserAccount,
    useBindUserAccountToPerson 
} from '../../hooks/usePersonUserBinding';
import IconArrowLeft from '../../../../components/Icon/IconArrowLeft';

type PersonData = PersonResponse;

const PersonForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

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
        teamIds: [],
        userAccountId: '',
    });
    const [similarPersons, setSimilarPersons] = useState<PersonData[]>([]);

    // TanStack Query hooks
    const { data: persons = [] } = useGetAllPersons();
    const { data: personData, isLoading: isLoadingPerson } = useGetPersonById(id || '', isEdit);
    const { data: teams = [], isLoading: isLoadingTeams } = useGetActiveTeams();
    const createMutation = useCreatePerson();
    const updateMutation = useUpdatePerson();
    
    // User account binding hooks
    const { data: hasUserAccount = false, isLoading: isLoadingUserAccount } = usePersonHasUserAccount(id || '', isEdit);
    const { data: personWithAccount, isLoading: isLoadingAccountDetails } = useGetPersonWithUserAccount(id || '', isEdit);
    const bindUserAccountMutation = useBindUserAccountToPerson();

    // Load person data if editing
    useEffect(() => {
        if (isEdit && personData) {
            setFormData(personData);
        }
    }, [isEdit, personData]);

    // Debug: Log teams data
    useEffect(() => {
        console.log('Teams loaded:', teams);
        console.log('Teams loading:', isLoadingTeams);
        console.log('Teams count:', teams.length);
    }, [teams, isLoadingTeams]);

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
                        teamIds: formData.teamIds,
                        userAccountId: formData.userAccountId,
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
                    teamIds: formData.teamIds,
                    userAccountId: formData.userAccountId,
                });
                Swal.fire('Created!', 'Person has been created.', 'success');
            }
            navigate('/users/person');
        } catch (error: any) {
            Swal.fire('Error', error?.message || 'Failed to save', 'error');
        }
    };

    if (isEdit && isLoadingPerson) {
        return (
            <div className="panel">
                <div className="flex items-center justify-center h-64">
                    <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/users/person')}
                    >
                        <IconArrowLeft className="w-5 h-5" />
                    </button>
                    <h5 className="font-semibold text-lg dark:text-white-light">
                        {isEdit ? 'Edit Person' : 'Add New Person'}
                    </h5>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, firstName: value });
                                    // Search for similar persons when typing
                                    if (!isEdit && value.length >= 2) {
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

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Middle Name
                            </label>
                            <input
                                type="text"
                                className="form-input"
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

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
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

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Owner Type ID
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter owner type ID"
                                value={formData.ownerTypeId}
                                onChange={(e) => setFormData({ ...formData, ownerTypeId: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Barangay ID
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter barangay ID"
                                value={formData.barangayId}
                                onChange={(e) => setFormData({ ...formData, barangayId: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Street
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter street"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                TIN
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter TIN"
                                value={formData.tin}
                                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Contact No
                            </label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="Enter contact number"
                                value={formData.contactNo}
                                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                UID
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter UID"
                                value={formData.uid}
                                onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Status
                            </label>
                            <select
                                className="form-select"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Similar Persons Table - Show at bottom when typing */}
                    {!isEdit && similarPersons.length > 0 && (
                        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-start gap-2 mb-3">
                                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Similar Persons Found</h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">The following persons have similar names. You can select and update an existing person instead of creating a duplicate.</p>
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
                                            <th className="px-3 py-2 text-center text-yellow-900 dark:text-yellow-200">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {similarPersons.slice(0, 5).map((person) => (
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
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => navigate(`/users/person/edit/${person.$id}`)}
                                                        title="Select and update this person"
                                                    >
                                                        Select & Update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {similarPersons.length > 5 && (
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2 text-center">
                                        +{similarPersons.length - 5} more similar person(s) found
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Team & User Account Management - Only show in edit mode */}
                    {isEdit && formData.$id && (
                        <div className="mt-6 space-y-6">
                            {/* Team Section */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Team Assignments</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-400">
                                            Assign this person to one or more teams
                                            {isLoadingTeams && <span className="ml-2 text-xs">(Loading teams...)</span>}
                                            {!isLoadingTeams && <span className="ml-2 text-xs">({teams.length} team{teams.length !== 1 ? 's' : ''} available)</span>}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            const currentTeamIds = formData.teamIds || [];
                                            const teamCheckboxes = teams.map(team => {
                                                const isChecked = currentTeamIds.includes(team.$id);
                                                return `
                                                    <div class="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                                                        <input 
                                                            type="checkbox" 
                                                            id="team-${team.$id}" 
                                                            value="${team.$id}"
                                                            ${isChecked ? 'checked' : ''}
                                                            class="form-checkbox"
                                                        />
                                                        <label for="team-${team.$id}" class="cursor-pointer flex-1">${team.name}</label>
                                                    </div>
                                                `;
                                            }).join('');
                                            
                                            Swal.fire({
                                                title: 'Manage Team Assignments',
                                                html: `
                                                    <div class="text-left">
                                                        <label class="block mb-2 text-sm font-medium">Select Teams</label>
                                                        <div class="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-2">
                                                            ${teams.length > 0 ? teamCheckboxes : '<p class="text-sm text-red-500 p-2">No active teams available</p>'}
                                                        </div>
                                                    </div>
                                                `,
                                                width: '500px',
                                                showCancelButton: true,
                                                confirmButtonText: 'Save Teams',
                                                preConfirm: () => {
                                                    const selectedTeamIds: string[] = [];
                                                    teams.forEach(team => {
                                                        const checkbox = document.getElementById(`team-${team.$id}`) as HTMLInputElement;
                                                        if (checkbox && checkbox.checked) {
                                                            selectedTeamIds.push(team.$id);
                                                        }
                                                    });
                                                    return selectedTeamIds;
                                                }
                                            }).then(async (result) => {
                                                if (result.isConfirmed) {
                                                    try {
                                                        const selectedTeamIds = result.value || [];
                                                        // Update the person with the selected team IDs
                                                        await updateMutation.mutateAsync({
                                                            id: formData.$id!,
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
                                                                teamIds: selectedTeamIds,
                                                                userAccountId: formData.userAccountId,
                                                            },
                                                        });
                                                        // Update local form data
                                                        setFormData({ ...formData, teamIds: selectedTeamIds });
                                                        const teamCount = selectedTeamIds.length;
                                                        Swal.fire('Success!', `Person assigned to ${teamCount} team${teamCount !== 1 ? 's' : ''}`, 'success');
                                                    } catch (error: any) {
                                                        Swal.fire('Error', error?.message || 'Failed to update team assignments', 'error');
                                                    }
                                                }
                                            });
                                        }}
                                        disabled={isLoadingTeams || teams.length === 0}
                                    >
                                        Manage Teams
                                    </button>
                                </div>
                                <div className="text-sm text-blue-800 dark:text-blue-300">
                                    {formData.teamIds && formData.teamIds.length > 0 ? (
                                        <div>
                                            <p className="font-medium mb-2">Assigned Teams ({formData.teamIds.length}):</p>
                                            <div className="space-y-2">
                                                {formData.teamIds.map((teamId) => {
                                                    const team = teams.find(t => t.$id === teamId);
                                                    return (
                                                        <div key={teamId} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-700">
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {team?.name || 'Unknown Team'}
                                                                </p>
                                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                                    {teamId}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={async () => {
                                                                    const result = await Swal.fire({
                                                                        title: 'Remove from Team?',
                                                                        text: `Remove from ${team?.name || 'this team'}?`,
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonText: 'Yes, remove',
                                                                        cancelButtonText: 'Cancel'
                                                                    });
                                                                    if (result.isConfirmed) {
                                                                        try {
                                                                            const updatedTeamIds = (formData.teamIds || []).filter(id => id !== teamId);
                                                                            await updateMutation.mutateAsync({
                                                                                id: formData.$id!,
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
                                                                                    teamIds: updatedTeamIds,
                                                                                    userAccountId: formData.userAccountId,
                                                                                },
                                                                            });
                                                                            setFormData({ ...formData, teamIds: updatedTeamIds });
                                                                            Swal.fire('Removed!', 'Person removed from team', 'success');
                                                                        } catch (error: any) {
                                                                            Swal.fire('Error', error?.message || 'Failed to remove from team', 'error');
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="italic">No teams assigned yet</p>
                                    )}
                                </div>
                            </div>

                            {/* User Account Section */}
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            User Account
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-400">
                                            {hasUserAccount ? 'This person has a user account' : 'Create a user account to enable team membership'}
                                        </p>
                                    </div>
                                    {!hasUserAccount && !isLoadingUserAccount && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-success"
                                            onClick={async () => {
                                                const result = await Swal.fire({
                                                    title: 'Create User Account',
                                                    html: `
                                                        <div class="text-left space-y-4">
                                                            <div>
                                                                <label class="block mb-2 text-sm font-medium">Email <span class="text-red-500">*</span></label>
                                                                <input 
                                                                    id="user-email" 
                                                                    type="email" 
                                                                    class="form-input w-full" 
                                                                    placeholder="user@example.com"
                                                                    autocomplete="off"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label class="block mb-2 text-sm font-medium">Password <span class="text-red-500">*</span></label>
                                                                <input 
                                                                    id="user-password" 
                                                                    type="password" 
                                                                    class="form-input w-full" 
                                                                    placeholder="Minimum 8 characters"
                                                                    autocomplete="new-password"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label class="block mb-2 text-sm font-medium">Role <span class="text-red-500">*</span></label>
                                                                <select id="user-role" class="form-select w-full">
                                                                    <option value="">Choose a role...</option>
                                                                    <option value="admin">Administrator</option>
                                                                    <option value="assessor">Assessor</option>
                                                                    <option value="collector">Collector</option>
                                                                    <option value="viewer">Viewer</option>
                                                                </select>
                                                            </div>
                                                            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-800 dark:text-blue-300">
                                                                <strong>Note:</strong> A user account is required for team membership. This will create an Appwrite authentication account.
                                                            </div>
                                                        </div>
                                                    `,
                                                    width: '500px',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Create Account',
                                                    confirmButtonColor: '#059669',
                                                    didOpen: () => {
                                                        // Clear any browser autofill
                                                        const emailInput = document.getElementById('user-email') as HTMLInputElement;
                                                        const passwordInput = document.getElementById('user-password') as HTMLInputElement;
                                                        if (emailInput) emailInput.value = '';
                                                        if (passwordInput) passwordInput.value = '';
                                                    },
                                                    preConfirm: () => {
                                                        const email = (document.getElementById('user-email') as HTMLInputElement)?.value.trim();
                                                        const password = (document.getElementById('user-password') as HTMLInputElement)?.value;
                                                        const role = (document.getElementById('user-role') as HTMLSelectElement)?.value;
                                                        
                                                        if (!email || !password || !role) {
                                                            Swal.showValidationMessage('Please fill in all required fields');
                                                            return false;
                                                        }
                                                        
                                                        if (password.length < 8) {
                                                            Swal.showValidationMessage('Password must be at least 8 characters');
                                                            return false;
                                                        }
                                                        
                                                        // Validate email format
                                                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                        if (!emailRegex.test(email)) {
                                                            Swal.showValidationMessage('Please enter a valid email address');
                                                            return false;
                                                        }
                                                        
                                                        return { email, password, role };
                                                    }
                                                });

                                                if (result.isConfirmed && result.value) {
                                                    try {
                                                        await bindUserAccountMutation.mutateAsync({
                                                            personId: formData.$id!,
                                                            email: result.value.email,
                                                            password: result.value.password,
                                                            role: result.value.role,
                                                        });
                                                        
                                                        Swal.fire({
                                                            icon: 'success',
                                                            title: 'Account Created!',
                                                            html: `
                                                                <p>User account created successfully for <strong>${result.value.email}</strong></p>
                                                                <p class="text-sm text-gray-600 mt-2">This person can now be added to teams.</p>
                                                            `,
                                                            confirmButtonColor: '#059669',
                                                        });
                                                        
                                                        // Refresh person data
                                                        window.location.reload();
                                                    } catch (error: any) {
                                                        Swal.fire({
                                                            icon: 'error',
                                                            title: 'Failed to Create Account',
                                                            text: error?.message || 'An error occurred while creating the user account',
                                                            confirmButtonColor: '#dc2626',
                                                        });
                                                    }
                                                }
                                            }}
                                        >
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Create User Account
                                        </button>
                                    )}
                                </div>
                                <div className="text-sm text-green-800 dark:text-green-300">
                                    {isLoadingUserAccount || isLoadingAccountDetails ? (
                                        <p className="italic">Checking account status...</p>
                                    ) : hasUserAccount && personWithAccount?.userAccount ? (
                                        <div className="bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700 overflow-hidden">
                                            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 p-3 border-b border-green-200 dark:border-green-700">
                                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium">User account is active</p>
                                                    <p className="text-xs text-green-600 dark:text-green-400">This person can be added to teams</p>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {personWithAccount.userAccount.email?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                                {personWithAccount.userAccount.email}
                                                            </span>
                                                            {personWithAccount.userAccount.status === 'verified' && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <span className="capitalize">{personWithAccount.userAccount.role || 'member'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span>Created {new Date(personWithAccount.userAccount.$createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        {personWithAccount.userAccount.lastLogin && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                Last login: {new Date(personWithAccount.userAccount.lastLogin).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                                            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <p className="font-medium text-yellow-800 dark:text-yellow-300">No user account</p>
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400">Create an account to enable team membership</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            type="button" 
                            className="btn btn-outline-danger" 
                            onClick={() => navigate('/users/person')}
                        >
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
                </div>
            </form>
        </div>
        
    );
};

export default PersonForm;
