import { useState } from 'react';
import { Modal } from '@mantine/core';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

interface Assessment {
    id: string;
    struct_class_type: string;
    category: string;
    smv_year: string;
    smv_code: string;
    smv_name: string;
    date_input: string;
    inputed_by: string;
    increase: number;
    remarks: string;
    unit_cost: number;
}

interface AddUnitCostProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}   

const AddUnitCost = ({ isOpen, onClose, onSuccess}: AddUnitCostProps) => {
    const token = localStorage.getItem('token');
    const [formData, setFormData] = useState<Partial<Assessment>>({
        struct_class_type: '',
        category: 'Residential',
        smv_year: new Date().getFullYear().toString(),
        smv_code: '',
        smv_name: '',
        date_input: new Date().toISOString().split('T')[0],
        inputed_by: '',
        increase: 0,
        remarks: '',
        unit_cost: 0
    });

    const createMutation = useMutation<
        Assessment,
        Error,
        Partial<Assessment>,
        unknown
    >({
        mutationFn: async (data: Partial<Assessment>) => {
            const response = await axios.post(`${import.meta.env.VITE_API_URL_FASTAPI}/unit-cost`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Unit cost created successfully');
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                struct_class_type: '',
                category: 'Residential',
                smv_year: new Date().getFullYear().toString(),
                smv_code: '',
                smv_name: '',
                date_input: new Date().toISOString().split('T')[0],
                inputed_by: '',
                increase: 0,
                remarks: '',
                unit_cost: 0
            });
        },
        onError: (error) => {
            toast.error('Failed to create unit cost: ' + error.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleInputChange = (field: keyof Assessment, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title="Add New Unit Cost"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="struct_class_type">Structural Class Type</label>
                        <input
                            type="text"
                            id="struct_class_type"
                            className="form-input dark:bg-white text-black"
                            value={formData.struct_class_type}
                            onChange={(e) => handleInputChange('struct_class_type', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            className="form-input dark:bg-white text-black"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            required
                        >
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Building">Building</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="smv_year">SMV Year</label>
                        <input
                            type="text"
                            id="smv_year"
                            className="form-input dark:bg-white text-black"
                            value={formData.smv_year}
                            onChange={(e) => handleInputChange('smv_year', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="smv_code">SMV Code</label>
                        <input
                            type="text"
                            id="smv_code"
                            className="form-input dark:bg-white text-black"
                            value={formData.smv_code}
                            onChange={(e) => handleInputChange('smv_code', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="smv_name">SMV Name</label>
                        <input
                            type="text"
                            id="smv_name"
                            className="form-input dark:bg-white text-black"
                            value={formData.smv_name}
                            onChange={(e) => handleInputChange('smv_name', e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="unit_cost">Unit Cost</label>
                        <input
                            type="number"
                            id="unit_cost"
                            className="form-input dark:bg-white text-black"
                            value={formData.unit_cost}
                            onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value) || 0)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date_input">Date Input</label>
                        <input
                            type="date"
                            id="date_input"
                            className="form-input dark:bg-white text-black"
                            value={formData.date_input}
                            onChange={(e) => handleInputChange('date_input', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="inputed_by">Inputed By</label>
                        <input
                            disabled
                            type="text"
                            id="inputed_by"
                            className="form-input dark:bg-white text-black"
                            value={localStorage.getItem('username') || ''}
                            onChange={(e) => handleInputChange('inputed_by', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="increase">Increase</label>
                        <input
                            type="number"
                            id="increase"
                            className="form-input dark:bg-white text-black"
                            value={formData.increase}
                            onChange={(e) => handleInputChange('increase', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="remarks">Remarks</label>
                        <input
                            type="text"
                            id="remarks"
                            className="form-input dark:bg-white text-black"
                            value={formData.remarks}
                            onChange={(e) => handleInputChange('remarks', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={onClose}
                        disabled={createMutation.isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Creating...</span>
                            </div>
                        ) : (
                            <span>Create Unit Cost</span>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddUnitCost;
