import React, { useEffect } from 'react';
import IconX from '../../../components/Icon/IconX';
import { FieldValues } from 'react-hook-form';

// Add new interfaces for the dropdown options
interface BuildingCoreCategory {
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

const quarters = [
    { value: 'QTR1', label: '1st Quarter' },
    { value: 'QTR2', label: '2nd Quarter' },
    { value: 'QTR3', label: '3rd Quarter' },
    { value: 'QTR4', label: '4th Quarter' },
];

const UpdatePropertyAssessment: React.FC<PropertyAssessmentProps> = ({ register, setValue, watch }) => {
    // Static data for building categories (since API endpoints don't exist)
    const buildingCategories: BuildingCoreCategory[] = [
        { id: 'residential', name: 'Residential Buildings' },
        { id: 'commercial', name: 'Commercial and Industrial Buildings' },
        { id: 'agricultural', name: 'Agricultural Buildings' },
        { id: 'timberland', name: 'Timberland Buildings' },
    ];

    // Generate years dynamically
    const generateYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear + 10; i >= 1900; i--) {
            years.push({ id: i.toString(), name: i.toString() });
        }
        return years;
    };

    const years = generateYears();

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


    

    
    // Use the first non-zero value found
    const totalArea = watch('generalDescription.total_floor_area');
    
    const additionalItems = Number(watch('additionalItems.subTotal')) || 0;
    const unitValue = watch('generalDescription.unitValue') || 0;
    
    // Calculate total market value safely
    const AssessmentTotalMarketValue = (unitValue * totalArea) + additionalItems;

    // Use a single object for propertyAssessment
    const propertyAssessment = watch('update_propertyAssessment') || {};

    const currentBuildingCategory = propertyAssessment.building_category;
    const currentQuarter = propertyAssessment.eff_quarter || '';
    const currentYear = propertyAssessment.eff_year || '';
    const currentTaxable = propertyAssessment.taxable ?? 1;

    


    useEffect(() => {
        let typeKey = '';
        switch (currentBuildingCategory) {
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
        if (typeKey && AssessmentTotalMarketValue > 0) {
            const level = getAssessmentLevel(typeKey, AssessmentTotalMarketValue, assessmentLevels);
            if (level !== null) {
                setValue('update_propertyAssessment.assessment_level', level);
                setValue('update_propertyAssessment.assessment_value', AssessmentTotalMarketValue * level / 100);
            }
        } else {
            setValue('update_propertyAssessment.assessment_level', 0);
            setValue('update_propertyAssessment.assessment_value', 0);
        }
    }, [currentBuildingCategory, AssessmentTotalMarketValue, setValue]);


    return (
        <div className="">
            <h2 className='text-xl px-5 text-wrap text-left mb-6'>PROPERTY ASSESSMENT</h2>
            <div className="table-responsive">
                <table className='table-striped'>
                    <thead>
                        <tr>
                            <th className='text-center' >Area</th>
                            <th className='text-center' >Assessment Level</th>
                            <th className='text-center' >Actual Use</th>
                            <th className='text-center' >Market Value</th>
                            <th className='text-center' >Assessment Value(PHP)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-center font-semibold">
                                {totalArea > 0 ? `${totalArea} sq.m` : '-'} 
                            </td>
                            <td className="text-center font-semibold ">
                                {propertyAssessment.assessment_level > 0 ? `${propertyAssessment.assessment_level}%` : '-'}
                            </td>
                            <td className=''>
                                <select
                                    id="buildingCategory"
                                    className="form-select w-full"
                                    value={currentBuildingCategory}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setValue('update_propertyAssessment', { ...propertyAssessment, building_category: newValue });
                                    }}
                                >
                                    <option value="">Select category</option>
                                    {buildingCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className='text-center'>
                                {formatPHP(AssessmentTotalMarketValue)}
                            </td>
                            <td className='text-center font-semibold' >
                                <span title={`Assessment Value = totalMarketValue × assessmentLevel / 100`}>
                                    {formatPHP(propertyAssessment.assessment_value)}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} className='text-center font-semibold p-2'>
                                <label className="flex items-center justify-center gap-2 cursor-pointer">
                                    <span className="text-sm">{currentTaxable === 1 ? 'Taxable' : 'Exempt'}</span>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={currentTaxable === 1}
                                        onChange={(e) => {
                                            const newValue = e.target.checked ? 1 : 0;
                                            setValue('update_propertyAssessment', { ...propertyAssessment, taxable: newValue });
                                        }}
                                    />
                                    <span
                                        className={`block w-12 h-6 rounded-full transition-colors duration-200 ${
                                            currentTaxable === 1 ? 'bg-primary' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                                                currentTaxable === 1 ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </span>
                                </label>
                            </td>
                            <td className='text-center font-semibold'>
                                <label>Effectivity of Assessment/Revision Date</label>
                            </td>
                            <td>
                                <label htmlFor="eff_quarter" className='text-center block mb-1'>Quarter</label>
                                <select
                                    id="eff_quarter"
                                    className='form-select w-full'
                                    value={currentQuarter}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        console.log('Setting quarter to:', newValue);
                                        setValue('update_propertyAssessment', { ...propertyAssessment, eff_quarter: newValue });
                                    }}
                                >
                                    <option value="">Qtr</option>
                                    {quarters.map((quarter) => (
                                        <option key={quarter.value} value={quarter.value}>
                                            {quarter.label}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className='text-center font-semibold'>
                                <label htmlFor="eff_year" className='block mb-1'>Year</label>
                                <select
                                    id="eff_year"
                                    className='form-select'
                                    value={currentYear}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        console.log('Setting year to:', newValue);
                                        setValue('update_propertyAssessment', { ...propertyAssessment, eff_year: newValue });
                                    }}
                                >
                                    <option value="">Year</option>
                                    {years.map((year) => (
                                        <option key={year.id} value={year.id}>
                                            {year.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default UpdatePropertyAssessment;    
