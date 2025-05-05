import React from 'react';

const RecordOfSupersededAssessment: React.FC = () => {
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-center">Record of Superseded Assessment</h2>
            <div className="grid grid-cols-2 gap-4 items-center">
                <label className="font-medium">PIN</label>
                <input type="text" className="form-input text-center placeholder:text-center" placeholder="Enter PIN" />

                <label className="font-medium">TD / ARP NO.</label>
                <input type="text" className="form-input text-center placeholder:text-center" placeholder="Enter TD / ARP NO." />

                <label className="font-medium">Total Assessed Value</label>
                <input type="number" className="form-input text-center placeholder:text-center" placeholder="Enter Total Assessed Value" />

                <label className="font-medium">Previous Owner</label>
                <input type="text" className="form-input text-center placeholder:text-center" placeholder="Enter Previous Owner" />

                <label className="font-medium">Date of Effectivity</label>
                <input type="date" className="form-input text-center placeholder:text-center" placeholder="Enter Date of Effectivity" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-4 text-center">Recording Personnel</h2>
                </div>
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-4 text-center">Date</h2>
                    <input type="date" className="form-input text-center placeholder:text-center" placeholder="Enter Date" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">

                <div className="flex flex-col items-center">
                    <input type="text" className="form-input text-center placeholder:text-center" placeholder="Assessment" />
                    <label className="mt-2 text-sm font-medium">Assessment</label>
                </div>
                <div className="flex flex-col items-center">
                    <input type="text" className="form-input text-center placeholder:text-center" placeholder="Tax Mapping" />
                    <label className="mt-2 text-sm font-medium">Tax Mapping</label>
                </div>
                <div className="flex flex-col items-center">
                    <input type="text" className="form-input text-center placeholder:text-center" placeholder="Records" />
                    <label className="mt-2 text-sm font-medium">Records</label>
                </div>
            </div>
        </div>
    );
};

export default RecordOfSupersededAssessment;
