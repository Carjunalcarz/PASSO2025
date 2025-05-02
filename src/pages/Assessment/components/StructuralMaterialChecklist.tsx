import React, { useState } from 'react';

interface StructuralMaterialChecklistProps {
    onInputChange: (field: string, value: boolean | string) => void;
}

const StructuralMaterialChecklist: React.FC<StructuralMaterialChecklistProps> = ({ onInputChange }) => {
    const [otherValues, setOtherValues] = useState({
        foundation_other: '',
        columns_other: '',
        beams_other: '',
        floor_other: '',
        truss_other: '',
        roof_other: '',
        walls_other: ''
    });
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

    const handleOtherChange = (field: string, value: string) => {
        setOtherValues(prev => ({
            ...prev,
            [field]: value
        }));
        onInputChange(field, value);
    };

    const handleAddFloor = (section: string) => {
        setAdditionalFloors(prev => {
            // Get current additional floors
            const currentFloors = prev[section] || [];

            // Check if we've reached the maximum of 8 floors total (4 default + 4 additional)
            if (currentFloors.length >= 4) {
                return prev; // Don't add more if we've reached the limit
            }

            const nextFloor = (currentFloors.length > 0
                ? Math.max(...currentFloors)
                : 4) + 1;

            // Only add if we haven't reached the limit
            if (nextFloor <= 8) {
                return {
                    ...prev,
                    [section]: [...currentFloors, nextFloor]
                };
            }
            return prev;
        });
    };

    const renderFloorCheckboxes = (section: string) => {
        if (!additionalFloors[section]) {
            console.warn(`Section ${section} not found in additionalFloors`);
            return null;
        }

        const hasReachedLimit = additionalFloors[section].length >= 4;

        return (
            <div className="flex flex-col gap-2">
                {/* First row - default floors 1-4 */}
                <div className="flex items-center gap-4">
                    <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        onChange={(e) => onInputChange(`${section}_1st`, e.target.checked)}
                    />
                    <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        onChange={(e) => onInputChange(`${section}_2nd`, e.target.checked)}
                    />
                    <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        onChange={(e) => onInputChange(`${section}_3rd`, e.target.checked)}
                    />
                    <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        onChange={(e) => onInputChange(`${section}_4th`, e.target.checked)}
                    />
                </div>

                {/* Second row - additional floors 5-8 */}
                {additionalFloors[section].length > 0 && (
                    <div className="flex items-center gap-4 mt-2">
                        {additionalFloors[section].map((floorNum) => (
                            <input
                                key={floorNum}
                                type="checkbox"
                                className="form-checkbox h-4 w-4"
                                onChange={(e) => onInputChange(`${section}_${floorNum}th`, e.target.checked)}
                            />
                        ))}
                    </div>
                )}

                {/* Add Floor button */}
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

    // Modify the table header to show only 4 floors
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
                                                onChange={(e) => onInputChange('walls_reinforced_concrete', e.target.checked)}
                                            />
                                            <span className="ml-2">Reinforced Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_rc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('walls_plain_concrete', e.target.checked)}
                                            />
                                            <span className="ml-2">Plain Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_pc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('walls_chpb', e.target.checked)}
                                            />
                                            <span className="ml-2">CHPB</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_chpb')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('walls_gi', e.target.checked)}
                                            />
                                            <span className="ml-2">G.I</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_gi')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('walls_build_wall', e.target.checked)}
                                            />
                                            <span className="ml-2">Build a Wall</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_build_wall')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('walls_sawali', e.target.checked)}
                                            />
                                            <span className="ml-2">Sawali</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_sawali')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('walls_bamboo', e.target.checked)}
                                            />
                                            <span className="ml-2">Bamboo</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_bamboo')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('walls_other_checked', e.target.checked)}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                onChange={(e) => handleOtherChange('walls_other', e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('walls_other')}
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
                                                onChange={(e) => onInputChange('foundation_reinforced_concrete', e.target.checked)}
                                            />
                                            <span className="ml-2">Reinforced Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('foundation_rc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('foundation_plain_concrete', e.target.checked)}
                                            />
                                            <span className="ml-2">Plain Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('foundation_pc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('foundation_other_checked', e.target.checked)}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                onChange={(e) => handleOtherChange('foundation_other', e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('foundation_other')}
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
                                                onChange={(e) => onInputChange('columns_steel', e.target.checked)}
                                            />
                                            <span className="ml-2">Steel</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('columns_steel')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('columns_concrete', e.target.checked)}
                                            />
                                            <span className="ml-2">Reinforced Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('columns_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('columns_wood', e.target.checked)}
                                            />
                                            <span className="ml-2">Wood</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('columns_wood')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('columns_other_checked', e.target.checked)}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                onChange={(e) => handleOtherChange('columns_other', e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('columns_other')}
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
                                                onChange={(e) => onInputChange('beams_steel', e.target.checked)}
                                            />
                                            <span className="ml-2">Steel</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('beams_steel')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('beams_concrete', e.target.checked)}
                                            />
                                            <span className="ml-2">Reinforced Concrete</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('beams_concrete')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('beams_wood', e.target.checked)}
                                            />
                                            <span className="ml-2">Wood</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('beams_wood')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('beams_other_checked', e.target.checked)}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                onChange={(e) => handleOtherChange('beams_other', e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('beams_other')}
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
                                                onChange={(e) => onInputChange('floor_reinforced_concrete', e.target.checked)}
                                            />
                                            <span className="ml-2">Reinforced Concrete for Upper Floor</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('floor_plain_cement', e.target.checked)}
                                            />
                                            <span className="ml-2">Plain Cement</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('floor_marble', e.target.checked)}
                                            />
                                            <span className="ml-2">Marble</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('floor_wood', e.target.checked)}
                                            />
                                            <span className="ml-2">Wood</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('floor_tiles', e.target.checked)}
                                            />
                                            <span className="ml-2">Tiles</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('floor_other_checked', e.target.checked)}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                onChange={(e) => handleOtherChange('floor_other', e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('floor_rc')}
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
                                                onChange={(e) => onInputChange('truss_steel', e.target.checked)}
                                            />
                                            <span className="ml-2">Steel</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('truss_steel')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('truss_wood', e.target.checked)}
                                            />
                                            <span className="ml-2">Wood</span>
                                        </label>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('truss_wood')}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox"
                                                onChange={(e) => onInputChange('truss_other_checked', e.target.checked)}
                                            />
                                            <span>Other:</span>
                                            <input
                                                type="text"
                                                className="form-input text-sm w-24"
                                                placeholder="Specify"
                                                onChange={(e) => handleOtherChange('truss_other', e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2">
                                        {renderFloorCheckboxes('truss_other')}
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
                                            onChange={(e) => onInputChange('roof_reinforced_concrete', e.target.checked)}
                                        />
                                        <span className="ml-2">Reinforced Concrete</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_rc')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            onChange={(e) => onInputChange('roof_tiles', e.target.checked)}
                                        />
                                        <span className="ml-2">Tiles</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            onChange={(e) => onInputChange('roof_gi_sheet', e.target.checked)}
                                        />
                                        <span className="ml-2">G.I Sheet</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            onChange={(e) => onInputChange('roof_aluminum', e.target.checked)}
                                        />
                                        <span className="ml-2">Aluminum</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            onChange={(e) => onInputChange('roof_asbestos', e.target.checked)}
                                        />
                                        <span className="ml-2">Asbestos</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            onChange={(e) => onInputChange('roof_long_span', e.target.checked)}
                                        />
                                        <span className="ml-2">Long Span</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            onChange={(e) => onInputChange('roof_concrete_desk', e.target.checked)}
                                        />
                                        <span className="ml-2">Concrete Desk</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            onChange={(e) => onInputChange('roof_nipa', e.target.checked)}
                                        />
                                        <span className="ml-2">Nipa/Anahaw/Cogon</span>
                                    </label>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles')}
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            onChange={(e) => onInputChange('roof_other_checked', e.target.checked)}
                                        />
                                        <span>Other:</span>
                                        <input
                                            type="text"
                                            className="form-input text-sm w-24"
                                            placeholder="Specify"
                                            onChange={(e) => handleOtherChange('roof_other', e.target.value)}
                                        />
                                    </div>
                                </td>
                                <td className="py-2">
                                    {renderFloorCheckboxes('roof_tiles')}
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
