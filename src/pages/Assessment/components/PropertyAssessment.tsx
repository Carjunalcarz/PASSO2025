import React, { useState } from 'react';
import IconX from '../../../components/Icon/IconX';

interface PropertyAssessmentItem {
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

interface PropertyAssessmentProps {
    // Add any props you need to pass to the component
}

const PropertyAssessment: React.FC<PropertyAssessmentProps> = () => {
    const [items, setItems] = useState<PropertyAssessmentItem[]>([]);
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
        if (items.length >= 1) {
            return; // Don't add more items if we already have one
        }
        const newItem: PropertyAssessmentItem = {
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

    const removeItem = (item: PropertyAssessmentItem) => {
        setItems(items.filter((i) => i.id !== item.id));
    };

    const updateItemValue = (field: keyof PropertyAssessmentItem, value: string, id: string) => {
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
            <h2 className='text-xl px-5 text-wrap text-left mb-6'>PROPERTY ASSESSMENT</h2>
            <div className="table-container">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Actual Use</th>
                            <th style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Market Value</th>
                            <th style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Assessment Level(%)</th>
                            <th style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Assessment Value(PHP)</th>
                            <th style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Effectivity of Assessment/Revision Date</th>
                            <th style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length <= 0 && (
                            <tr>
                                <td colSpan={10} className="!text-center font-semibold">
                                    No Item Available
                                </td>
                            </tr>
                        )}
                        {items.map((item: PropertyAssessmentItem) => (
                            <React.Fragment key={item.id}>
                                {/* First row with building category and type */}
                                <tr>
                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} colSpan={3}>
                                        <select
                                            id={`buildingCategory-${item.id}`}
                                            className="form-select w-full"
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
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} colSpan={4}>
                                        <select
                                            id={`buildingType-${item.id}`}
                                            className="form-select w-full"
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
                                    </td>
                                </tr>
                                {/* Second row with all other fields */}
                                <tr>
                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <input
                                            type="number"
                                            className="form-input w-full"
                                            placeholder="Area"
                                            value={item.area}
                                            onChange={(e) => updateItemValue('area', e.target.value, item.id)}
                                        />
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <input
                                            type="number"
                                            className="form-input w-full"
                                            placeholder="Unit Value"
                                            value={item.unitValue}
                                            onChange={(e) => updateItemValue('unitValue', e.target.value, item.id)}
                                        />
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <input
                                            type="number"
                                            className="form-input w-full"
                                            placeholder="SMV"
                                            value={item.smv}
                                            onChange={(e) => updateItemValue('smv', e.target.value, item.id)}
                                        />
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            placeholder="SMV"
                                            value={item.smv}
                                            onChange={(e) => updateItemValue('smv', e.target.value, item.id)}
                                        />
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <input
                                            type="date"
                                            className="form-input w-full"
                                            placeholder="SMV"
                                            value={item.smv}
                                            onChange={(e) => updateItemValue('smv', e.target.value, item.id)}
                                        />
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <button type="button" onClick={() => removeItem(item)}>
                                            <IconX className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                    <tfoot className="mt-8">
                        <h2 className='px-10 text-wrap text-left'>Sub Total</h2>
                        <tr className="border-t-2 mb-[200px]">
                            <td className="pt-8 font-semibold p-2">{items.reduce((sum, item) => sum + item.area, 0).toFixed(2)}</td>
                            <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="font-semibold p-2">-</td>
                            <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="font-semibold p-2">-</td>
                            <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="font-semibold p-2">{items.reduce((sum, item) => sum + item.baseMarketValue, 0).toFixed(2)}</td>
                            <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="font-semibold p-2">-</td>
                            <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="font-semibold p-2">{items.reduce((sum, item) => sum + item.depreciatorCost, 0).toFixed(2)}</td>
                            <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="font-semibold p-2">{items.reduce((sum, item) => sum + item.marketValue, 0).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="flex justify-between sm:flex-row flex-col mt-6 px-4">
                <div className="sm:mb-0 mb-6">
                    <button
                        type="button"
                        className={`btn btn-primary ${items.length >= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={addItem}
                        disabled={items.length >= 1}
                    >
                        Add Item
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyAssessment;
