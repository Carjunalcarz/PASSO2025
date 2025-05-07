import React, { useState, useEffect } from 'react';
import IconX from '../../../components/Icon/IconX';
import { useFormContext } from 'react-hook-form';

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

interface PropertyAppraisalProps {
    register: any
    setValue: any
    watch: any
}
const formatPHP = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

const PropertyAppraisal: React.FC<PropertyAppraisalProps> = ({ register, setValue, watch }) => {
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
        const idx = items.length;
        setValue(`propertyAppraisal.${idx}.constructionType`, '');
        setValue(`propertyAppraisal.${idx}.usage`, '');
    };

    const removeItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        setValue('propertyAppraisal', newItems);
        if (newItems.length === 0) {
            setValue('propertyAppraisalTotal.area', 0);
            setValue('propertyAppraisalTotal.unitValue', 0);
            setValue('propertyAppraisalTotal.baseMarketValue', 0);
            setValue('propertyAppraisalTotal.depreciatorCost', 0);
            setValue('propertyAppraisalTotal.marketValue', 0);
        }
    };

    const propertyAppraisalRows = watch('propertyAppraisal') || [];
    const totalBaseMarketValue = propertyAppraisalRows.reduce(
        (sum: number, row: any) => sum + ((Number(row.area) || 0) * (Number(row.unitValue) || 0)),
        0
    );

    const totalDepreciatorCost = propertyAppraisalRows.reduce(
        (sum: number, row: any) => {
            const area = Number(row.area) || 0;
            const unitValue = Number(row.unitValue) || 0;
            const depn = Number(row.depreciationPercentage) || 0;
            const baseMarketValue = area * unitValue;
            return sum + (baseMarketValue * (depn / 100));
        },
        0
    );

    const totalMarketValue = propertyAppraisalRows.reduce(
        (sum: number, row: any) => {
            const area = Number(row.area) || 0;
            const unitValue = Number(row.unitValue) || 0;
            const depn = Number(row.depreciationPercentage) || 0;
            const baseMarketValue = area * unitValue;
            const depreciatorCost = baseMarketValue * (depn / 100);
            return sum + (baseMarketValue - depreciatorCost);
        },
        0
    );

    const totalArea = propertyAppraisalRows.reduce(
        (sum: number, row: any) => sum + (Number(row.area) || 0),
        0
    );

    const totalUnitValue = propertyAppraisalRows.reduce(
        (sum: number, row: any) => sum + (Number(row.unitValue) || 0),
        0
    );

    // Add this useEffect to sync totals with form state
    useEffect(() => {
        setValue('propertyAppraisalTotal.area', totalArea);
        setValue('propertyAppraisalTotal.unitValue', totalUnitValue);
        setValue('propertyAppraisalTotal.baseMarketValue', totalBaseMarketValue);
        setValue('propertyAppraisalTotal.depreciatorCost', totalDepreciatorCost);
        setValue('propertyAppraisalTotal.marketValue', totalMarketValue);
    }, [totalArea, totalUnitValue, totalBaseMarketValue, totalDepreciatorCost, totalMarketValue, setValue]);

    const subtotal = items.reduce((sum, item) => sum + (item.area * item.unitValue), 0);
    const total = subtotal;

    return (
        <div className="px-10">
            <h2 className='text-xl px-5 text-wrap text-left mb-6'>PROPERTY APPRAISAL</h2>
            <div className="table-responsive">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th colSpan={1} className="text-center font-semibold ">Area</th>
                            <th colSpan={2} className="text-center font-semibold ">Unit Value</th>
                            <th colSpan={2} className="text-center font-semibold ">SMV</th>
                            <th colSpan={2} className="text-center font-semibold ">Base Market Value</th>
                            <th colSpan={1} className="text-center font-semibold ">% Depn</th>
                            <th colSpan={2} className="text-center font-semibold ">Depreciator Cost (PHP)</th>
                            <th colSpan={2} className="text-center font-semibold ">Market Value</th>
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
                        {items.map((item, idx) => {
                            const area = Number(watch(`propertyAppraisal.${idx}.area`)) || 0;
                            const unitValue = Number(watch(`propertyAppraisal.${idx}.unitValue`)) || 0;
                            const smv = Number(watch(`propertyAppraisal.${idx}.smv`)) || 0;
                            const depreciationPercentage = Number(watch(`propertyAppraisal.${idx}.depreciationPercentage`)) || 0;
                            const baseMarketValue = area * unitValue;
                            const depreciatorCost = baseMarketValue * (depreciationPercentage / 100);
                            const marketValue = baseMarketValue - depreciatorCost;

                            return (
                                <React.Fragment key={item.id}>
                                    {/* First row: Construction Type and Usage */}
                                    <tr className='border border-gray-300'>
                                        <td colSpan={2}>
                                            <label className='text-right' htmlFor="constructionType">Building Type</label>
                                        </td>
                                        <td colSpan={4}>
                                            <select
                                                className="form-select w-full"
                                                value={watch(`propertyAppraisal.${idx}.constructionType`) || ''}
                                                onChange={e => {
                                                    const newType = e.target.value;
                                                    setItems(items.map((it, i) =>
                                                        i === idx
                                                            ? { ...it, constructionType: newType, usage: '', unitValue: 0 }
                                                            : it
                                                    ));
                                                    setValue(`propertyAppraisal.${idx}.constructionType`, newType);
                                                    setValue(`propertyAppraisal.${idx}.usage`, '');
                                                    setValue(`propertyAppraisal.${idx}.unitValue`, 0);
                                                }}
                                            >
                                                <option value="">Select Construction Type</option>
                                                {constructionTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td colSpan={2}>
                                            <label className='text-right' htmlFor="constructionType">Building Type</label>
                                        </td>
                                        <td colSpan={4}>
                                            <select
                                                className="form-select w-full"
                                                value={watch(`propertyAppraisal.${idx}.usage`) || ''}
                                                onChange={e => {
                                                    const selectedUsage = e.target.value;
                                                    setValue(`propertyAppraisal.${idx}.usage`, selectedUsage);

                                                    // Get the current construction type from the form state
                                                    const currentType = watch(`propertyAppraisal.${idx}.constructionType`);
                                                    let unitValue = 0;
                                                    if (currentType && constructionCosts[currentType]) {
                                                        unitValue = constructionCosts[currentType][selectedUsage] ?? 0;
                                                    }
                                                    setValue(`propertyAppraisal.${idx}.unitValue`, unitValue);
                                                }}
                                                disabled={!watch(`propertyAppraisal.${idx}.constructionType`)}
                                            >
                                                <option value="">Select Usage</option>
                                                {watch(`propertyAppraisal.${idx}.constructionType`) &&
                                                    Object.keys(constructionCosts[watch(`propertyAppraisal.${idx}.constructionType`)])
                                                        .filter(usage => constructionCosts[watch(`propertyAppraisal.${idx}.constructionType`)][usage] !== null)
                                                        .map(usage => (
                                                            <option key={usage} value={usage}>{usage}</option>
                                                        ))
                                                }
                                            </select>
                                        </td>
                                        {/* Fill the rest of the columns for alignment */}
                                    </tr>
                                    {/* Second row: Details */}
                                    <tr>
                                        <td colSpan={2}>
                                            <div className="flex">
                                                <input
                                                    type="number"
                                                    className="form-input w-full rounded-r-none"
                                                    placeholder="Area"
                                                    {...register(`propertyAppraisal.${idx}.area`)}
                                                />
                                                <span className="inline-flex items-center px-3 py-2 border border-l border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-r-md">
                                                    sq.m
                                                </span>
                                            </div>
                                        </td>
                                        <td colSpan={2}>
                                            <input
                                                type="number"
                                                className="form-input w-full"
                                                placeholder="Unit Value"
                                                value={watch(`propertyAppraisal.${idx}.unitValue`) || 0}
                                                {...register(`propertyAppraisal.${idx}.unitValue`)}
                                                readOnly
                                            />
                                        </td>
                                        <td colSpan={2}>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="form-input w-full pr-8 mx-4"
                                                    placeholder="SMV %"
                                                    value={item.smv}
                                                    {...register(`propertyAppraisal.${idx}.smv`)}
                                                    min={0}
                                                    max={100}
                                                />
                                                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div>{formatPHP(baseMarketValue)}</div>
                                        </td>
                                        <td colSpan={1}>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="form-input w-full pr-8 mx-4"
                                                    placeholder="Depn %"
                                                    value={item.depreciationPercentage}
                                                    {...register(`propertyAppraisal.${idx}.depreciationPercentage`)}
                                                    min={0}
                                                    max={100}
                                                    step="0.01"
                                                />
                                                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">%</span>
                                            </div>
                                        </td>
                                        <td colSpan={2}>
                                            <div>{formatPHP(depreciatorCost)}</div>
                                        </td>
                                        <td>
                                            <div>{formatPHP(marketValue)}</div>
                                        </td>
                                        <td>
                                            <button type="button" onClick={() => removeItem(item.id)}>
                                                <IconX className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="">
                            <th colSpan={1} className="text-center font-semibold ">Area</th>
                            <th colSpan={2} className="p-2 text-center font-semibold ">Unit Value</th>
                            <th colSpan={2} className="p-2 text-center font-semibold ">SMV</th>
                            <th colSpan={2} className="p-2 text-center font-semibold ">Base Market Value</th>
                            <th colSpan={1} className="p-2 text-center font-semibold ">% Depn</th>
                            <th colSpan={2} className="p-2 text-center font-semibold ">Depreciator Cost (PHP)</th>
                            <th colSpan={2} className="p-2 text-center font-semibold ">Market Value</th>
                        </tr>
                        <tr>
                            <td colSpan={1} className="p-2 text-center font-bold">
                                {watch('propertyAppraisalTotal.area')?.toFixed(2) || '0.00'}
                            </td>
                            <td colSpan={2} className="p-2 text-center font-bold">{watch('propertyAppraisalTotal.unitValue')?.toFixed(2) || '0.00'}</td>
                            <td colSpan={2} className="p-2 text-center text-gray-400 align-middle">100%</td>
                            <td colSpan={2} className="p-2 text-center font-bold">{formatPHP(watch('propertyAppraisalTotal.baseMarketValue') || 0)}</td>
                            <td colSpan={1} className="p-2 text-center text-gray-400 align-middle">12%</td>
                            <td colSpan={2} className="p-2 text-center font-bold">{formatPHP(watch('propertyAppraisalTotal.depreciatorCost') || 0)}</td>
                            <td colSpan={2} className="p-2 text-center font-bold ">{formatPHP(watch('propertyAppraisalTotal.marketValue') || 0)}</td>
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
