import React from 'react';

interface ConstructionCostProps {
    register: any;
    setValue: any;
    watch: any;
}

const constructionCosts: Record<string, Record<string, number | null>> = {
    'I-A': {
        Residential: 1700,
        Accessoria: 0,
        Apartment: 0,
        Garage: 2370,
        School: 2540,
        Hotel: 3670,
        Theatre: 3730,
        Restaurant: 2470,
        Factory: 1730,
        Gym: 2470,
        Bowling_Lanes: 3260,
        Mills: 2710,
        Swimming_Pools: null,
        Gas_Station: null,
        Animal_Shed: 990
    }, 'I-B': {
        Residential: 4500,
        Accessoria: 2940,
        Apartment: 2940,
        Garage: 2370,
        School: 2540,
        Hotel: 3960,
        Theatre: 3970,
        Restaurant: 2670,
        Factory: 1930,
        Gym: 2670,
        Bowling_Lanes: 3080,
        Mills: 1760,
        Swimming_Pools: null,
        Gas_Station: null,
        Animal_Shed: 1300
    },
    'II-A': {
        Residential: 3400,
        Accessoria: 2640,
        Apartment: 2700,
        Garage: 2150,
        School: 2070,
        Hotel: 3350,
        Theatre: 3410,
        Restaurant: 2370,
        Factory: 1530,
        Gym: 2370,
        Bowling_Lanes: 3190,
        Mills: 3110,
        Swimming_Pools: 2680,
        Gas_Station: null,
        Animal_Shed: 1160
    },
    'II-B': {
        Residential: 4300,
        Accessoria: 3580,
        Apartment: 3700,
        Garage: 3160,
        School: 3020,
        Hotel: 4260,
        Theatre: 4320,
        Restaurant: 3270,
        Factory: 2430,
        Gym: 3270,
        Bowling_Lanes: 4190,
        Mills: 3710,
        Swimming_Pools: null,
        Gas_Station: null,
        Animal_Shed: null
    },
    'III-A': {
        Residential: 3800,
        Accessoria: 3280,
        Apartment: 3300,
        Garage: 2700,
        School: 2800,
        Hotel: 3870,
        Theatre: 3930,
        Restaurant: 2870,
        Factory: 2030,
        Gym: 2870,
        Bowling_Lanes: 5300,
        Mills: 4280,
        Swimming_Pools: null,
        Gas_Station: null,
        Animal_Shed: null
    },
    'III-B': {
        Residential: 5300,
        Accessoria: 4910,
        Apartment: 4600,
        Garage: 4200,
        School: 3980,
        Hotel: 5290,
        Theatre: 5350,
        Restaurant: 4290,
        Factory: 3450,
        Gym: 4290,
        Bowling_Lanes: null,
        Mills: null,
        Swimming_Pools: null,
        Gas_Station: null,
        Animal_Shed: null
    },
    'IV-A': {
        Residential: 4900,
        Accessoria: 4200,
        Apartment: 3900,
        Garage: 3730,
        School: 3490,
        Hotel: 4800,
        Theatre: 4860,
        Restaurant: 3800,
        Factory: 2960,
        Gym: 3800,
        Bowling_Lanes: null,
        Mills: null,
        Swimming_Pools: null,
        Gas_Station: null,
        Animal_Shed: null
    },
    'IV-B': {
        Residential: 5500,
        Accessoria: 5910,
        Apartment: 6500,
        Garage: 5170,
        School: 4970,
        Hotel: 5820,
        Theatre: 5880,
        Restaurant: 4820,
        Factory: 3980,
        Gym: 4820,
        Bowling_Lanes: null,
        Mills: null,
        Swimming_Pools: null,
        Gas_Station: 5000,
        Animal_Shed: null
    },
    'V-A': {
        Residential: 5400,
        Accessoria: 5600,
        Apartment: 6000,
        Garage: 4910,
        School: 5920,
        Hotel: null,
        Theatre: null,
        Restaurant: null,
        Factory: null,
        Gym: null,
        Bowling_Lanes: 8670,
        Mills: 6150,
        Swimming_Pools: 3590,
        Gas_Station: 5000,
        Animal_Shed: null
    },
    'V-B': {
        Residential: null,
        Accessoria: null,
        Apartment: null,
        Garage: null,
        School: null,
        Hotel: null,
        Theatre: 7660,
        Restaurant: 5190,
        Factory: 4160,
        Gym: 4800,
        Bowling_Lanes: 7560,
        Mills: 5600,
        Swimming_Pools: 3350,
        Gas_Station: 3850,
        Animal_Shed: null
    }

    // ... other construction types remain the same
};

const ConstructionCost: React.FC<ConstructionCostProps> = ({ register, setValue, watch }) => {
    const constructionTypes = Object.keys(constructionCosts);
   

    return (
        <div className="flex gap-4">
            <div className="flex-1">
                <label className="block mb-2">Building Type</label>
                <select
                    className="form-select w-full"
                    value={watch('generalDescription.kind_of_bldg') || ''}
                    onChange={e => {
                        const newType = e.target.value;
                        setValue('generalDescription.kind_of_bldg', newType);
                        setValue('generalDescription.structural_type', '');
                        setValue('generalDescription.unitValue', 0);
                    }}
                >
                    <option value="">Select Construction Type</option>
                    {constructionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div className="flex-1">
                <label className="block mb-2">Structural Type</label>
                <select
                    className="form-select w-full"
                    value={watch('generalDescription.structural_type') || ''}
                    onChange={e => {
                        const selectedStructuralType = e.target.value;
                        setValue('generalDescription.structural_type', selectedStructuralType);

                        const currentType = watch('generalDescription.kind_of_bldg');
                        let unitValue = 0;
                        if (currentType && constructionCosts[currentType]) {
                            unitValue = constructionCosts[currentType][selectedStructuralType] ?? 0;
                        }
                        setValue('generalDescription.unitValue', unitValue);
                    }}
                    disabled={!watch('generalDescription.kind_of_bldg')}
                >
                    <option value="">Select Structural Type</option>
                    {watch('generalDescription.kind_of_bldg') &&
                        Object.keys(constructionCosts[watch('generalDescription.kind_of_bldg')])
                            .filter(structuralType => constructionCosts[watch('generalDescription.kind_of_bldg')][structuralType] !== null)
                            .map(structuralType => (
                                <option key={structuralType} value={structuralType}>{structuralType}</option>
                            ))
                    }
                </select>
            </div>
        </div>
    );
};

export default ConstructionCost;
