import React, { useState, useEffect } from 'react';
import IconX from '../../../components/Icon/IconX';
import { FieldValues } from 'react-hook-form';

interface PropertyAssessmentItem {
    id: string;
    area: number;
    unitValue: number;
    smv: number;
    baseMarketValue: number;
    depreciationPercentage: number;
    depreciatorCost: number;
    marketValue: number;
    buildingCategory?: string;
    assessmentLevel?: number;
    effectivityOfAssessment?: string;
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
    register: any;
    setValue: any;
    watch: any;
    // Add any props you need to pass to the component
}

const formatPHP = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

function getAssessmentLevel(
    typeKey: string | null,
    marketValue: number,
    assessmentLevels: Record<string, { min: number, max: number | null, assessmentLevel: number }[]>
) {
    if (!typeKey || !marketValue) return null;
    const levels = assessmentLevels[typeKey];
    if (!levels) return null;
    for (const level of levels) {
        if (
            marketValue >= level.min &&
            (level.max === null || marketValue < level.max)
        ) {
            return level.assessmentLevel;
        }
    }
    return null;
}

function formatDateString(dateString: string | undefined) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const quarters = [
    { value: 'QTR1', label: '1st Quarter' },
    { value: 'QTR2', label: '2nd Quarter' },
    { value: 'QTR3', label: '3rd Quarter' },
    { value: 'QTR4', label: '4th Quarter' },
];

