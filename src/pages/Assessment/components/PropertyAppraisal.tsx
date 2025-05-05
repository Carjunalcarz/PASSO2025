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
    constructionType?: string;
    usage?: string;
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

const constructionCosts: Record<string, Record<string, number | null>> = {
    'I-A': {
        residential: 1700,
        accessoria: 0,
        apartment: 0,
        garage: 2370,
        school: 2540,
        hotel: 3670,
        theatre: 3730,
        restaurant: 2470,
        factory: 1730,
        gym: 2470,
        bowling_lanes: 3260,
        mills: 2710,
        swimming_pools: null,
        gas_station: null,
        animal_shed: 990
    },
    'I-B': {
        residential: 4500,
        accessoria: 2940,
        apartment: 2940,
        garage: 2370,
        school: 2540,
        hotel: 3960,
        theatre: 3970,
        restaurant: 2670,
        factory: 1930,
        gym: 2670,
        bowling_lanes: 3080,
        mills: 1760,
        swimming_pools: null,
        gas_station: null,
        animal_shed: 1300
    },
    'II-A': {
        residential: 3400,
        accessoria: 2640,
        apartment: 2700,
        garage: 2150,
        school: 2070,
        hotel: 3350,
        theatre: 3410,
        restaurant: 2370,
        factory: 1530,
        gym: 2370,
        bowling_lanes: 3190,
        mills: 3110,
        swimming_pools: 2680,
        gas_station: null,
        animal_shed: 1160
    },
    'II-B': {
        residential: 4300,
        accessoria: 3580,
        apartment: 3700,
        garage: 3160,
        school: 3020,
        hotel: 4260,
        theatre: 4320,
        restaurant: 3270,
        factory: 2430,
        gym: 3270,
        bowling_lanes: 4190,
        mills: 3710,
        swimming_pools: null,
        gas_station: null,
        animal_shed: null
    },
    'III-A': {
        residential: 3800,
        accessoria: 3280,
        apartment: 3300,
        garage: 2700,
        school: 2800,
        hotel: 3870,
        theatre: 3930,
        restaurant: 2870,
        factory: 2030,
        gym: 2870,
        bowling_lanes: 5300,
        mills: 4280,
        swimming_pools: null,
        gas_station: null,
        animal_shed: null
    },
    'III-B': {
        residential: 5300,
        accessoria: 4910,
        apartment: 4600,
        garage: 4200,
        school: 3980,
        hotel: 5290,
        theatre: 5350,
        restaurant: 4290,
        factory: 3450,
        gym: 4290,
        bowling_lanes: null,
        mills: null,
        swimming_pools: null,
        gas_station: null,
        animal_shed: null
    },
    'IV-A': {
        residential: 4900,
        accessoria: 4200,
        apartment: 3900,
        garage: 3730,
        school: 3490,
        hotel: 4800,
        theatre: 4860,
        restaurant: 3800,
        factory: 2960,
        gym: 3800,
        bowling_lanes: null,
        mills: null,
        swimming_pools: null,
        gas_station: null,
        animal_shed: null
    },
    'IV-B': {
        residential: 5500,
        accessoria: 5910,
        apartment: 6500,
        garage: 5170,
        school: 4970,
        hotel: 5820,
        theatre: 5880,
        restaurant: 4820,
        factory: 3980,
        gym: 4820,
        bowling_lanes: null,
        mills: null,
        swimming_pools: null,
        gas_station: 5000,
        animal_shed: null
    },
    'V-A': {
        residential: 5400,
        accessoria: 5600,
        apartment: 6000,
        garage: 4910,
        school: 5920,
        hotel: null,
        theatre: null,
        restaurant: null,
        factory: null,
        gym: null,
        bowling_lanes: 8670,
        mills: 6150,
        swimming_pools: 3590,
        gas_station: 5000,
        animal_shed: null
    },
    'V-B': {
        residential: null,
        accessoria: null,
        apartment: null,
        garage: null,
        school: null,
        hotel: null,
        theatre: 7660,
        restaurant: 5190,
        factory: 4160,
        gym: 4800,
        bowling_lanes: 7560,
        mills: 5600,
        swimming_pools: 3350,
        gas_station: 3850,
        animal_shed: null
    }
};

const formatPHP = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

