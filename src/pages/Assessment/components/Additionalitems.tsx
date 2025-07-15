import React, { useState, useEffect } from 'react';
import IconX from '../../../components/Icon/IconX';
import { useFormContext } from 'react-hook-form';




const additionalItems = {

    "percentageComponents": [
        { "label": "Carport", "percentage": 0.30 },
        { "label": "Mezzanine", "percentage": 0.60 },
        { "label": "Porch", "percentage": 0.40 },
        { "label": "Balcony", "percentage": 0.45 },
        { "label": "Terrace - Covered", "percentage": 0.35 },
        { "label": "Terrace - Open", "percentage": 0.35 },
        { "label": "Garage", "percentage": 0.45 },
        { "label": "Deck Roof - Residential", "percentage": 0.60 },
        { "label": "Deck Roof - Open", "percentage": 0.30 },
        { "label": "Basement - Residential", "percentage": 0.70 },
        { "label": "Basement - High Rise Building", "percentage": 0.20 }
    ],
    "excessHeights": [
        {
            "label": "Excess Height Residential and Commercial",
            "rule": "Add 20% of base unit value per meter in excess of 3 meters",
            "perMeterAddition": 0.20,

        },
        {
            "label": "Excess Height Bodega and Factory",
            "rule": "Add 5% of base unit value per meter in excess of 4.5 meters",
            "perMeterAddition": 0.05,

        }
    ],
    "deductions": [
        {
            "label": "Deductions - Not Painted",
            "rule": "Deduct 10% if the building is not painted",
            "deductPercentage": 0.10
        },
        {
            "label": "Deductions - Second Hand Materials",
            "rule": "Deduct 5% to 10% if second-hand materials are used",
            "deductRange": 0.10
        }
    ],
    "flooring": [
        {
            "label": "Flooring - Vinyl tiles and wood tiles",
            "ratePerSqM": 157.00
        },
        {
            "label": "Flooring - Crazy cut marble",
            "ratePerSqM": 630.00
        },
        {
            "label": "Flooring - Marble (depends on quality)",
            "ratePerSqM": 787.00
        }
    ],
    "wallingAndPartitioning": [
        {
            "label": "Walling and Partitioning - Marble (affected area)",
            "ratePerSqM": 473.00
        },
        {
            "label": "Walling and Partitioning - Synthetic marble and other finish",
            "ratePerSqM": 550.00
        },
        {
            "label": "Walling and Partitioning - Wash out pebbles and other",
            "ratePerSqM": 315.00
        }
    ],
    "septicTank": {
        "label": "Septic Tank",
        "ratePerSqM": 1179.00
    }
}

interface PropertyAppraisalProps {
    register: any
    setValue: any
    watch: any
}
const formatPHP = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

const flattenAdditionalItems = () => {
    const items: { group: string; label: string; value: any }[] = [];

    Object.entries(additionalItems).forEach(([group, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => {
                items.push({ group, label: item.label, value: item });
            });
        } else if (typeof value === 'object' && value !== null) {
            items.push({ group, label: value.label, value });
        }
    });

    return items;
};

interface TableItem {
    id: number;
    label: string;
    value: any;
    quantity: number;
    amount: number;
    description: string;
}