const PropertyAssessment: React.FC<PropertyAssessmentProps> = ({ register, setValue, watch }) => {
    const [items, setItems] = useState<PropertyAssessmentItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    // Sample data for dropdowns - you can replace these with your actual data
    const buildingCategories: BuildingCoreCategory[] = [
        { id: '1', name: 'Residential Buildings ' },
        { id: '2', name: 'Commercial and Industrial Buildings ' },
        { id: '3', name: 'Agricultural Buildings ' },
        { id: '4', name: 'Timberland Buildings ' },
    ];

    const buildingTypes: BuildingType[] = [
        { id: '1', name: 'Single Family' },
        { id: '2', name: 'Multi Family' },
        { id: '3', name: 'Office Building' },
        { id: '4', name: 'Retail Space' },
        { id: '5', name: 'Warehouse' },
    ];


    const assessmentLevels = {
        "ResidentialBuildingsAndOtherStructures": [
            { "min": 0, "max": 175000, "assessmentLevel": 0 },
            { "min": 175000, "max": 300000, "assessmentLevel": 10 },
            { "min": 300000, "max": 500000, "assessmentLevel": 20 },
            { "min": 500000, "max": 750000, "assessmentLevel": 25 },
            { "min": 750000, "max": 1000000, "assessmentLevel": 30 },
            { "min": 1000000, "max": 2000000, "assessmentLevel": 35 },
            { "min": 2000000, "max": 5000000, "assessmentLevel": 40 },
            { "min": 5000000, "max": 10000000, "assessmentLevel": 50 },
            { "min": 10000000, "max": null, "assessmentLevel": 60 }
        ],
        "CommercialAndIndustrialBuildingsOrStructures": [
            { "min": 0, "max": 300000, "assessmentLevel": 30 },
            { "min": 300000, "max": 500000, "assessmentLevel": 35 },
            { "min": 500000, "max": 750000, "assessmentLevel": 40 },
            { "min": 750000, "max": 1000000, "assessmentLevel": 50 },
            { "min": 1000000, "max": 2000000, "assessmentLevel": 60 },
            { "min": 2000000, "max": 5000000, "assessmentLevel": 70 },
            { "min": 5000000, "max": 10000000, "assessmentLevel": 75 },
            { "min": 10000000, "max": null, "assessmentLevel": 80 }
        ],
        "AgriculturalBuildingsAndOtherStructures": [
            { "min": 0, "max": 300000, "assessmentLevel": 25 },
            { "min": 300000, "max": 500000, "assessmentLevel": 30 },
            { "min": 500000, "max": 750000, "assessmentLevel": 35 },
            { "min": 750000, "max": 1000000, "assessmentLevel": 40 },
            { "min": 1000000, "max": 2000000, "assessmentLevel": 45 },
            { "min": 2000000, "max": null, "assessmentLevel": 50 }
        ],
        "TimberlandBuildingsAndOtherStructures": [
            { "min": 0, "max": 300000, "assessmentLevel": 45 },
            { "min": 300000, "max": 500000, "assessmentLevel": 50 },
            { "min": 500000, "max": 750000, "assessmentLevel": 55 },
            { "min": 750000, "max": 1000000, "assessmentLevel": 60 },
            { "min": 1000000, "max": 2000000, "assessmentLevel": 65 },
            { "min": 2000000, "max": null, "assessmentLevel": 70 }
        ]
    }

    const addItem = () => {
        if (items.length >= 1) {
            return; // Don't add more items if we already have one
        }
        const newItem: PropertyAssessmentItem & { buildingCategory?: string } = {
            id: (Math.random() + 1).toString(36).substring(7),
            area: 0,
            unitValue: 0,
            smv: 0,
            baseMarketValue: 0,
            depreciationPercentage: 0,
            depreciatorCost: 0,
            marketValue: 0,
            buildingCategory: '',
        };
        setItems([...items, newItem]);
    };

    const removeItem = (item: PropertyAssessmentItem) => {
        setItems(items.filter((i) => i.id !== item.id));
    };

    const totalMarketValue = watch('propertyAppraisal.marketValue');
    const buildingCategory = watch('buildingCategory');
    const assessmentLevel = watch('assessmentLevel');
    const assessmentValue = watch('assessmentValue') || 0;
    const totalArea = watch('propertyAppraisal.totalArea') || 0;
    const effectivityOfAssessment = watch('effectivityOfAssessment');
    const additionalItems = watch('additionalItems.subTotal');
    const AssessmentTotalMarketValue = totalMarketValue + additionalItems;

    useEffect(() => {
        setValue('propertyAssessment.assessmentLevel', assessmentLevel);
        setValue('propertyAssessment.assessmentValue', assessmentValue);
        setValue('propertyAssessment.totalArea', totalArea);
        setValue('propertyAssessment.marketValue', AssessmentTotalMarketValue);
        setValue('propertyAssessment.buildingCategory', buildingCategory);
        setValue('propertyAssessment.effectivityOfAssessment', effectivityOfAssessment);

    }, [assessmentLevel, assessmentValue, setValue]);

    useEffect(() => {
        let typeKey = '';
        switch (buildingCategory) {
            case 'residential':
                typeKey = 'ResidentialBuildingsAndOtherStructures';
                break;
            case 'commercial':
                typeKey = 'CommercialAndIndustrialBuildingsOrStructures';
                break;
            case 'agricultural':
                typeKey = 'AgriculturalBuildingsAndOtherStructures';
                break;
            case 'timberland':
                typeKey = 'TimberlandBuildingsAndOtherStructures';
                break;
            default:
                typeKey = '';
        }
        if (typeKey && totalMarketValue > 0) {
            const level = getAssessmentLevel(typeKey, totalMarketValue, assessmentLevels);
            if (level !== null) {
                setValue('assessmentLevel', level);
                setValue('assessmentValue', totalMarketValue * level / 100);
            }
        } else {
            setValue('assessmentValue', 0);
        }
    }, [buildingCategory, totalMarketValue, setValue]);

    return (
        <div className="">
            <h2 className='text-xl px-5 text-wrap text-left mb-6'>PROPERTY ASSESSMENT</h2>
            <div className="table-responsive">
                <table className='table-striped'>
                    <thead>
                        <tr>
                            <th className='w-full text-center'>Area</th>
                            <th className='w-full text-center' >Assessment Level</th>
                            <th className='w-full text-center' >Actual Use</th>
                            <th className='w-full text-center' >Market Value</th>
                            <th className='w-full text-center' >Assessment Value(PHP)</th>
                            <th className='w-full text-center'></th>
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
                        {items.map((item, idx) => {
                            // Calculate assessment level for each item
                            let assessmentLevel = null;
                            if (buildingCategory && totalMarketValue > 0) {
                                // Map your form's buildingCategory to the keys in assessmentLevels
                                let typeKey = '';
                                switch (buildingCategory) {
                                    case 'residential':
                                        typeKey = 'ResidentialBuildingsAndOtherStructures';
                                        break;
                                    case 'commercial':
                                        typeKey = 'CommercialAndIndustrialBuildingsOrStructures';
                                        break;
                                    case 'agricultural':
                                        typeKey = 'AgriculturalBuildingsAndOtherStructures';
                                        break;
                                    case 'timberland':
                                        typeKey = 'TimberlandBuildingsAndOtherStructures';
                                        break;
                                    default:
                                        typeKey = '';
                                }
                                assessmentLevel = getAssessmentLevel(typeKey, totalMarketValue, assessmentLevels);
                            }
                            return (
                                <React.Fragment key={item.id}>
                                    <tr>
                                        <td className="text-center font-semibold">
                                            {totalArea !== null ? `${totalArea} sq.m` : '-'}

                                        </td>
                                        <td className="text-center font-semibold auto-fit">
                                            {assessmentLevel !== null ? `${assessmentLevel}%` : '-'}
                                        </td>

                                        <td className=''>
                                            <select
                                                id="buildingCategory"
                                                className="form-select w-full"
                                                {...register(`buildingCategory`)}
                                            >
                                                <option value="">Select category</option>
                                                <option value="residential">Residential</option>
                                                <option value="commercial">Commercial</option>
                                                <option value="agricultural">Agricultural</option>
                                                <option value="timberland">Timberland</option>

                                            </select>
                                        </td>
                                        <td className='text-center'>
                                            {formatPHP(AssessmentTotalMarketValue || 0)}
                                        </td>
                                        <td className='text-center font-semibold' >
                                            <span title={`Assessment Value = totalMarketValue × assessmentLevel / 100`}>
                                                {formatPHP(assessmentValue || 0)}
                                            </span>

                                        </td>
                                        <td>
                                            <button className='ml-4' type="button" onClick={() => removeItem(item)}>
                                                <IconX className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='text-center font-semibold p-2 w-full'>
                                            <label htmlFor="effectivityOfAssessment">Taxable Value</label>
                                            <input type="checkbox" {...register(`taxableValue`)} />
                                        </td>
                                        <td className='text-center font-semibold w-full'>
                                            <label htmlFor="effectivityOfAssessment">Exempt</label>
                                            <input type="checkbox" {...register(`taxableValue`)} />
                                        </td>

                                        <td className='text-center font-semibold w-full'>
                                            <label htmlFor="effectivityOfAssessment">Effectivity of Assessment/Revision Date</label>
                                        </td>
                                        <td colSpan={2}>  <select
                                            className='form-select w-full'
                                            {...register(`effectivityOfAssessment.quarter`)}
                                        >
                                            <option value="">Qtr</option>
                                            {quarters.map((quarter) => (
                                                <option key={quarter.value} value={quarter.value}>
                                                    {quarter.label}
                                                </option>
                                            ))}
                                        </select></td>

                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>

                                        <td colSpan={2} className='text-center font-semibold w-full'>

                                            <select
                                                className='form-select'
                                                {...register(`effectivityOfAssessment`)}

                                            >
                                                <option value="" className='w-full0' >Year</option>
                                                {Array.from({ length: (new Date().getFullYear() + 1) - 1900 + 1 }, (_, i) => {
                                                    const year = (new Date().getFullYear() + 10) - i;
                                                    return (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </td>
                                        <td className='text-center font-semibold'>

                                        </td>
                                    </tr>

                                </React.Fragment>
                            );
                        })}

                    </tbody>
                </table>
            </div>
            <div className="flex justify-start sm:flex-row flex-col mt-6 px-4">
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

        </div >
    );
};

export default PropertyAssessment;