const PropertyAppraisal: React.FC = () => {
    const [items, setItems] = useState<PropertyAppraisalItem[]>([]);

    const constructionTypes = Object.keys(constructionCosts);

    const addItem = () => {
        setItems([
            ...items,
            {
                id: (Math.random() + 1).toString(36).substring(7),
                area: 0,
                unitValue: 0,
                smv: 100,
                baseMarketValue: 0,
                depreciationPercentage: 12,
                depreciatorCost: 0,
                marketValue: 0,
                constructionType: '',
                usage: ''
            }
        ]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItemValue = (field: keyof PropertyAppraisalItem, value: string, id: string) => {
        let numValue = parseFloat(value) || 0;
        if (field === 'depreciationPercentage') {
            if (numValue < 0) numValue = 0;
            if (numValue > 100) numValue = 100;
        }
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: numValue };
                updatedItem.baseMarketValue = updatedItem.area * updatedItem.unitValue;
                updatedItem.depreciatorCost = updatedItem.baseMarketValue * (updatedItem.depreciationPercentage / 100);
                updatedItem.marketValue = updatedItem.baseMarketValue - updatedItem.depreciatorCost;
                return updatedItem;
            }
            return item;
        }));
    };

    return (
        <div className="px-10">
            <h2 className='text-xl px-5 text-wrap text-left mb-6'>PROPERTY APPRAISAL</h2>
            <div className="table-responsive">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="p-2 text-right font-semibold w-[10%]">Construction Type</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Usage</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Area</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Unit Value</th>
                            <th className="p-2 text-center font-semibold w-[10%]">SMV</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Base Market Value</th>
                            <th className="p-2 text-center font-semibold w-[10%]">% Depn</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Depreciator Cost (PHP)</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Market Value</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={10} className="!text-center font-semibold">
                                    No Item Available
                                </td>
                            </tr>
                        )}
                        {items.map((item, idx) => (
                            <tr key={item.id}>
                                <td>
                                    <select
                                        className="form-select w-full"
                                        value={item.constructionType || ''}
                                        onChange={e => {
                                            const newType = e.target.value;
                                            setItems(items.map((it, i) =>
                                                i === idx
                                                    ? { ...it, constructionType: newType, usage: '', unitValue: 0 }
                                                    : it
                                            ));
                                        }}
                                    >
                                        <option value="">Select Construction Type</option>
                                        {constructionTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        className="form-select w-full"
                                        value={item.usage || ''}
                                        onChange={e => {
                                            const usage = e.target.value;
                                            let unitValue = 0;
                                            if (item.constructionType && constructionCosts[item.constructionType]) {
                                                const value = constructionCosts[item.constructionType][usage];
                                                unitValue = value ?? 0;
                                            }
                                            setItems(items.map((it, i) =>
                                                i === idx
                                                    ? { ...it, usage, unitValue }
                                                    : it
                                            ));
                                        }}
                                        disabled={!item.constructionType}
                                    >
                                        <option value="">Select Usage</option>
                                        {item.constructionType && Object.keys(constructionCosts[item.constructionType])
                                            .filter(usage => constructionCosts[item.constructionType][usage] !== null)
                                            .map(usage => (
                                                <option key={usage} value={usage}>{usage}</option>
                                            ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input w-full"
                                        placeholder="Area"
                                        value={item.area}
                                        onChange={e => updateItemValue('area', e.target.value, item.id)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input w-full"
                                        placeholder="Unit Value"
                                        value={item.unitValue}
                                        onChange={e => updateItemValue('unitValue', e.target.value, item.id)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input w-full"
                                        placeholder="SMV %"
                                        value={item.smv}
                                        onChange={e => updateItemValue('smv', e.target.value, item.id)}
                                        min={0}
                                        max={100}
                                    />
                                </td>
                                <td>
                                    <div>{formatPHP(item.baseMarketValue)}</div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input w-full"
                                        placeholder="Depn %"
                                        value={item.depreciationPercentage}
                                        onChange={e => updateItemValue('depreciationPercentage', e.target.value, item.id)}
                                        min={0}
                                        max={100}
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <div>{formatPHP(item.depreciatorCost)}</div>
                                </td>
                                <td>
                                    <div>{formatPHP(item.marketValue)}</div>
                                </td>
                                <td>
                                    <button type="button" onClick={() => removeItem(item.id)}>
                                        <IconX className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 bg-gray-100">
                            <th className="p-2 text-right font-semibold w-[10%]">Construction Type</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Usage</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Area</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Unit Value</th>
                            <th className="p-2 text-center font-semibold w-[10%]">SMV</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Base Market Value</th>
                            <th className="p-2 text-center font-semibold w-[10%]">% Depn</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Depreciator Cost (PHP)</th>
                            <th className="p-2 text-right font-semibold w-[10%]">Market Value</th>
                            <th></th>
                        </tr>
                        <tr className="bg-gray-50">
                            <td></td>
                            <td></td>
                            <td className="p-2 text-right font-bold">{items.reduce((sum, item) => sum + item.area, 0).toFixed(2)}</td>
                            <td className="p-2 text-right font-bold">{items.reduce((sum, item) => sum + item.unitValue, 0).toFixed(2)}</td>
                            <td className="p-2 text-center text-gray-400 align-middle">100%</td>
                            <td className="p-2 text-right font-bold">{formatPHP(items.reduce((sum, item) => sum + item.baseMarketValue, 0))}</td>
                            <td className="p-2 text-center text-gray-400 align-middle">12%</td>
                            <td className="p-2 text-right font-bold">{formatPHP(items.reduce((sum, item) => sum + item.depreciatorCost, 0))}</td>
                            <td className="p-2 text-right font-bold">{formatPHP(items.reduce((sum, item) => sum + item.marketValue, 0))}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="flex justify-between sm:flex-row flex-col mt-6 px-4">
                <div className="sm:mb-0 mb-6">
                    <button type="button" className="btn btn-primary" onClick={addItem}>
                        Add Item
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyAppraisal;
