import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { type TeamResponse } from '../../services/team';
import {
    useGetTeamById,
    useCreateTeam,
    useUpdateTeam,
} from '../../hooks/useTeams';
import { 
    useGetTeamMembers, 
    useAddPersonToTeam, 
    useRemovePersonFromTeam 
} from '../../hooks/useTeamMemberships';
import { useGetAllPersons } from '../../hooks/usePersons';
import IconArrowLeft from '../../../../components/Icon/IconArrowLeft';
import IconTrash from '../../../../components/Icon/IconTrash';

type TeamData = TeamResponse;

const TeamForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    const [formData, setFormData] = useState<Partial<TeamData>>({
        name: '',
    });
    const [memberSearch, setMemberSearch] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<Array<{ personId: string; roles: string[] }>>([]); // For create mode

    // TanStack Query hooks
    const { data: teamData, isLoading: isLoadingTeam } = useGetTeamById(id || '', isEdit);
    const createMutation = useCreateTeam();
    const updateMutation = useUpdateTeam();
    
    // Team membership hooks
    const { data: teamMembers = [], isLoading: isLoadingMembers, refetch: refetchMembers } = useGetTeamMembers(id || '', isEdit);
    const { data: allPersons = [] } = useGetAllPersons();
    const addMemberMutation = useAddPersonToTeam();
    const removeMemberMutation = useRemovePersonFromTeam();

    // Load team data if editing
    useEffect(() => {
        if (isEdit && teamData) {
            setFormData(teamData);
        }
    }, [isEdit, teamData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name?.trim()) {
            Swal.fire('Validation Error', 'Team name is required', 'error');
            return;
        }

        try {
            if (isEdit && formData.$id) {
                await updateMutation.mutateAsync({
                    id: formData.$id,
                    data: {
                        name: formData.name || '',
                    },
                });
                Swal.fire('Updated!', 'Team has been updated.', 'success');
            } else {
                // Create team first
                const createResult = await createMutation.mutateAsync({
                    name: formData.name || '',
                });
                
                // If members were selected, add them to the newly created team
                if (selectedMembers.length > 0 && createResult) {
                    const teamId = createResult.$id;
                    let successCount = 0;
                    let failCount = 0;
                    
                    for (const member of selectedMembers) {
                        try {
                            await addMemberMutation.mutateAsync({
                                teamId,
                                personId: member.personId,
                                roles: member.roles,
                            });
                            successCount++;
                        } catch (error) {
                            console.error('Failed to add member:', error);
                            failCount++;
                        }
                    }
                    
                    if (failCount > 0) {
                        Swal.fire(
                            'Partially Created!', 
                            `Team created with ${successCount} members. ${failCount} member(s) failed to add.`, 
                            'warning'
                        );
                    } else {
                        Swal.fire('Created!', `Team has been created with ${successCount} member(s).`, 'success');
                    }
                } else {
                    Swal.fire('Created!', 'Team has been created.', 'success');
                }
            }
            navigate('/users/team');
        } catch (error: any) {
            Swal.fire('Error', error?.message || 'Failed to save', 'error');
        }
    };

    if (isEdit && isLoadingTeam) {
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
                        onClick={() => navigate('/users/team')}
                    >
                        <IconArrowLeft className="w-5 h-5" />
                    </button>
                    <h5 className="font-semibold text-lg dark:text-white-light">
                        {isEdit ? 'Edit Team' : 'Add New Team'}
                    </h5>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                    {/* Team Name */}
                    <div>
                        <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                            Team Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter team name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            A unique name to identify this team
                        </p>
                    </div>
                </div>

                {/* Team Members Section - Show in both create and edit mode */}
                {(isEdit && formData.$id) ? (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">Team Members</h4>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={async () => {
                                    // Filter out persons already in team
                                    const memberIds = teamMembers.map((m: any) => m.$id);
                                    const availablePersons = allPersons.filter(
                                        (p: any) => !memberIds.includes(p.$id)
                                    );

                                    if (availablePersons.length === 0) {
                                        Swal.fire({
                                            icon: 'info',
                                            title: 'No Available Persons',
                                            text: 'All persons are already in this team.',
                                        });
                                        return;
                                    }

                                    const personOptions = availablePersons
                                        .map((p: any) => `<option value="${p.$id}">${p.firstName} ${p.lastName}</option>`)
                                        .join('');

                                    const result = await Swal.fire({
                                        title: 'Add Team Member',
                                        html: `
                                            <div class="text-left">
                                                <label class="block mb-2 text-sm font-medium">Select Person</label>
                                                <select id="person-select" class="form-select w-full">
                                                    <option value="">Choose a person...</option>
                                                    ${personOptions}
                                                </select>
                                                <label class="block mt-4 mb-2 text-sm font-medium">Role in Team</label>
                                                <select id="role-select" class="form-select w-full">
                                                    <option value="member">Member</option>
                                                    <option value="leader">Team Leader</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        `,
                                        showCancelButton: true,
                                        confirmButtonText: 'Add Member',
                                        preConfirm: () => {
                                            const personId = (document.getElementById('person-select') as HTMLSelectElement)?.value;
                                            const role = (document.getElementById('role-select') as HTMLSelectElement)?.value;
                                            if (!personId) {
                                                Swal.showValidationMessage('Please select a person');
                                                return false;
                                            }
                                            return { personId, role };
                                        }
                                    });

                                    if (result.isConfirmed && result.value) {
                                        try {
                                            await addMemberMutation.mutateAsync({
                                                teamId: formData.$id!,
                                                personId: result.value.personId,
                                                roles: [result.value.role],
                                            });
                                            await refetchMembers();
                                            Swal.fire('Success!', 'Member added to team', 'success');
                                        } catch (error: any) {
                                            Swal.fire('Error', error?.message || 'Failed to add member', 'error');
                                        }
                                    }
                                }}
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Member
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage people assigned to this team</p>

                        {/* Search Members */}
                        <div className="mb-4">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search members..."
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                            />
                        </div>

                        {/* Members List */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {isLoadingMembers ? (
                                <div className="p-8 text-center">
                                    <span className="animate-spin border-2 border-primary border-l-transparent rounded-full w-8 h-8 inline-block"></span>
                                </div>
                            ) : (() => {
                                const filteredMembers = teamMembers.filter((member: any) => {
                                    if (!memberSearch) return true;
                                    const searchLower = memberSearch.toLowerCase();
                                    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
                                    const contact = (member.contactNo || '').toLowerCase();
                                    return fullName.includes(searchLower) || contact.includes(searchLower);
                                });

                                if (filteredMembers.length === 0) {
                                    return (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            {memberSearch ? (
                                                <>
                                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <p className="font-medium">No members found</p>
                                                    <p className="text-sm mt-1">Try a different search term</p>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <p className="font-medium">No members yet</p>
                                                    <p className="text-sm mt-1">Click "Add Member" to get started</p>
                                                </>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredMembers.map((member: any) => (
                                            <div key={member.$id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {(member.firstName?.[0] || member.first_name?.[0] || '?').toUpperCase()}
                                                        {(member.lastName?.[0] || member.last_name?.[0] || '').toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                            {member.firstName || member.first_name || 'Unknown'} {member.lastName || member.last_name || ''}
                                                        </div>
                                                        {(member.contactNo || member.contact_no || member.uid) && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {member.contactNo || member.contact_no || member.uid}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {member.status && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            member.status === 'active' 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                        }`}>
                                                            {member.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger ml-3"
                                                    onClick={async () => {
                                                        const confirm = await Swal.fire({
                                                            title: 'Remove Member?',
                                                            text: `Remove ${member.firstName} ${member.lastName} from this team?`,
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#dc2626',
                                                            confirmButtonText: 'Remove',
                                                        });

                                                        if (confirm.isConfirmed) {
                                                            try {
                                                                await removeMemberMutation.mutateAsync({
                                                                    teamId: formData.$id!,
                                                                    personId: member.$id,
                                                                });
                                                                await refetchMembers();
                                                                Swal.fire('Removed!', 'Member removed from team', 'success');
                                                            } catch (error: any) {
                                                                Swal.fire('Error', error?.message || 'Failed to remove member', 'error');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{teamMembers.length}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Total Members</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {teamMembers.filter((m: any) => m.status === 'active').length}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Active</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {teamMembers.filter((m: any) => m.teamIds?.includes(formData.$id || '')).length}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">In Team</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Create Mode: Member Selection */
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">Add Team Members (Optional)</h4>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={async () => {
                                    // Filter out persons already selected
                                    const selectedIds = selectedMembers.map(m => m.personId);
                                    const availablePersons = allPersons.filter(
                                        (p: any) => !selectedIds.includes(p.$id)
                                    );

                                    if (availablePersons.length === 0) {
                                        Swal.fire({
                                            icon: 'info',
                                            title: 'No Available Persons',
                                            text: 'All persons have been added to the list.',
                                        });
                                        return;
                                    }

                                    const personOptions = availablePersons
                                        .map((p: any) => `<option value="${p.$id}">${p.firstName} ${p.lastName}</option>`)
                                        .join('');

                                    const result = await Swal.fire({
                                        title: 'Add Team Member',
                                        html: `
                                            <div class="text-left">
                                                <label class="block mb-2 text-sm font-medium">Select Person</label>
                                                <select id="person-select" class="form-select w-full">
                                                    <option value="">Choose a person...</option>
                                                    ${personOptions}
                                                </select>
                                                <label class="block mt-4 mb-2 text-sm font-medium">Role in Team</label>
                                                <select id="role-select" class="form-select w-full">
                                                    <option value="member">Member</option>
                                                    <option value="leader">Team Leader</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        `,
                                        showCancelButton: true,
                                        confirmButtonText: 'Add Member',
                                        preConfirm: () => {
                                            const personId = (document.getElementById('person-select') as HTMLSelectElement)?.value;
                                            const role = (document.getElementById('role-select') as HTMLSelectElement)?.value;
                                            if (!personId) {
                                                Swal.showValidationMessage('Please select a person');
                                                return false;
                                            }
                                            return { personId, role };
                                        }
                                    });

                                    if (result.isConfirmed && result.value) {
                                        setSelectedMembers(prev => [
                                            ...prev,
                                            { personId: result.value.personId, roles: [result.value.role] }
                                        ]);
                                    }
                                }}
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Member
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select people to add to this team when it's created</p>

                        {/* Selected Members List */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {selectedMembers.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="font-medium">No members selected</p>
                                    <p className="text-sm mt-1">Click "Add Member" to add people to this team</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedMembers.map((member) => {
                                        const person = allPersons.find((p: any) => p.$id === member.personId);
                                        if (!person) return null;
                                        
                                        return (
                                            <div key={member.personId} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {(person.firstName?.[0] || '?').toUpperCase()}
                                                        {(person.lastName?.[0] || '').toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                            {person.firstName} {person.lastName}
                                                        </div>
                                                        {person.contactNo && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {person.contactNo}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {member.roles[0]}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger ml-3"
                                                    onClick={() => {
                                                        setSelectedMembers(prev => prev.filter(m => m.personId !== member.personId));
                                                    }}
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        {selectedMembers.length > 0 && (
                            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">
                                        {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} will be added to this team after creation
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        type="button" 
                        className="btn btn-outline-danger" 
                        onClick={() => navigate('/users/team')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={createMutation.isPending || updateMutation.isPending}
                    >
                        {(createMutation.isPending || updateMutation.isPending) ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4"></span>
                                Saving...
                            </span>
                        ) : (
                            isEdit ? 'Update Team' : 'Create Team'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeamForm;
