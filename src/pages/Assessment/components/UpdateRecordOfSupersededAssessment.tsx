import React from 'react';
import IconPlus from '../../../components/Icon/IconPlus';
import IconX from '../../../components/Icon/IconX';

interface SupersededRecord {
    pin: string;
    tdArpNo: string;
    totalAssessedValue: string;
    previousOwner: string;
    dateOfEffectivity: string;
    date: string;
    assessment: string;
    taxMapping: string;
    records: string;
}

interface RecordOfSupersededAssessmentProps {
    register: any;
    setValue: any;
    watch: any;
}

const RecordOfSupersededAssessment: React.FC<RecordOfSupersededAssessmentProps> = ({ register, setValue, watch }) => {
    const records = watch('recordOfSupersededAssessment.records') || [];

    console.log("################",records);
    

    const addNewRecord = () => {
        setValue('recordOfSupersededAssessment.records', [...records, {
            pin: '',
            tdArpNo: '',
            totalAssessedValue: '',
            previousOwner: '',
            dateOfEffectivity: '',
            date: '',
            assessment: '',
            taxMapping: '',
            records: ''
        }]);
    };

    const removeRecord = (index: number) => {
        const updatedRecords = [...records];
        updatedRecords.splice(index, 1);
        setValue('recordOfSupersededAssessment.records', updatedRecords);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
            <h2 className='text-xl px-5 text-wrap text-left mb-8'>RECORD OF SUPERSEDED ASSESSMENT</h2>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addNewRecord}
                >
                    <IconPlus className="w-5 h-5" />
                    Add Record
                </button>
            </div>

            {records.map((record: SupersededRecord, index: number) => (
                <div key={index} className="border rounded-lg dark:border-gray-700 p-5 mb-4 relative">
                    <button
                        type="button"
                        className="absolute top-1 right-[-45px] text-red-500 hover:text-red-700"
                        onClick={() => removeRecord(index)}
                    >
                        <IconX className=" m-5 w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4  p-4items-center">
                        <label className="font-medium">PIN</label>
                        <input 
                            type="text" 
                            className="form-input text-center placeholder:text-center" 
                            placeholder="Enter PIN"
                            {...register(`recordOfSupersededAssessment.records.${index}.pin`)} 
                        />

                        <label className="font-medium">TD / ARP NO.</label>
                        <input 
                            type="text" 
                            className="form-input text-center placeholder:text-center" 
                            placeholder="Enter TD / ARP NO."
                            {...register(`recordOfSupersededAssessment.records.${index}.tdArpNo`)} 
                        />

                        <label className="font-medium">Total Assessed Value</label>
                        <input 
                            type="number" 
                            className="form-input text-center placeholder:text-center" 
                            placeholder="Enter Total Assessed Value"
                            {...register(`recordOfSupersededAssessment.records.${index}.totalAssessedValue`)} 
                        />

                        <label className="font-medium">Previous Owner</label>
                        <input 
                            type="text" 
                            className="form-input text-center placeholder:text-center" 
                            placeholder="Enter Previous Owner"
                            {...register(`recordOfSupersededAssessment.records.${index}.previousOwner`)} 
                        />

                        <label className="font-medium">Date of Effectivity</label>
                        <input 
                            type="date" 
                            className="form-input text-center placeholder:text-center" 
                            placeholder="Enter Date of Effectivity"
                            {...register(`recordOfSupersededAssessment.records.${index}.dateOfEffectivity`)} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg font-semibold mb-4 text-center">Recording Personnel</h2>
                        </div>
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg font-semibold mb-4 text-center">Date</h2>
                            <input 
                                type="date" 
                                className="form-input text-center placeholder:text-center" 
                                placeholder="Enter Date"
                                {...register(`recordOfSupersededAssessment.records.${index}.date`)} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="flex flex-col items-center">
                            <input 
                                type="text" 
                                className="form-input text-center placeholder:text-center" 
                                placeholder="Assessment"
                                {...register(`recordOfSupersededAssessment.records.${index}.assessment`)} 
                            />
                            <label className="mt-2 text-sm font-medium">Assessment</label>
                        </div>
                        <div className="flex flex-col items-center">
                            <input 
                                type="text" 
                                className="form-input text-center placeholder:text-center" 
                                placeholder="Tax Mapping"
                                {...register(`recordOfSupersededAssessment.records.${index}.taxMapping`)} 
                            />
                            <label className="mt-2 text-sm font-medium">Tax Mapping</label>
                        </div>
                        <div className="flex flex-col items-center">
                            <input 
                                type="text" 
                                className="form-input text-center placeholder:text-center" 
                                placeholder="Records"
                                {...register(`recordOfSupersededAssessment.records.${index}.records`)} 
                            />
                            <label className="mt-2 text-sm font-medium">Records</label>
                        </div>
                    </div>
                </div>
            ))}

            {records.length === 0 && (
                <div className="text-center text-gray-500 mt-4">
                    No records added. Click "Add Record" to create a new record.
                </div>
            )}
        </div>
    );
};

export default RecordOfSupersededAssessment;
