import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconX from '../../components/Icon/IconX';
import IconSend from '../../components/Icon/IconSend';
import IconSave from '../../components/Icon/IconSave';
import IconEye from '../../components/Icon/IconEye';
import IconDownload from '../../components/Icon/IconDownload';
import IconPlus from '../../components/Icon/IconPlus';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import Header from './components/Header';
import ImagePreviewModal from './components/ImagePreviewModal';
import BuildingLocation from './components/BuildingLocation';
import LandReference from './components/LandReference';
import GeneralDescription from './components/GeneralDescription';
import StructuralMaterialChecklist from './components/StructuralMaterialChecklist';
import PropertyAppraisal from './components/PropertyAppraisal';

// Type definitions
type BarangayData = {
    [key: string]: string[];
};

export interface GeneralDescriptionData {
    no_of_storey: string;
    brief_description: string;
    building_permit_no: string;
    building_permit_date: string;
}

interface StructuralMaterialChecklistProps {
    onInputChange: (field: string, value: boolean | string) => void;
}

const Add = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Invoice Add'));
    });

    const currencyList = ['USD - US Dollar', 'GBP - British Pound', 'IDR - Indonesian Rupiah', 'INR - Indian Rupee', 'BRL - Brazilian Real', 'EUR - Germany (Euro)', 'TRY - Turkish Lira'];

    const [items, setItems] = useState<any>([
        {
            id: 1,
            title: '',
            description: '',
            rate: 0,
            quantity: 0,
            amount: 0,
        },
    ]);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Separate states for municipality and province suggestions
    const [municipalitySuggestions, setMunicipalitySuggestions] = useState<string[]>([]);
    const [provinceSuggestions, setProvinceSuggestions] = useState<string[]>([]);
    const [showMunicipalitySuggestions, setShowMunicipalitySuggestions] = useState(false);
    const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);

    const municipalitSuggestion = [
        'Buenavista',
        'Cabadbaran',
        'Carmen',
        'Jabonga',
        'Kitcharao',
        'Las Nieves',
        'Magallanes',
        'Nasipit',
        'Remedios T. Romualdez',
        'Santiago',
        'Tubay',

    ];
    const provinceSuggestion = [
        'Agusan del Norte',
        'Agusan del Sur',
        'Bukidnon',
        'Camiguin',
        'Misamis Occidental',
        'Misamis Oriental',
        'Zamboanga del Norte',
        'Zamboanga del Sur',
        'Zamboanga Sibugay',
    ];

    const handleInputChangeMunicipality = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length > 0) {
            const filtered = municipalitSuggestion.filter(item =>
                item.toLowerCase().startsWith(value.toLowerCase())
            );
            setMunicipalitySuggestions(filtered);
            setShowMunicipalitySuggestions(true);
        } else {
            setMunicipalitySuggestions([]);
            setShowMunicipalitySuggestions(false);
        }
    };

    const handleInputChangeProvince = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length > 0) {
            const filtered = provinceSuggestion.filter(item =>
                item.toLowerCase().startsWith(value.toLowerCase())
            );
            setProvinceSuggestions(filtered);
            setShowProvinceSuggestions(true);
        } else {
            setProvinceSuggestions([]);
            setShowProvinceSuggestions(false);
        }
    };

    const handleSuggestionClickMunicipality = (suggestion: string) => {
        const input = document.getElementById('address_municipality') as HTMLInputElement;
        const barangayInput = document.getElementById('address_barangay') as HTMLInputElement;
        if (input) {
            input.value = suggestion;
            // Clear barangay when municipality changes
            if (barangayInput) {
                barangayInput.value = '';
            }
        }
        setShowMunicipalitySuggestions(false);
        setBarangaySuggestions([]); // Clear barangay suggestions
    };
    const handleSuggestionClickProvince = (suggestion: string) => {
        const input = document.getElementById('address_province') as HTMLInputElement;
        if (input) {
            input.value = suggestion;
        }
        setShowProvinceSuggestions(false);
    };

    const addItem = () => {
        let maxId = 0;
        maxId = items?.length ? items.reduce((max: number, character: any) => (character.id > max ? character.id : max), items[0].id) : 0;

        setItems([...items, { id: maxId + 1, title: '', description: '', rate: 0, quantity: 0, amount: 0 }]);
    };

    const removeItem = (item: any = null) => {
        setItems(items.filter((d: any) => d.id !== item.id));
    };

    const changeQuantityPrice = (type: string, value: string, id: number) => {
        const list = items;
        const item = list.find((d: any) => d.id === id);
        if (type === 'quantity') {
            item.quantity = Number(value);
        }
        if (type === 'price') {
            item.amount = Number(value);
        }
        setItems([...list]);
    };

    // First add this state for barangay suggestions
    const [barangaySuggestions, setBarangaySuggestions] = useState<string[]>([]);
    const [showBarangaySuggestions, setShowBarangaySuggestions] = useState(false);

    // Then update the barangaySuggestion declaration
    const barangaySuggestion: BarangayData = {
        "Buenavista": [
            "Abilan", "Agong-ong", "Alubijid", "Guinabsan", "Lower Olave",
            "Macalang", "Malapong", "Malpoc", "Manapa", "Matabao",
            "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4",
            "Poblacion 5", "Poblacion 6", "Poblacion 7", "Poblacion 8",
            "Poblacion 9", "Poblacion 10", "Rizal", "Sacol", "Sangay",
            "Simbalan", "Talo-ao"
        ],
        "Cabadbaran": [
            "Antonio Luna", "Bay-ang", "Bayabas", "Caasinan", "Cabinet",
            "Calamba", "Calibunan", "Comagascas", "Concepcion", "Del Pilar",
            "Katugasan", "Kauswagan", "La Union", "Mabini", "Mahaba",
            "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4",
            "Poblacion 5", "Poblacion 6", "Poblacion 7", "Poblacion 8",
            "Poblacion 9", "Poblacion 10", "Poblacion 11", "Poblacion 12",
            "Puting Bato", "Sanghan", "Soriano", "Tolosa"
        ],
        "Carmen": [
            "Cahayagan", "Gosoon", "Manoligao", "Poblacion", "Rojales",
            "San Agustin", "Tagcatong", "Vinapor"
        ],
        "Jabonga": [
            "A. Beltran", "Baleguian", "Bangonay", "Bunga", "Colorado",
            "Cuyago", "Libas", "Magdagooc", "Magsaysay", "Maraiging",
            "Poblacion", "San Jose", "San Pablo", "San Vicente", "Santo Niño"
        ],
        "Kitcharao": [
            "Bangayan", "Canaway", "Crossing", "Hinimbangan", "Jaliobong",
            "Mahayahay", "Poblacion", "San Isidro", "San Roque", "Sangay",
            "Songkoy"
        ],
        "Las Nieves": [
            "Ambacon", "Balungagan", "Bonifacio", "Casiklan", "Consorcia",
            "Durian", "Eduardo G. Montilla", "Ibuan", "Katipunan", "Lingayao",
            "Malicato", "Maningalao", "Marcos Calo", "Mat-i", "Pinana-an",
            "Poblacion", "Rosario", "San Isidro", "San Roque", "Tinucoran"
        ],
        "Magallanes": [
            "Buhang", "Caloc-an", "Guiasan", "Marcos", "Poblacion",
            "Santo Niño", "Santo Rosario", "Taod-oy"
        ],
        "Nasipit": [
            "Aclan", "Amontay", "Ata-atahon", "Barangay 1", "Barangay 2",
            "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6",
            "Barangay 7", "Camagong", "Cubi-cubi", "Culit", "Jaguimitan",
            "Kinabjangan", "Punta", "Santa Ana", "Talisay", "Triangulo"
        ],
        "Remedios T. Romualdez": [
            "Balangbalang", "Basilisa", "Humilog", "Panaytayon",
            "Poblacion I", "Poblacion II", "San Antonio", "Tagbongabong"
        ],
        "Santiago": [
            "Curva", "Estanislao Morgado", "Jagupit", "La Paz",
            "Pangaylan-IP", "Poblacion I", "Poblacion II", "San Isidro",
            "Tagbuyacan"
        ],
        "Tubay": [
            "Binuangan", "Cabayawa", "Doña Rosario", "Doña Telesfora",
            "La Fraternidad", "Lawigan", "Poblacion 1", "Poblacion 2",
            "Santa Ana", "Tagmamarkay", "Tagpangahoy", "Tinigbasan", "Victory"
        ]
    };


    // Add the handler functions
    const handleInputChangeBarangay = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const selectedMunicipality = (document.getElementById('address_municipality') as HTMLInputElement)?.value;

        if (value.length > 0 && selectedMunicipality) {
            // Use barangaySuggestion object directly since it has the complete data
            const availableBarangays = barangaySuggestion[selectedMunicipality] || [];

            const filtered = availableBarangays.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setBarangaySuggestions(filtered);
            setShowBarangaySuggestions(true);
        } else {
            setBarangaySuggestions([]);
            setShowBarangaySuggestions(false);
        }
    };

    const handleSuggestionClickBarangay = (suggestion: string) => {
        const input = document.getElementById('address_barangay') as HTMLInputElement;
        if (input) {
            input.value = suggestion;
        }
        setShowBarangaySuggestions(false);
    };

    // Add these state declarations at the beginning of your component
    const [images1, setImages1] = useState<ImageListType>([]);
    const [images2, setImages2] = useState<ImageListType>([]);
    const [images3, setImages3] = useState<any>([]);
    const maxNumber = 1; // Maximum number of images allowed per upload

    // Add these handlers
    const onChange1 = (imageList: ImageListType) => {
        setImages1(imageList as never[]);
    };

    const onChange2 = (imageList: ImageListType) => {
        setImages2(imageList as never[]);
    };

    const onChange3 = (imageList: ImageListType) => {
        setImages3(imageList as never[]);
    };

    // Add this with your other state declarations
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [generalDescriptionData, setGeneralDescriptionData] = useState<GeneralDescriptionData>({
        no_of_storey: '',
        brief_description: '',
        building_permit_no: '',
        building_permit_date: ''
    });

    const handleLandReferenceChange = (field: string, value: string) => {
        // Handle form state updates here
        console.log(field, value);
    };

    const handleGeneralDescriptionChange = (field: keyof GeneralDescriptionData, value: string) => {
        setGeneralDescriptionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Add this to your component's state declarations
    const [structuralMaterials, setStructuralMaterials] = useState<Record<string, boolean | string>>({});

    // Add this handler function
    const handleStructuralMaterialChange = (field: string, value: boolean | string) => {
        setStructuralMaterials(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Add these new state variables for component visibility
    const [showGeneralDescription, setShowGeneralDescription] = useState(false);
    const [showStructuralMaterial, setShowStructuralMaterial] = useState(false);
    const [showPropertyAppraisal, setShowPropertyAppraisal] = useState(false);

    return (
        <div className="panel p-0 border rounded-lg bg-white dark:bg-black-dark-2 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:shadow-[4px_6px_10px_-3px_#1b2e4b]">
            <div className="flex xl:flex-row flex-col gap-2.5 w-[1300px]">
                <div className="panel px-0 ltr:xl:mr-10 rtl:xl:ml-10">
                    <Header />
                    <div className="mt-8 px-20">
                        <div className="flex justify-between lg:flex-row flex-col">
                            <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                                <div className="flex items-center">
                                    <label htmlFor="reciever-email" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        TD / ARP NO. :
                                    </label>
                                    <input id="reciever-email" type="email" name="reciever-email" className="form-input flex-1" placeholder="Enter TD / ARP NO." />
                                </div>
                                <div className="mt-4 flex items-center">
                                    <label htmlFor="reciever-email" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        OWNER :
                                    </label>
                                    <input id="reciever-email" type="email" name="reciever-email" className="form-input flex-1" placeholder="Enter Owner" />
                                </div>
                                <div className="mt-4 flex items-center">
                                    <label htmlFor="reciever-address" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        Address
                                    </label>
                                    <textarea
                                        id="paragraph"
                                        name="paragraph"
                                        className="form-textarea flex-1 resize-none rounded-lg border border-[#e0e6ed] bg-white px-4 py-2 text-sm font-normal text-black focus:border-primary focus:outline-none dark:border-[#17263c] dark:bg-[#121e32] dark:text-white-dark"
                                        placeholder="Enter address here..."
                                    ></textarea>
                                </div>



                                <div className="mt-4 flex items-center">
                                    <label htmlFor="reciever-number" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        Administrator / Benificial User :
                                    </label>
                                    <input id="reciever-number" type="text" name="reciever-number" className="form-input flex-1" placeholder="Enter Administrator / Benificial User" />
                                </div>
                                <div className="mt-4 flex items-center">
                                    <label htmlFor="reciever-number" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        Address:
                                    </label>
                                    <textarea
                                        id="paragraph"
                                        name="paragraph"
                                        className="form-textarea flex-1 resize-none rounded-lg border border-[#e0e6ed] bg-white px-4 py-2 text-sm font-normal text-black focus:border-primary focus:outline-none dark:border-[#17263c] dark:bg-[#121e32] dark:text-white-dark"
                                        placeholder="Enter address here..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="lg:w-1/2 w-full">
                                <div className="flex items-center ">
                                    <label htmlFor="acno" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        TRANSACTION CODE :
                                    </label>
                                    <input id="acno" type="text" name="acno" className="form-input flex-1" placeholder="Enter  Transaction Code" />
                                </div>
                                <div className="flex items-center mt-4">
                                    <label htmlFor="acno" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        PIN:
                                    </label>
                                    <input id="acno" type="text" name="acno" className="form-input flex-1" placeholder="Enter PIN" />
                                </div>
                                <div className="flex items-center mt-4">
                                    <label htmlFor="bank-name" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        TIN
                                    </label>
                                    <input id="bank-name" type="text" name="bank-name" className="form-input flex-1" placeholder="Enter TIN" />
                                </div>
                                <div className="flex items-center mt-4">
                                    <label htmlFor="swift-code" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                                        Tel No.
                                    </label>
                                    <input id="swift-code" type="text" name="swift-code" className="form-input flex-1" placeholder="Enter Tel No." />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ###########ENTRY############## */}
                    <hr className="border-white-light dark:border-[#1b2e4b] my-6" />

                    <div className="mt-8 px-10">
                        <BuildingLocation
                            municipalitySuggestions={municipalitySuggestions}
                            provinceSuggestions={provinceSuggestions}
                            barangaySuggestions={barangaySuggestions}
                            showMunicipalitySuggestions={showMunicipalitySuggestions}
                            showProvinceSuggestions={showProvinceSuggestions}
                            showBarangaySuggestions={showBarangaySuggestions}
                            handleInputChangeMunicipality={handleInputChangeMunicipality}
                            handleInputChangeProvince={handleInputChangeProvince}
                            handleInputChangeBarangay={handleInputChangeBarangay}
                            handleSuggestionClickMunicipality={handleSuggestionClickMunicipality}
                            handleSuggestionClickProvince={handleSuggestionClickProvince}
                            handleSuggestionClickBarangay={handleSuggestionClickBarangay}
                            setShowMunicipalitySuggestions={setShowMunicipalitySuggestions}
                            setShowProvinceSuggestions={setShowProvinceSuggestions}
                            setShowBarangaySuggestions={setShowBarangaySuggestions}
                        />
                    </div>
                    {/* ##########END############### */}
                    {/* ##########ENTRY############### */}
                    <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
                    <div className="px-10">
                        <LandReference onInputChange={handleLandReferenceChange} />
                    </div>

                    {/* ###########END############## */}
                    {/* ##########ENTRY############### */}
                    <hr className="border-white-light dark:border-[#1b2e4b] my-6" />

                    {/* General Description Section - Collapsible */}
                    <div className="px-10">
                        <button
                            type="button"
                            className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                            onClick={() => setShowGeneralDescription(!showGeneralDescription)}
                        >
                            <span className="flex items-center">
                                <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                                <span className="text-black dark:text-white-dark font-medium">General Description</span>
                            </span>
                            <span className={`transform transition-transform duration-300 ${showGeneralDescription ? 'rotate-180' : ''}`}>
                                <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                        {showGeneralDescription && (
                            <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                                <GeneralDescription
                                    images1={images1}
                                    images2={images2}
                                    onChange1={(imageList) => setImages1(imageList)}
                                    onChange2={(imageList) => setImages2(imageList)}
                                    onInputChange={(field, value) => handleGeneralDescriptionChange(field as keyof GeneralDescriptionData, value)}
                                    onPreviewImage={setPreviewImage}
                                />
                            </div>
                        )}
                    </div>
                    {/* ###########END############## */}

                    {/* Structural Material Checklist Section - Collapsible */}
                    <div className="px-10">
                        <button
                            type="button"
                            className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                            onClick={() => setShowStructuralMaterial(!showStructuralMaterial)}
                        >
                            <span className="flex items-center">
                                <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                                <span className="text-black dark:text-white-dark font-medium">Structural Material Checklist</span>
                            </span>
                            <span className={`transform transition-transform duration-300 ${showStructuralMaterial ? 'rotate-180' : ''}`}>
                                <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                        {showStructuralMaterial && (
                            <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                                <StructuralMaterialChecklist onInputChange={handleStructuralMaterialChange} />
                            </div>
                        )}
                    </div>

                    {/* Property Appraisal Section - Collapsible */}
                    <div className="px-10">
                        <button
                            type="button"
                            className="mb-4 flex items-center w-full justify-between p-4 bg-white dark:bg-[#0e1726] border border-[#e0e6ed] dark:border-[#17263c] rounded-lg hover:bg-gray-50 dark:hover:bg-[#121e32] transition-all duration-300"
                            onClick={() => setShowPropertyAppraisal(!showPropertyAppraisal)}
                        >
                            <span className="flex items-center">
                                <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-primary dark:text-white-dark" />
                                <span className="text-black dark:text-white-dark font-medium">Property Appraisal</span>
                            </span>
                            <span className={`transform transition-transform duration-300 ${showPropertyAppraisal ? 'rotate-180' : ''}`}>
                                <svg className="w-6 h-6 text-gray-500 dark:text-white-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                        {showPropertyAppraisal && (
                            <div className="border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]">
                                <PropertyAppraisal />
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:w-96 w-full xl:mt-0 mt-6 lg:block md:w-full">
                    <div className="panel mb-5">
                        <label htmlFor="currency">Currency</label>
                        <select id="currency" name="currency" className="form-select">
                            {currencyList.map((i) => (
                                <option key={i}>{i}</option>
                            ))}
                        </select>
                        <div className="mt-4">
                            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="tax">Tax(%) </label>
                                    <input id="tax" type="number" name="tax" className="form-input" defaultValue={0} placeholder="Tax" />
                                </div>
                                <div>
                                    <label htmlFor="discount">Discount(%) </label>
                                    <input id="discount" type="number" name="discount" className="form-input" defaultValue={0} placeholder="Discount" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div>
                                <label htmlFor="shipping-charge">Shipping Charge($) </label>
                                <input id="shipping-charge" type="number" name="shipping-charge" className="form-input" defaultValue={0} placeholder="Shipping Charge" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="payment-method">Accept Payment Via</label>
                            <select id="payment-method" name="payment-method" className="form-select">
                                <option value=" ">Select Payment</option>
                                <option value="bank">Bank Account</option>
                                <option value="paypal">Paypal</option>
                                <option value="upi">UPI Transfer</option>
                            </select>
                        </div>
                    </div>
                    <div className="panel">
                        <div className="grid xl:grid-cols-1 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
                            <button type="button" className="btn btn-success w-full gap-2">
                                <IconSave className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                Save
                            </button>

                            <button type="button" className="btn btn-info w-full gap-2">
                                <IconSend className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                Send Invoice
                            </button>

                            <Link to="/apps/invoice/preview" className="btn btn-primary w-full gap-2">
                                <IconEye className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                Preview
                            </Link>

                            <button type="button" className="btn btn-secondary w-full gap-2">
                                <IconDownload className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {previewImage && (
                <ImagePreviewModal
                    previewImage={previewImage}
                    setPreviewImage={setPreviewImage}
                />
            )}
        </div>
    );
};

export default Add;