const AdditionalItems: React.FC<PropertyAppraisalProps> = ({ register, setValue, watch }) => {
    const items = flattenAdditionalItems();
    
    // Get current form values
    const selectedLabel = watch("additionalItem");
    const selectedItem = items.find((item) => item.label === selectedLabel);
    const unitValue = watch("generalDescription.unitValue") || 0;

    // Watch the table items from the form
    const tableItems = watch("additionalItems.items") || [];
    const subTotal = watch('additionalItems.subTotal');
    const total = watch('additionalItems.total');
    
    const [nextId, setNextId] = useState(() => {
        // Initialize with max id + 1 from existing items
        const existingItems = tableItems || [];
        return existingItems.length > 0
            ? Math.max(...existingItems.map((item: TableItem) => item.id)) + 1
            : 1;
    });

    // Update subtotal and total whenever table items change
    useEffect(() => {
        const subtotal = tableItems.reduce((sum: number, item: TableItem) => sum + item.amount, 0);
        setValue('additionalItems.subTotal', subtotal);
        setValue('additionalItems.total', subtotal);
    }, [tableItems, setValue]);

    // Add item to table
    const addTableItem = () => {
        if (!selectedItem) return;

        const newItem: TableItem = {
            id: nextId,
            label: selectedItem.label,
            value: selectedItem.value,
            quantity: 1,
            amount: calculateTotal({
                id: nextId,
                label: selectedItem.label,
                value: selectedItem.value,
                quantity: 1,
                amount: 0,
                description: ''
            }),
            description: ''
        };

        // Update the form with the new items array
        const updatedItems = [...tableItems, newItem];
        setValue('additionalItems.items', updatedItems);
        setNextId(nextId + 1);
    };

    // Remove item from table
    const removeTableItem = (id: number) => {
        const updatedItems = tableItems.filter((item: TableItem) => item.id !== id);
        setValue('additionalItems.items', updatedItems);
    };

    // Update item values
    const updateTableItem = (id: number, field: keyof TableItem, value: any) => {
        const updatedItems = tableItems.map((item: TableItem) => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                // Recalculate the amount whenever any field changes
                updatedItem.amount = calculateTotal(updatedItem);
                return updatedItem;
            }
            return item;
        });
        setValue('additionalItems.items', updatedItems);
    };

    // Calculate total for an item
    const calculateTotal = (item: TableItem) => {
        const baseValue = Number(unitValue) || 0;

        // Handle rate per square meter items (flooring, walling, septic tank)
        if (item.value.ratePerSqM) {
            return item.quantity * Number(item.value.ratePerSqM);
        }

        // Handle percentage-based items (percentage components)
        if (item.value.percentage) {
            return item.quantity * (Number(item.value.percentage) * baseValue);
        }

        // Handle excess height calculations
        if (item.value.perMeterAddition) {
            return item.quantity * (Number(item.value.perMeterAddition) * baseValue);
        }

        // Handle deductions
        if (item.value.deductPercentage) {
            return item.quantity * -(baseValue * Number(item.value.deductPercentage));
        }
        if (item.value.deductRange) {
            return item.quantity * -(baseValue * Number(item.value.deductRange));
        }

        return 0;
    };

    // Helper to render value rows
    const renderValueRows = (item: any) => {
        return Object.entries(item.value).map(([key, val]: [string, any]) => {
            if (key === "label") return null;
            if (key === "percentageComponents") return null;

            const numericValue = Number(val);
            const isPercentage = key === "percentage" || key === "perMeterAddition" || key === "deductPercentage";

            return (
                <tr key={key}>
                    <td>{key}</td>
                    <td>
                        {Array.isArray(val)
                            ? val.join(" - ")
                            : !isNaN(numericValue)
                                ? isPercentage
                                    ? `${(numericValue * 100).toFixed(0)}% (${formatPHP(numericValue * unitValue)})`
                                    : formatPHP(numericValue)
                                : val.toString()}
                    </td>
                </tr>
            );
        });
    };

    return (
        <React.Fragment>
            <h2 className='text-xl px-5 text-wrap text-left mb-4'>ADDITIONAL ITEMS</h2>
            <label htmlFor="additionalItem">Select Additional Item:</label>
            <select 
                className='form-input' 
                id="additionalItem" 
                value={selectedLabel || ""}
                onChange={(e) => setValue("additionalItem", e.target.value)}
            >
                <option value="">-- Select an item --</option>
                {items.map((item, idx) => (
                    <option key={idx} value={item.label}>
                        {item.label} ({item.group})
                    </option>
                ))}
            </select>

            {selectedItem && (
                <>
                    <table border={1} style={{ marginTop: 20 }}>
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderValueRows(selectedItem)}
                        </tbody>
                    </table>

                    <button
                        type="button"
                        className="btn btn-primary mt-4"
                        onClick={addTableItem}
                    >
                        Add to Table
                    </button>
                </>
            )}

            {/* Table of selected items */}
            <div className="mt-8">
                <div className="table-responsive">
                    <table className="table-striped">
                        <thead>
                            <tr>
                                <th className='text-center'>Item</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableItems.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="!text-center font-semibold">
                                        No Items Added
                                    </td>
                                </tr>
                            )}
                            {tableItems.map((item: TableItem) => (
                                <tr key={item.id}>
                                    <td>{item.label}</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            value={item.description}
                                            onChange={(e) => updateTableItem(item.id, 'description', e.target.value)}
                                            placeholder="Enter description"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-input w-32"
                                            value={item.quantity}
                                            onChange={(e) => updateTableItem(item.id, 'quantity', Number(e.target.value))}
                                            min={1}
                                        />
                                    </td>
                                    <td>
                                        {item.value.ratePerSqM
                                            ? formatPHP(item.value.ratePerSqM)
                                            : item.value.percentage
                                                ? `${(item.value.percentage * 100).toFixed(0)}%`
                                                : item.value.perMeterAddition
                                                    ? `${(item.value.perMeterAddition * 100).toFixed(0)}% per meter`
                                                    : item.value.deductPercentage
                                                        ? `-${(item.value.deductPercentage * 100).toFixed(0)}%`
                                                        : item.value.deductRange
                                                            ? `-${(item.value.deductRange * 100).toFixed(0)}%`
                                                            : 'N/A'}
                                    </td>
                                    <td>{formatPHP(item.amount)}</td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => removeTableItem(item.id)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            <IconX className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {tableItems.length > 0 && (
                                <tr className="font-bold">
                                    <td colSpan={4} className="text-right">Subtotal:</td>
                                    <td>{formatPHP(subTotal)}</td>
                                    <td></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Make sure the table items array is registered */}
            <input type="hidden" {...register('additionalItems.items')} />
            <input type="hidden" {...register('additionalItems.total')} />
        </React.Fragment>
    );
};

export default AdditionalItems;
