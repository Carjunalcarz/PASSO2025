import React, { useState, useEffect } from 'react';
import IconX from '../../../components/Icon/IconX';
import { FieldValues } from 'react-hook-form';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

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
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    // Get token for API calls
    const token = localStorage.getItem('token');

    // Static data for building categories (since API endpoints don't exist)
    const buildingCategories: BuildingCoreCategory[] = [
        { id: 'residential', name: 'Residential Buildings' },
        { id: 'commercial', name: 'Commercial and Industrial Buildings' },
        { id: 'agricultural', name: 'Agricultural Buildings' },
        { id: 'timberland', name: 'Timberland Buildings' },
    ];

    const buildingTypes: BuildingType[] = [
        { id: '1', name: 'Single Family' },
        { id: '2', name: 'Multi Family' },
        { id: '3', name: 'Office Building' },
        { id: '4', name: 'Retail Space' },
        { id: '5', name: 'Warehouse' },
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

    // Fix NaN issue by ensuring values are numbers - Try multiple possible sources for total area
    const totalMarketValue = Number(watch('propertyAppraisalTotal.marketValue')) || Number(watch('propertyAppraisal.marketValue')) || 0;
    const buildingCategory = watch('buildingCategory');
    const assessmentLevel = watch('assessmentLevel');
    const assessmentValue = Number(watch('assessmentValue')) || 0;
    
    // Try multiple possible sources for total area
    const totalAreaFromTotal = Number(watch('propertyAppraisalTotal.area')) || 0;
    const totalAreaFromPropertyAppraisal = Number(watch('propertyAppraisal.totalArea')) || 0;
    const totalAreaFromGeneralDescription = Number(watch('generalDescription.total_floor_area')) || 0;
    
    // Use the first non-zero value found
    const totalArea = totalAreaFromTotal || totalAreaFromPropertyAppraisal || totalAreaFromGeneralDescription;
    
    const additionalItems = Number(watch('additionalItems.subTotal')) || 0;
    
    // Calculate total market value safely
    const AssessmentTotalMarketValue = totalMarketValue + additionalItems;

    // Use a single object for propertyAssessment
    const propertyAssessment = watch('propertyAssessment') || {};

    // Fix: Ensure we get the correct building category value
    const currentBuildingCategory = propertyAssessment.building_category || buildingCategory || '';
    const currentQuarter = propertyAssessment.eff_quarter || '';
    const currentYear = propertyAssessment.eff_year || '';
    const currentTaxable = propertyAssessment.taxable ?? 1;

    // Initialize propertyAssessment object if it doesn't exist
    useEffect(() => {
        if (!propertyAssessment || Object.keys(propertyAssessment).length === 0) {
            const initialItem = {
                id: 1,
                market_value: AssessmentTotalMarketValue,
                building_category: buildingCategory || '',
                assessment_level: assessmentLevel?.toString() || '',
                assessment_value: assessmentValue,
                taxable: 1,
                eff_year: new Date().getFullYear().toString(),
                eff_quarter: 'QTR1',
                total_area: totalArea
            };
            setValue('propertyAssessment', initialItem);
        }
    }, [setValue, watch, AssessmentTotalMarketValue, buildingCategory, assessmentLevel, assessmentValue, totalArea]);

    useEffect(() => {
        if (propertyAssessment && Object.keys(propertyAssessment).length > 0) {
            setValue('propertyAssessment', {
                ...propertyAssessment,
                assessment_level: assessmentLevel?.toString() || '',
                assessment_value: assessmentValue,
                total_area: totalArea,
                market_value: AssessmentTotalMarketValue,
                building_category: buildingCategory || propertyAssessment.building_category,
            });
        }
    }, [assessmentLevel, assessmentValue, totalArea, AssessmentTotalMarketValue, buildingCategory, setValue, watch]);

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

    // Debug logging
    console.log('Property Assessment:', propertyAssessment);
    console.log('Current building category:', currentBuildingCategory);
    console.log('Current quarter:', currentQuarter);
    console.log('Current year:', currentYear);
    console.log('Total area sources:', {
        propertyAppraisalTotal: totalAreaFromTotal,
        propertyAppraisal: totalAreaFromPropertyAppraisal,
        generalDescription: totalAreaFromGeneralDescription,
        final: totalArea
    });

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
                                {assessmentLevel > 0 ? `${assessmentLevel}%` : '-'}
                            </td>
                            <td className=''>
                                <select
                                    id="buildingCategory"
                                    className="form-select w-full"
                                    value={currentBuildingCategory}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        console.log('Setting building category to:', newValue);
                                        // Fix: Update both propertyAssessment and buildingCategory consistently
                                        const updatedPropertyAssessment = {
                                            ...propertyAssessment,
                                            building_category: newValue
                                        };
                                        setValue('propertyAssessment', updatedPropertyAssessment);
                                        setValue('buildingCategory', newValue);
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
                                    {formatPHP(assessmentValue)}
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
                                            setValue('propertyAssessment', { ...propertyAssessment, taxable: newValue });
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
                                        setValue('propertyAssessment', { ...propertyAssessment, eff_quarter: newValue });
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
                                        setValue('propertyAssessment', { ...propertyAssessment, eff_year: newValue });
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

export default PropertyAssessment;
