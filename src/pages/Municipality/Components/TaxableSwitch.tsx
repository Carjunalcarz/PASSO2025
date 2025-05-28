import React, { useState, useEffect } from 'react';
import { SegmentedControl } from '@mantine/core';

interface TaxableSwitchProps {
    setTaxabilityFilter: (value: string) => void;
}

const TaxableSwitch: React.FC<TaxableSwitchProps> = ({ setTaxabilityFilter }) => {
    const [value, setValue] = useState('all');

    useEffect(() => {
        setTaxabilityFilter(value);
    }, [value, setTaxabilityFilter]);

    return (
        <div>
            <SegmentedControl
                value={value}
                onChange={setValue}
                data={[
                    { label: 'All', value: 'all' },
                    { label: 'Taxable', value: 'taxable' },
                    { label: 'Exempt', value: 'exempt' },
                ]}
            />
        </div>
    );
};

export default TaxableSwitch;
