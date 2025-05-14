import React, { useState, useEffect } from 'react';
import IconX from '../../../components/Icon/IconX';
import { useFormContext } from 'react-hook-form';






interface PropertyAppraisalProps {
    register: any
    setValue: any
    watch: any
}
const formatPHP = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

const flattenAdditionalItems = () => {
    const items: { group: string; label: string; value: any }[] = [];



    return items;
};



const PropertyAppraisal: React.FC<PropertyAppraisalProps> = ({ register, setValue, watch }) => {
    const numberFormat = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

    const unitValue = watch("generalDescription.unitValue") || 0;
    const totalArea = watch("generalDescription.total_floor_area") || 0;
    const buildingType = watch("generalDescription.kind_of_bldg");
    const buildingStructure = watch("generalDescription.structural_type");
    const smv = 100 / 100;
    const depn = 12 / 100;
    const baseMarketValue = totalArea * unitValue * smv || 0;
    const depreciation = baseMarketValue * depn || 0;
    const marketValue = baseMarketValue - depreciation || 0;

    // #####

    useEffect(() => {
        setValue("propertyAppraisal.buildingType", buildingType);
        setValue("propertyAppraisal.buildingStructure", buildingStructure);
        setValue("propertyAppraisal.totalArea", totalArea);
        setValue("propertyAppraisal.unitValue", unitValue);
        setValue("propertyAppraisal.smv", smv);
        setValue("propertyAppraisal.baseMarketValue", baseMarketValue);
        setValue("propertyAppraisal.depreciation", depreciation);
        setValue("propertyAppraisal.marketValue", marketValue);
    }, [buildingType, buildingStructure, totalArea, unitValue, smv, baseMarketValue, depreciation, marketValue, setValue]);


    return (
        <React.Fragment>
            {/* Table of selected items */}
            <div className="mt-8">
                <div className="table-responsive">
                    <h2 className='text-xl text-wrap text-left mb-6'>PROPERTY APPRAISAL</h2>
                    <table className='table-striped'>
                        <thead>
                            <tr>
                                <th className='text-center'>Building Type</th>
                                <th className='text-center'>Building Structure</th>
                                <th className='text-center'>Area</th>
                                <th className='text-center'>Unit Value</th>
                                <th className='text-center'>SMV</th>
                                <th className='text-center'>Base Market Value</th>
                                <th className='text-center'>Depn</th>
                                <th className='text-center'>Depreciator Value</th>
                                <th className='text-center'>Market Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className='text-center p-5'>
                                    {buildingType ? buildingType : <span className="text-gray-500">Empty</span>}
                                </td>
                                <td className='text-center p-5'>
                                    {buildingStructure ? buildingStructure : <span className="text-gray-500">Empty</span>}
                                </td>
                                <td className='text-center p-5'>
                                    {totalArea}
                                </td>
                                <td className='text-center p-5'>
                                    {numberFormat.format(unitValue)}
                                </td>
                                <td className='text-center p-5'>
                                    100 %
                                </td>
                                <td className='text-center p-5 '>
                                    {numberFormat.format(baseMarketValue)}
                                </td>
                                <td className='text-center p-5'>
                                    12 %
                                </td>
                                <td className='text-center p-5'>
                                    {numberFormat.format(depreciation)}
                                </td>
                                <td className='text-center p-5'>
                                    {numberFormat.format(marketValue)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </React.Fragment >
    );
};

export default PropertyAppraisal;
