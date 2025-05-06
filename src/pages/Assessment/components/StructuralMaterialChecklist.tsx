import React, { useState } from 'react';

interface StructuralMaterialChecklistProps {
    register: any;
}

const StructuralMaterialChecklist: React.FC<StructuralMaterialChecklistProps> = ({ register }) => {
    const [additionalFloors, setAdditionalFloors] = useState<{ [key: string]: number[] }>({
        walls_rc: [],
        walls_pc: [],
        walls_chpb: [],
        walls_gi: [],
        walls_build_wall: [],
        walls_sawali: [],
        walls_bamboo: [],
        walls_other: [],
        foundation_rc: [],
        foundation_pc: [],
        foundation_other: [],
        columns_steel: [],
        columns_concrete: [],
        columns_wood: [],
        columns_other: [],
        beams_steel: [],
        beams_concrete: [],
        beams_wood: [],
        beams_other: [],
        floor_rc: [],
        floor_pc: [],
        floor_marble: [],
        floor_wood: [],
        floor_tiles: [],
        floor_other: [],
        truss_steel: [],
        truss_wood: [],
        truss_other: [],
        roof_rc: [],
        roof_tiles: [],
        roof_gi: [],
        roof_aluminum: [],
        roof_asbestos: [],
        roof_long_span: [],
        roof_concrete: [],
        roof_nipa: [],
        roof_other: []
    });
    const [mainChecked, setMainChecked] = useState<{ [key: string]: boolean }>({});

    const handleAddFloor = (section: string) => {
        setAdditionalFloors(prev => {
            const currentFloors = prev[section] || [];
            if (currentFloors.length >= 4) return prev;
            const nextFloor = (currentFloors.length > 0 ? Math.max(...currentFloors) : 4) + 1;
            if (nextFloor <= 8) {
                return { ...prev, [section]: [...currentFloors, nextFloor] };
            }
            return prev;
        });
    };

    const renderFloorCheckboxes = (section: string, mainField: string) => {
        if (!mainChecked[mainField]) return null;
        const hasReachedLimit = additionalFloors[section].length >= 4;
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <input type="checkbox" className="form-checkbox h-4 w-4" {...register(`structuralMaterial.${section}_1st`)} />
                    <input type="checkbox" className="form-checkbox h-4 w-4" {...register(`structuralMaterial.${section}_2nd`)} />
                    <input type="checkbox" className="form-checkbox h-4 w-4" {...register(`structuralMaterial.${section}_3rd`)} />
                    <input type="checkbox" className="form-checkbox h-4 w-4" {...register(`structuralMaterial.${section}_4th`)} />
                </div>
                {additionalFloors[section].length > 0 && (
                    <div className="flex items-center gap-4 mt-2">
                        {additionalFloors[section].map((floorNum) => (
                            <input
                                key={floorNum}
                                type="checkbox"
                                className="form-checkbox h-4 w-4"
                                {...register(`structuralMaterial.${section}_${floorNum}th`)}
                            />
                        ))}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => handleAddFloor(section)}
                    className={`text-xs w-fit ${hasReachedLimit
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-700'
                        }`}
                    disabled={hasReachedLimit}
                >
                    {hasReachedLimit ? 'Maximum floors reached' : '+ Add Floor'}
                </button>
            </div>
        );
    };

    const renderTableHeader = () => (
        <thead>
            <tr>
                <td className="w-1/4"></td>
                <td>
                    <div className="flex items-center gap-4 pl-[30px]">
                        <div className="w-5 text-center text-xs font-medium">1st</div>
                        <div className="w-5 text-center text-xs font-medium">2nd</div>
                        <div className="w-5 text-center text-xs font-medium">3rd</div>
                        <div className="w-5 text-center text-xs font-medium">4th</div>
                    </div>
                </td>
            </tr>
        </thead>
    );

    return (
        <div className="px-4">
            <h2 className="text-lg font-bold mb-4">Structural Material Checklist</h2>
            <div className="flex flex-wrap -mx-2">
                {/* First Column */}
                <div className="w-1/2 px-2">
                    {/* Walls and Partition */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Walls and Partition</h3>
                        <table className="w-full border-collapse">
                            {renderTableHeader()}
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 w-1/4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.walls_reinforced_concrete')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, walls_reinforced_concrete: e.target.checked }))}
                                            />
                                            <span className="ml-2">Reinforced Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_rc', 'walls_reinforced_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.walls_plain_concrete')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, walls_plain_concrete: e.target.checked }))}
                                            />
                                            <span className="ml-2">Plain Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_pc', 'walls_plain_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.walls_chpb')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, walls_chpb: e.target.checked }))}
                                            />
                                            <span className="ml-2">CHPB</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_chpb', 'walls_chpb')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.walls_gi')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, walls_gi: e.target.checked }))}
                                            />
                                            <span className="ml-2">G.I</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_gi', 'walls_gi')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.walls_build_wall')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, walls_build_wall: e.target.checked }))}
                                            />
                                            <span className="ml-2">Build a Wall</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_build_wall', 'walls_build_wall')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.walls_sawali')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, walls_sawali: e.target.checked }))}
                                            />
                                            <span className="ml-2">Sawali</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_sawali', 'walls_sawali')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.walls_bamboo')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, walls_bamboo: e.target.checked }))}
                                            />
                                            <span className="ml-2">Bamboo</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_bamboo', 'walls_bamboo')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.walls_other_checked')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, walls_other_checked: e.target.checked }))}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                {...register('structuralMaterial.walls_other')}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_other', 'walls_other_checked')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Foundation */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Foundation</h3>
                        <table className="w-full border-collapse">
                            {renderTableHeader()}
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 w-1/4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.foundation_reinforced_concrete')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, foundation_reinforced_concrete: e.target.checked }))}
                                            />
                                            <span className="ml-2">Reinforced Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('foundation_rc', 'foundation_reinforced_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.foundation_plain_concrete')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, foundation_plain_concrete: e.target.checked }))}
                                            />
                                            <span className="ml-2">Plain Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('foundation_pc', 'foundation_plain_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.foundation_other_checked')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, foundation_other_checked: e.target.checked }))}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                {...register('structuralMaterial.foundation_other')}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('foundation_other', 'foundation_other_checked')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Columns */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Columns</h3>
                        <table className="w-full border-collapse">
                            {renderTableHeader()}
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 w-1/4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.columns_steel')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, columns_steel: e.target.checked }))}
                                            />
                                            <span className="ml-2">Steel</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('columns_steel', 'columns_steel')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.columns_concrete')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, columns_concrete: e.target.checked }))}
                                            />
                                            <span className="ml-2">Reinforced Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('columns_concrete', 'columns_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.columns_wood')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, columns_wood: e.target.checked }))}
                                            />
                                            <span className="ml-2">Wood</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('columns_wood', 'columns_wood')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.columns_other_checked')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, columns_other_checked: e.target.checked }))}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                {...register('structuralMaterial.columns_other')}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('columns_other', 'columns_other_checked')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Second Column */}
                <div className="w-1/2 px-2">
                    {/* Beams */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Beams</h3>
                        <table className="w-full border-collapse">
                            {renderTableHeader()}
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 w-1/4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.beams_steel')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, beams_steel: e.target.checked }))}
                                            />
                                            <span className="ml-2">Steel</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('beams_steel', 'beams_steel')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.beams_concrete')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, beams_concrete: e.target.checked }))}
                                            />
                                            <span className="ml-2">Reinforced Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('beams_concrete', 'beams_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.beams_wood')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, beams_wood: e.target.checked }))}
                                            />
                                            <span className="ml-2">Wood</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('beams_wood', 'beams_wood')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.beams_other_checked')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, beams_other_checked: e.target.checked }))}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                {...register('structuralMaterial.beams_other')}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('beams_other', 'beams_other_checked')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Floor */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Floor</h3>
                        <table className="w-full border-collapse">
                            {renderTableHeader()}
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 w-1/4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.floor_reinforced_concrete')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, floor_reinforced_concrete: e.target.checked }))}
                                            />
                                            <span className="ml-2">Reinforced Concrete for Upper Floor</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc', 'floor_reinforced_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.floor_plain_cement')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, floor_plain_cement: e.target.checked }))}
                                            />
                                            <span className="ml-2">Plain Cement</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc', 'floor_plain_cement')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.floor_marble')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, floor_marble: e.target.checked }))}
                                            />
                                            <span className="ml-2">Marble</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc', 'floor_marble')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.floor_wood')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, floor_wood: e.target.checked }))}
                                            />
                                            <span className="ml-2">Wood</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc', 'floor_wood')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.floor_tiles')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, floor_tiles: e.target.checked }))}
                                            />
                                            <span className="ml-2">Tiles</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc', 'floor_tiles')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.floor_other_checked')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, floor_other_checked: e.target.checked }))}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                {...register('structuralMaterial.floor_other')}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc', 'floor_other_checked')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Truss Framing */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Truss Framing</h3>
                        <table className="w-full border-collapse">
                            {renderTableHeader()}
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 w-1/4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.truss_steel')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, truss_steel: e.target.checked }))}
                                            />
                                            <span className="ml-2">Steel</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('truss_steel', 'truss_steel')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.truss_wood')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, truss_wood: e.target.checked }))}
                                            />
                                            <span className="ml-2">Wood</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('truss_wood', 'truss_wood')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                {...register('structuralMaterial.truss_other_checked')}
                                                onChange={e => setMainChecked(prev => ({ ...prev, truss_other_checked: e.target.checked }))}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                {...register('truss_other')}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('truss_other', 'truss_other_checked')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Move Roof section outside the columns and make it full width */}
            <div className="px-2">
                {/* Roof */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Roof</h3>
                    <table className="border-collapse">
                        {renderTableHeader()}
                        <tbody>
                            <tr className="border-b">
                                <td className="py-2 w-1/4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_reinforced_concrete')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_reinforced_concrete: e.target.checked }))}
                                        />
                                        <span className="ml-2">Reinforced Concrete</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_rc', 'roof_reinforced_concrete')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_tiles')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_tiles: e.target.checked }))}
                                        />
                                        <span className="ml-2">Tiles</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles', 'roof_tiles')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_gi_sheet')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_gi_sheet: e.target.checked }))}
                                        />
                                        <span className="ml-2">G.I Sheet</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles', 'roof_gi_sheet')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_aluminum')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_aluminum: e.target.checked }))}
                                        />
                                        <span className="ml-2">Aluminum</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles', 'roof_aluminum')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_asbestos')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_asbestos: e.target.checked }))}
                                        />
                                        <span className="ml-2">Asbestos</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles', 'roof_asbestos')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_long_span')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_long_span: e.target.checked }))}
                                        />
                                        <span className="ml-2">Long Span</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles', 'roof_long_span')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_concrete_desk')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_concrete_desk: e.target.checked }))}
                                        />
                                        <span className="ml-2">Concrete Desk</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles', 'roof_concrete_desk')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_nipa')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_nipa: e.target.checked }))}
                                        />
                                        <span className="ml-2">Nipa/Anahaw/Cogon</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles', 'roof_nipa')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            {...register('structuralMaterial.roof_other_checked')}
                                            onChange={e => setMainChecked(prev => ({ ...prev, roof_other_checked: e.target.checked }))}
                                        />
                                        <span>Other:</span>
                                        <input
                                            type="text"
                                            className="form-input text-sm w-24"
                                            placeholder="Specify"
                                            {...register('structuralMaterial.roof_other')}
                                        />
                                    </div>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles', 'roof_other_checked')}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StructuralMaterialChecklist;
