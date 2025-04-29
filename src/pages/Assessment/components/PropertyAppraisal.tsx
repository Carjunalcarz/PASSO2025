import React, { useState } from 'react';
import IconX from '../../../components/Icon/IconX';

interface PropertyAppraisalItem {
    id: string;
    area: number;
    unitValue: number;
    smv: number;
    baseMarketValue: number;
    depreciationPercentage: number;
    depreciatorCost: number;
    marketValue: number;
}

// Add new interfaces for the dropdown options
interface BuildingCoreCategory {
    id: string;
    name: string;
}

interface BuildingType {
    id: string;
    name: string;
}

interface PropertyAppraisalProps {
    // Add any props you need to pass to the component
}

const PropertyAppraisal: React.FC<PropertyAppraisalProps> = () => {
    const [items, setItems] = useState<PropertyAppraisalItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    // Sample data for dropdowns - you can replace these with your actual data
    const buildingCategories: BuildingCoreCategory[] = [
        { id: '1', name: 'Residential' },
        { id: '2', name: 'Commercial' },
        { id: '3', name: 'Industrial' },
        { id: '4', name: 'Mixed-Use' },
    ];

    const buildingTypes: BuildingType[] = [
        { id: '1', name: 'Single Family' },
        { id: '2', name: 'Multi Family' },
        { id: '3', name: 'Office Building' },
        { id: '4', name: 'Retail Space' },
        { id: '5', name: 'Warehouse' },
    ];

    const addItem = () => {
        const newItem: PropertyAppraisalItem = {
            id: (Math.random() + 1).toString(36).substring(7),
            area: 0,
            unitValue: 0,
            smv: 0,
            baseMarketValue: 0,
            depreciationPercentage: 0,
            depreciatorCost: 0,
            marketValue: 0
        };
        setItems([...items, newItem]);
    };

    const removeItem = (item: PropertyAppraisalItem) => {
        setItems(items.filter((i) => i.id !== item.id));
    };

    const updateItemValue = (field: keyof PropertyAppraisalItem, value: string, id: string) => {
        const numValue = parseFloat(value) || 0;
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: numValue };
                    // Calculate dependent values
                    updatedItem.baseMarketValue = updatedItem.area * updatedItem.unitValue;
                    updatedItem.depreciatorCost = updatedItem.baseMarketValue * (updatedItem.depreciationPercentage / 100);
                    updatedItem.marketValue = updatedItem.baseMarketValue - updatedItem.depreciatorCost;
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.marketValue, 0);
    };

    return (
        <div className="px-10">
            <h2 className='text-xl px-5 text-wrap text-left mb-6'>GENERAL DESCRIPTION</h2>

            {/* Add new dropdown section */}
            <div className="grid grid-cols-2 gap-4 mb-6 px-5">
                <div>
                    <label htmlFor="buildingCategory" className="block text-sm font-medium mb-2">
                        Building Core Category
                    </label>
                    <select
                        id="buildingCategory"
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {buildingCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="buildingType" className="block text-sm font-medium mb-2">
                        Building Type
                    </label>
                    <select
                        id="buildingType"
                        className="form-select"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="">Select Type</option>
                        {buildingTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Area</th>
                            <th>Unit Value</th>
                            <th>SMV</th>
                            <th>Base Market Value</th>
                            <th>% Depn</th>
                            <th>Depreciator Cost (PHP)</th>
                            <th>Market Value</th>
                            <th className="w-1"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length <= 0 && (
                            <tr>
                                <td colSpan={8} className="!text-center font-semibold">
                                    No Item Available
                                </td>
                            </tr>
                        )}
                        {items.map((item: PropertyAppraisalItem) => (
                            <tr className="align-top" key={item.id}>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input w-32"
                                        placeholder="Area"
                                        value={item.area}
                                        onChange={(e) => updateItemValue('area', e.target.value, item.id)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input w-32"
                                        placeholder="Unit Value"
                                        value={item.unitValue}
                                        onChange={(e) => updateItemValue('unitValue', e.target.value, item.id)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input w-32"
                                        placeholder="SMV"
                                        value={item.smv}
                                        onChange={(e) => updateItemValue('smv', e.target.value, item.id)}
                                    />
                                </td>
                                <td>
                                    <div className="w-32">{item.baseMarketValue.toFixed(2)}</div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input w-32"
                                        placeholder="% Depn"
                                        value={item.depreciationPercentage}
                                        onChange={(e) => updateItemValue('depreciationPercentage', e.target.value, item.id)}
                                    />
                                </td>
                                <td>
                                    <div className="w-32">{item.depreciatorCost.toFixed(2)}</div>
                                </td>
                                <td>
                                    <div className="w-32">{item.marketValue.toFixed(2)}</div>
                                </td>
                                <td>
                                    <button type="button" onClick={() => removeItem(item)}>
                                        <IconX className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between sm:flex-row flex-col mt-6 px-4">
                <div className="sm:mb-0 mb-6">
                    <button type="button" className="btn btn-primary" onClick={addItem}>
                        Add Item
                    </button>
                </div>
                <div className="sm:w-2/5">
                    <div className="flex items-center justify-between">
                        <div>Subtotal</div>
                        <div>${calculateTotal().toFixed(2)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div>Tax(%)</div>
                        <div>0%</div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div>Shipping Rate($)</div>
                        <div>$0.00</div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div>Discount(%)</div>
                        <div>0%</div>
                    </div>
                    <div className="flex items-center justify-between mt-4 font-semibold">
                        <div>Total</div>
                        <div>${calculateTotal().toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyAppraisal;
