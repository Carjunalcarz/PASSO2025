import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import {
  getAllBuildingParts,
  createBuildingPart,
  updateBuildingPart,
  deleteBuildingPart,
  BuildingPartResponse,
} from '../services/buildingPart';
import {
  getAllBuildingComponents,
  BuildingComponentResponse,
} from '../services/buildingComponent';

interface BuildingPartsData {
  $id?: string;
  name: string;
  description?: string;
  status: string;
  building_components_id: string;
  $createdAt?: string;
  $updatedAt?: string;
}

const BuildingParts = () => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState<BuildingPartsData[]>([]);
  const [recordsData, setRecordsData] = useState<BuildingPartsData[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BuildingPartsData[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<BuildingComponentResponse[]>([]);
  const [formData, setFormData] = useState<Partial<BuildingPartsData>>({
    name: '',
    description: '',
    building_components_id: '',
    status: 'active',
  });

  // Fetch building components for dropdown
  const fetchBuildingComponents = async () => {
    try {
      const response = await getAllBuildingComponents();
      if (response.success && response.data) {
        setComponents(response.data);
      }
    } catch (error) {
      console.error('Error fetching building components:', error);
    }
  };

  // Fetch data from Appwrite
  const fetchBuildingParts = async () => {
    setLoading(true);
    try {
      const response = await getAllBuildingParts();
      if (response.success && response.data) {
        setInitialRecords(response.data as BuildingPartsData[]);
      } else {
        Swal.fire('Error', response.error || 'Failed to fetch building parts', 'error');
      }
    } catch (error) {
      console.error('Error fetching building parts:', error);
      Swal.fire('Error', 'An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get component name by ID
  const getComponentName = (componentId: string) => {
    const component = components.find(c => c.$id === componentId);
    return component ? component.name : componentId;
  };

  const columns = [
    {
      accessor: 'name',
      title: 'Part Name',
      sortable: true,
    },
    {
      accessor: 'description',
      title: 'Description',
      sortable: true,
    },
    {
      accessor: 'building_components_id',
      title: 'Component',
      sortable: true,
      render: ({ building_components_id }: BuildingPartsData) => (
        <span>{getComponentName(building_components_id)}</span>
      ),
    },
    {
      accessor: 'status',
      title: 'Status',
      sortable: true,
      render: ({ status }: BuildingPartsData) => (
        <span className={`badge ${status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
          {status}
        </span>
      ),
    },
    {
      accessor: '$createdAt',
      title: 'Created At',
      sortable: true,
      render: ({ $createdAt }: BuildingPartsData) => (
        <span>{$createdAt ? new Date($createdAt).toLocaleDateString() : ''}</span>
      ),
    },
    {
      accessor: 'actions',
      title: 'Actions',
      titleClassName: '!text-center',
      render: (record: BuildingPartsData) => (
        <div className="flex items-center justify-center gap-2">
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleView(record)}>
            <IconEye />
          </button>
          <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(record)}>
            <IconEdit />
          </button>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(record.$id!)}>
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchBuildingComponents();
    fetchBuildingParts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

  useEffect(() => {
    if (!search) {
      setFilteredRecords(initialRecords);
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      setRecordsData(initialRecords.slice(from, to));
    } else {
      const filtered = initialRecords.filter((item) => {
        const componentName = getComponentName(item.building_components_id).toLowerCase();
        const searchLower = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          componentName.includes(searchLower) ||
          item.status.toLowerCase().includes(searchLower)
        );
      });
      setFilteredRecords(filtered);
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      setRecordsData(filtered.slice(from, to));
    }
  }, [search, initialRecords, page, pageSize, components]);

  const handleAdd = () => {
    setIsEdit(false);
    setFormData({ name: '', description: '', building_components_id: '', status: 'active' });
    setShowModal(true);
  };

  const handleEdit = (record: BuildingPartsData) => {
    setIsEdit(true);
    setFormData(record);
    setShowModal(true);
  };

  const handleView = (record: BuildingPartsData) => {
    Swal.fire({
      title: '<strong style="color: #4361ee;">Building Part Details</strong>',
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
                    Part Name
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #111827; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${record.name}</td>
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
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${record.description || '<em style="color: #9ca3af;">No description</em>'}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Component
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #111827; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${getComponentName(record.building_components_id)}</td>
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
                <td style="padding: 14px 16px; font-weight: 600; color: #374151;">
                  <span style="display: flex; align-items: center;">
                    <svg style="width: 18px; height: 18px; margin-right: 8px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Created At
                  </span>
                </td>
                <td style="padding: 14px 16px; color: #6b7280;">${record.$createdAt ? new Date(record.$createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '<em style="color: #9ca3af;">N/A</em>'}</td>
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
    if (result.isConfirmed) {
      setLoading(true);
      const response = await deleteBuildingPart(id);
      if (response.success) {
        Swal.fire('Deleted!', 'Building part has been deleted.', 'success');
        fetchBuildingParts();
      } else {
        Swal.fire('Error', response.error || 'Failed to delete building part', 'error');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isEdit && formData.$id) {
      const response = await updateBuildingPart(formData.$id, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        building_components_id: formData.building_components_id,
      });
      if (response.success) {
        Swal.fire('Updated!', 'Building part has been updated.', 'success');
        fetchBuildingParts();
        setShowModal(false);
      } else {
        Swal.fire('Error', response.error || 'Failed to update building part', 'error');
      }
    } else {
      const response = await createBuildingPart({
        name: formData.name!,
        description: formData.description,
        status: formData.status!,
        building_components_id: formData.building_components_id!,
      });
      if (response.success) {
        Swal.fire('Created!', 'Building part has been created.', 'success');
        fetchBuildingParts();
        setShowModal(false);
      } else {
        Swal.fire('Error', response.error || 'Failed to create building part', 'error');
      }
    }
    setLoading(false);
  };

  return (
    <div className="panel">
      <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
        <h5 className="font-semibold text-lg dark:text-white-light">Building Parts</h5>
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
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
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
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[75vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-primary px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Building Part</h3>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-1 max-h-[calc(75vh-140px)] overflow-y-auto">
                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                  <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Part Name:</label>
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Enter part name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                  <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Description:</label>
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded">
                  <label className="w-36 font-semibold text-gray-700 dark:text-gray-300">Component:</label>
                  <select
                    className="form-select flex-1"
                    value={formData.building_components_id}
                    onChange={(e) => setFormData({ ...formData, building_components_id: e.target.value })}
                    required
                  >
                    <option value="">Select Component</option>
                    {components
                      .filter((component) => component.status === 'active')
                      .map((component) => (
                        <option key={component.$id} value={component.$id}>
                          {component.name}
                        </option>
                      ))}
                  </select>
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
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingParts;
