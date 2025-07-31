import React, { useState, useEffect } from 'react';
import { SegmentedControl } from '@mantine/core';

interface UnitCostCategoryFilterProps {
    setUnitCostCategoryFilter: (value: string) => void;
}

const UnitCostCategoryFilter: React.FC<UnitCostCategoryFilterProps> = ({ setUnitCostCategoryFilter }) => {
    const [value, setValue] = useState('all');

    useEffect(() => {
        setUnitCostCategoryFilter(value);
    }, [value, setUnitCostCategoryFilter]);

    return (
        <div>
            <SegmentedControl
                className="w-full max-w-md mx-auto bg-gradient-to-r from-green-400 to-green-600
                text-white rounded-lg p-1 shadow-md"
                value={value}
                onChange={setValue}
                // radius="md"
                size="md"
                classNames={{
                    label:
                        'text-sm px-3 py-1 rounded-md transition-all duration-200 ' +
                        'data-[active=true]:bg-white data-[active=true]:text-green-600 data-[active=true]:shadow',
                }}
                data={[
                    { label: 'All', value: 'all' },
                    { label: 'Building', value: 'building' },
                    { label: 'Residential', value: 'residential' },
                    { label: 'Commercial', value: 'commercial' },
                    { label: 'Industrial', value: 'industrial' },
                   
                ]}
            />
        </div>
    );
};

export default UnitCostCategoryFilter;
