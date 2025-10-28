import { DataTable } from 'mantine-datatable';
import { useEffect, useState, useMemo } from 'react';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEdit from '../../../components/Icon/IconEdit';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import Swal from 'sweetalert2';
import { type PropertyNatureResponse } from '../services/propertyNature';
import {
    useGetAllPropertyNatures,
    useCreatePropertyNature,
    useUpdatePropertyNature,
    useDeletePropertyNature,
} from '../hooks/usePropertyNatures';
import { useGetAllBuildingPartRates } from '../hooks/useBuildingPartRates';
import { useGetAllBuildingParts } from '../hooks/useBuildingParts';
import { useGetAllBuildingDepreciations } from '../hooks/useBuildingDepreciations';
import { useGetAllMachineryTypes } from '../hooks/useMachineryTypes';
import { useGetAllMachineryRates } from '../hooks/useMachineryRates';
import { useGetAllProducts } from '../hooks/useProducts';
import { useGetAllSubClassifications } from '../hooks/useSubClassifications';
import { useGetAllSubKinds } from '../hooks/useSubKinds';
import { useGetAllKinds } from '../hooks/useKinds';

type PropertyNatureData = PropertyNatureResponse;

const PropertyNature = () => {
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState<Partial<PropertyNatureData>>({
        name: '',
        building_part_rate_id: '',
        building_depreciation_id: '',
        machinery_type_id: '',
        product_id: '',
        subclass_id: '',
        subkind_id: '',
        status: 'active',
    });

    // TanStack Query hooks
    const { data: propertyNatures = [], isLoading, error } = useGetAllPropertyNatures();
    const { data: buildingPartRates = [] } = useGetAllBuildingPartRates();
    const { data: buildingParts = [] } = useGetAllBuildingParts();
    const { data: buildingDepreciations = [] } = useGetAllBuildingDepreciations();
    const { data: machineryTypes = [] } = useGetAllMachineryTypes();
    const { data: machineryRates = [] } = useGetAllMachineryRates();
    const { data: products = [] } = useGetAllProducts();
    const { data: subClassifications = [] } = useGetAllSubClassifications();
    const { data: subKinds = [] } = useGetAllSubKinds();
    const { data: kinds = [] } = useGetAllKinds();
    
    const createMutation = useCreatePropertyNature();
    const updateMutation = useUpdatePropertyNature();
    const deleteMutation = useDeletePropertyNature();

    // Helper functions to get names from IDs
    const getBuildingPartRateName = (id: string) => {
        const rate = buildingPartRates.find((r: any) => r.$id === id);
        if (!rate) return '-';
        const part = buildingParts.find((p: any) => p.$id === rate.building_parts_id);
        return part?.name || '-';
    };
    const getBuildingPartRateValue = (id: string) => {
        const rate = buildingPartRates.find((r: any) => r.$id === id);
        return rate?.unit_value || 0;
    };
    const getBuildingDepreciationName = (id: string) => buildingDepreciations.find((r: any) => r.$id === id)?.name || '-';
    const getBuildingDepreciationRate = (id: string) => {
        const depreciation = buildingDepreciations.find((r: any) => r.$id === id);
        return depreciation?.rate || 0;
    };
    const getMachineryTypeName = (id: string) => machineryTypes.find((r: any) => r.$id === id)?.name || '-';
    const getMachineryRate = (machineryTypeId: string) => {
        const rate = machineryRates.find((r: any) => r.machinery_type_id === machineryTypeId && r.status === 'active');
        return rate?.rate || 0;
    };
    const getProductName = (id: string) => products.find((r: any) => r.$id === id)?.name || '-';
    const getSubClassificationName = (id: string) => subClassifications.find((r: any) => r.$id === id)?.name || '-';
    const getSubKindName = (id: string) => {
        const subKind = subKinds.find((r: any) => r.$id === id);
        if (!subKind) return '-';
        const kind = kinds.find((k: any) => k.$id === subKind.kind_id);
        return kind?.name || '-';
    };

    // DataTable columns
    const columns = [
        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
            render: (record: PropertyNatureData) => <div className="font-semibold text-primary">{record.name}</div>,
        },
        {
            accessor: 'building_part_rate_id',
            title: 'Building Part Rate',
            render: (record: PropertyNatureData) => <div>{getBuildingPartRateName(record.building_part_rate_id)}</div>,
        },
        {
            accessor: 'product_id',
            title: 'Product',
            render: (record: PropertyNatureData) => <div>{getProductName(record.product_id)}</div>,
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: (record: PropertyNatureData) => (
                <span className={`badge ${record.status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {record.status}
                </span>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (record: PropertyNatureData) => (
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

    const filteredRecords = useMemo(() => {
        if (!search) return propertyNatures;
        return propertyNatures.filter((item) => 
            Object.keys(item).some((key) => 
                String(item[key as keyof PropertyNatureData]).toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [propertyNatures, search]);

    const recordsData = useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return filteredRecords.slice(from, to);
    }, [filteredRecords, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const handleAdd = () => {
        setIsEdit(false);
        setFormData({
            name: '',
            building_part_rate_id: '',
            building_depreciation_id: '',
            machinery_type_id: '',
            product_id: '',
            subclass_id: '',
            subkind_id: '',
            status: 'active',
        });
        setShowModal(true);
    };

    const handleEdit = (record: PropertyNatureData) => {
        setIsEdit(true);
        setFormData({
            $id: record.$id,
            name: record.name,
            building_part_rate_id: record.building_part_rate_id,
            building_depreciation_id: record.building_depreciation_id,
            machinery_type_id: record.machinery_type_id,
            product_id: record.product_id,
            subclass_id: record.subclass_id,
            subkind_id: record.subkind_id,
            status: record.status,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Name is required' });
            return;
        }

        try {
            if (isEdit && formData.$id) {
                await updateMutation.mutateAsync({
                    id: formData.$id,
                    data: {
                        name: formData.name,
                        building_part_rate_id: formData.building_part_rate_id,
                        building_depreciation_id: formData.building_depreciation_id,
                        machinery_type_id: formData.machinery_type_id,
                        product_id: formData.product_id,
                        subclass_id: formData.subclass_id,
                        subkind_id: formData.subkind_id,
                        status: formData.status,
                    },
                });
                Swal.fire({ icon: 'success', title: 'Success', text: 'Property Nature updated successfully', timer: 2000 });
            } else {
                await createMutation.mutateAsync({
                    name: formData.name,
                    building_part_rate_id: formData.building_part_rate_id,
                    building_depreciation_id: formData.building_depreciation_id,
                    machinery_type_id: formData.machinery_type_id,
                    product_id: formData.product_id,
                    subclass_id: formData.subclass_id,
                    subkind_id: formData.subkind_id,
                    status: formData.status || 'active',
                });
                Swal.fire({ icon: 'success', title: 'Success', text: 'Property Nature created successfully', timer: 2000 });
            }
            setShowModal(false);
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred' });
        }
    };

    const handleView = (record: PropertyNatureData) => {
        Swal.fire({
            title: `<span style="color: #1e40af; font-size: 22px; font-weight: 700;">Property Nature Details</span>`,
            html: `
        <div style="text-align: left; padding: 8px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <tbody>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; width: 40%; border-bottom: 1px solid #e5e7eb;">Name</td>
                <td style="padding: 14px 16px; color: #111827; border-bottom: 1px solid #e5e7eb;">${record.name}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Building Part Rate</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
                  ${getBuildingPartRateName(record.building_part_rate_id)}
                  <div style="font-size: 12px; color: #059669; font-weight: 600; margin-top: 4px;">Unit Value: ${getBuildingPartRateValue(record.building_part_rate_id)}</div>
                </td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Building Depreciation</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
                  ${getBuildingDepreciationName(record.building_depreciation_id)}
                  <div style="font-size: 12px; color: #059669; font-weight: 600; margin-top: 4px;">Rate: ${getBuildingDepreciationRate(record.building_depreciation_id)}</div>
                </td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Machinery Type</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
                  ${getMachineryTypeName(record.machinery_type_id)}
                  <div style="font-size: 12px; color: #059669; font-weight: 600; margin-top: 4px;">Rate: ${getMachineryRate(record.machinery_type_id)}</div>
                </td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Product</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${getProductName(record.product_id)}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Sub-Classification</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${getSubClassificationName(record.subclass_id)}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #f9fafb, #ffffff);">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Sub-Kind</td>
                <td style="padding: 14px 16px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${getSubKindName(record.subkind_id)}</td>
              </tr>
              <tr style="background: #ffffff;">
                <td style="padding: 14px 16px; font-weight: 600; color: #374151;">Status</td>
                <td style="padding: 14px 16px;">
                  <span style="padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; ${record.status === 'active' ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'}">${record.status.toUpperCase()}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
            width: '600px',
            showCloseButton: true,
            showConfirmButton: false,
        });
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '<span style="color: #dc2626;">Delete Property Nature?</span>',
            html: '<p style="color: #6b7280;">This action cannot be undone.</p>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Delete',
        });

        if (result.isConfirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                Swal.fire({ icon: 'success', title: 'Deleted!', timer: 2000 });
            } catch (error: any) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message });
            }
        }
    };

    if (error) return <div className="panel"><div className="text-center text-danger">Error: {error.message}</div></div>;

    return (
        <div className="panel">
            <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Property Nature</h5>
                <div className="ltr:ml-auto rtl:mr-auto flex gap-2">
                    <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button type="button" className="btn btn-primary" onClick={handleAdd}>
                        <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        Add New
                    </button>
                </div>
            </div>
            <DataTable
                className="whitespace-nowrap table-hover"
                records={recordsData}
                columns={columns}
                totalRecords={filteredRecords.length}
                recordsPerPage={pageSize}
                page={page}
                onPageChange={setPage}
                recordsPerPageOptions={PAGE_SIZES}
                onRecordsPerPageChange={setPageSize}
                minHeight={200}
                fetching={isLoading}
            />

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[75vh] overflow-hidden">
                        <div className="bg-primary px-6 py-3 border-b">
                            <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit' : 'Add'} Property Nature</h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-4 space-y-1 max-h-[calc(75vh-140px)] overflow-y-auto">
                                <div className="flex items-center gap-4 py-3 border-b hover:bg-gray-50 px-2 rounded">
                                    <label className="w-48 font-semibold">Name:</label>
                                    <input type="text" className="form-input flex-1" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b hover:bg-gray-50 px-2 rounded">
                                    <label className="w-48 font-semibold">Building Part Rate:</label>
                                    <select className="form-select flex-1" value={formData.building_part_rate_id} onChange={(e) => setFormData({ ...formData, building_part_rate_id: e.target.value })}>
                                        <option value="">Select</option>
                                        {buildingPartRates.filter((r: any) => r.status === 'active').map((r: any) => {
                                            const part = buildingParts.find((p: any) => p.$id === r.building_parts_id);
                                            return <option key={r.$id} value={r.$id}>{part?.name || 'Unknown'}</option>;
                                        })}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b hover:bg-gray-50 px-2 rounded">
                                    <label className="w-48 font-semibold">Building Depreciation:</label>
                                    <select className="form-select flex-1" value={formData.building_depreciation_id} onChange={(e) => setFormData({ ...formData, building_depreciation_id: e.target.value })}>
                                        <option value="">Select</option>
                                        {buildingDepreciations.filter((r: any) => r.status === 'active').map((r: any) => <option key={r.$id} value={r.$id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b hover:bg-gray-50 px-2 rounded">
                                    <label className="w-48 font-semibold">Machinery Type:</label>
                                    <select className="form-select flex-1" value={formData.machinery_type_id} onChange={(e) => setFormData({ ...formData, machinery_type_id: e.target.value })}>
                                        <option value="">Select</option>
                                        {machineryTypes.filter((r: any) => r.status === 'active').map((r: any) => <option key={r.$id} value={r.$id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b hover:bg-gray-50 px-2 rounded">
                                    <label className="w-48 font-semibold">Product:</label>
                                    <select className="form-select flex-1" value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}>
                                        <option value="">Select</option>
                                        {products.filter((r: any) => r.status === 'active').map((r: any) => <option key={r.$id} value={r.$id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b hover:bg-gray-50 px-2 rounded">
                                    <label className="w-48 font-semibold">Sub-Classification:</label>
                                    <select className="form-select flex-1" value={formData.subclass_id} onChange={(e) => setFormData({ ...formData, subclass_id: e.target.value })}>
                                        <option value="">Select</option>
                                        {subClassifications.filter((r: any) => r.status === 'active').map((r: any) => <option key={r.$id} value={r.$id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b hover:bg-gray-50 px-2 rounded">
                                    <label className="w-48 font-semibold">Sub-Kind:</label>
                                    <select className="form-select flex-1" value={formData.subkind_id} onChange={(e) => setFormData({ ...formData, subkind_id: e.target.value })}>
                                        <option value="">Select</option>
                                        {subKinds.filter((r: any) => r.status === 'active').map((r: any) => {
                                            const kind = kinds.find((k: any) => k.$id === r.kind_id);
                                            return <option key={r.$id} value={r.$id}>{kind?.name || 'Unknown'}</option>;
                                        })}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded">
                                    <label className="w-48 font-semibold">Status:</label>
                                    <select className="form-select flex-1" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                                <button type="button" className="btn btn-outline-danger" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
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

export default PropertyNature;
