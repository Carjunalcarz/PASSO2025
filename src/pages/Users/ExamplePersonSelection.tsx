import { useState } from 'react';
import PersonSelector from '../../components/PersonSelector';
import { type PersonResponse } from '../setup/services/person';
import Swal from 'sweetalert2';

/**
 * Example page showing how to use PersonSelector component
 * This demonstrates how to integrate person selection in any form
 */
const ExamplePersonSelection = () => {
    const [selectedPersonId, setSelectedPersonId] = useState<string>('');
    const [selectedPerson, setSelectedPerson] = useState<PersonResponse | null>(null);

    const handlePersonChange = (personId: string, person: PersonResponse | null) => {
        setSelectedPersonId(personId);
        setSelectedPerson(person);
        console.log('Selected Person:', person);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedPerson) {
            Swal.fire('Error', 'Please select a person', 'error');
            return;
        }

        // Your form submission logic here
        Swal.fire({
            title: 'Person Selected',
            html: `
                <div class="text-left">
                    <p><strong>Name:</strong> ${selectedPerson.firstName} ${selectedPerson.middleName || ''} ${selectedPerson.lastName}</p>
                    <p><strong>Contact:</strong> ${selectedPerson.contactNo || 'N/A'}</p>
                    <p><strong>TIN:</strong> ${selectedPerson.tin || 'N/A'}</p>
                    <p><strong>Status:</strong> ${selectedPerson.status}</p>
                </div>
            `,
            icon: 'success'
        });
    };

    return (
        <div className="panel">
            <div className="mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Person Selection Example</h5>
                <p className="text-sm text-gray-500 mt-2">
                    This is an example showing how to use the PersonSelector component to search and select existing persons.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Person Selector */}
                <PersonSelector
                    value={selectedPersonId}
                    onChange={handlePersonChange}
                    label="Select Person"
                    placeholder="Search by name, contact, or TIN..."
                    required
                />

                {/* Display Selected Person Details */}
                {selectedPerson && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Selected Person Details</h6>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Full Name:</span>
                                <p className="font-medium">
                                    {selectedPerson.firstName} {selectedPerson.middleName || ''} {selectedPerson.lastName}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                                <p className="font-medium">{selectedPerson.contactNo || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">TIN:</span>
                                <p className="font-medium">{selectedPerson.tin || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Street:</span>
                                <p className="font-medium">{selectedPerson.street || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                <p>
                                    <span className={`badge ${selectedPerson.status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                        {selectedPerson.status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Document ID:</span>
                                <p className="font-mono text-xs">{selectedPerson.$id}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other form fields can go here */}
                <div>
                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                        Additional Notes
                    </label>
                    <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Enter any additional notes..."
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-outline-danger"
                        onClick={() => {
                            setSelectedPersonId('');
                            setSelectedPerson(null);
                        }}
                    >
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExamplePersonSelection;
