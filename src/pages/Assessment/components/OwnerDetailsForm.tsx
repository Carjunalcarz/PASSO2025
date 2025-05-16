import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import InputField from './shared/InputField';


const OwnerDetailsForm: React.FC<{ register: any, watch: any, setValue: any }> = ({ register, watch, setValue }) => {

    const td_barangay = watch('buildingLocation.address_barangay');
    const td_municipality = watch('buildingLocation.address_municipality');

   // Add municipality and barangay code mapping
const municipalityBarangayCodes: { [key: string]: { code: string, barangays: { [key: string]: string } } } = {
    'BUENAVISTA': {
        code: '001',
        barangays: {
            'ABILAN': '001', 'AGONG-ONG': '002', 'ALUBIJID': '003', 'GUINABSAN': '004',
            'LOWER OLAVE': '005', 'MACALANG': '006', 'MALAPONG': '007', 'MALPOC': '008',
            'MANAPA': '009', 'MATABAO': '010', 'POBLACION 1': '011', 'POBLACION 2': '012',
            'POBLACION 3': '013', 'POBLACION 4': '014', 'POBLACION 5': '015', 'POBLACION 6': '016',
            'POBLACION 7': '017', 'POBLACION 8': '018', 'POBLACION 9': '019', 'POBLACION 10': '020',
            'RIZAL': '021', 'SACOL': '022', 'SANGAY': '023', 'SIMBALAN': '024', 'TALO-AO': '025'
        }
    },
    'CABADBARAN': {
        code: '002',
        barangays: {
            'ANTONIO LUNA': '001', 'BAY-ANG': '002', 'BAYABAS': '003', 'CAASINAN': '004',
            'CABINET': '005', 'CALAMBA': '006', 'CALIBUNAN': '007', 'COMAGASCAS': '008',
            'CONCEPCION': '009', 'DEL PILAR': '010', 'KATUGASAN': '011', 'KAUSWAGAN': '012',
            'LA UNION': '013', 'MABINI': '014', 'MAHABA': '015', 'POBLACION 1': '016',
            'POBLACION 2': '017', 'POBLACION 3': '018', 'POBLACION 4': '019', 'POBLACION 5': '020',
            'POBLACION 6': '021', 'POBLACION 7': '022', 'POBLACION 8': '023', 'POBLACION 9': '024',
            'POBLACION 10': '025', 'POBLACION 11': '026', 'POBLACION 12': '027', 'PUTING BATO': '028',
            'SANGHAN': '029', 'SORIANO': '030', 'TOLOSA': '031'
        }
    },
    'CARMEN': {
        code: '003',
        barangays: {
            'CAHAYAGAN': '001', 'GOSOON': '002', 'MANOLIGAO': '003', 'POBLACION': '004', 'ROJALES': '005',
            'SAN AGUSTIN': '006', 'TAGCATONG': '007', 'VINAPOR': '008'
        }
    },
    'JABONGA': {
        code: '004',
        barangays: {
            'A. BELTRAN': '001', 'BALEGUAN': '002', 'BANGONAY': '003', 'BUNGA': '004', 'COLORADO': '005',
            'CUYAGO': '006', 'LIBAS': '007', 'MAGDAGOOC': '008', 'MAGSAYSAY': '009', 'MARAIGING': '010',
            'POBLACION': '011', 'SAN JOSE': '012', 'SAN PABLO': '013', 'SAN VICENTE': '014', 'SANTO NIÑO': '015'
        }
    },
    'KITCHARAO': {
        code: '005',
        barangays: {
            'BANGAYAN': '001', 'CANAWAY': '002', 'CROSSING': '003', 'HINIMBANGAN': '004', 'JALIOBONG': '005',
            'MAHAYAHAY': '006', 'POBLACION': '007', 'SAN ISIDRO': '008', 'SAN ROQUE': '009', 'SANGAY': '010',
            'SONGKAY': '011'
        }
    },
    'LAS NIEVES': {
        code: '006',
        barangays: {
            'AMBACON': '001', 'BALUNGAGAN': '002', 'BONIFACIO': '003', 'CASIKLAN': '004', 'CONSORCIA': '005',
            'DURIAN': '006', 'EDUARDO G. MONTILLA': '007', 'IBUAN': '008', 'KATIPUNAN': '009', 'LINGAYAO': '010',
            'MALICATO': '011', 'MANINGALAO': '012', 'MARCOS CALO': '013', 'MAT-I': '014', 'PINANA-AN': '015',
            'POBLACION': '016', 'ROSARIO': '017', 'SAN ISIDRO': '018', 'SAN ROQUE': '019', 'TINUCORAN': '020'
        }
    },
    'MAGALLANES': {
        code: '007',
        barangays: {
            'BUHANG': '001', 'CALOC-AN': '002', 'GUIASAN': '003', 'MARCOS': '004', 'POBLACION': '005',
            'SANTO NIÑO': '006', 'SANTO ROSARIO': '007', 'TAOD-OY': '008'
        }
    },
    'NASIPIT': {
        code: '008',
        barangays: {
            'ACLAN': '001', 'AMONTAY': '002', 'ATA-ATAHON': '003', 'BARANGAY 1': '004', 'BARANGAY 2': '005',
            'BARANGAY 3': '006', 'BARANGAY 4': '007', 'BARANGAY 5': '008', 'BARANGAY 6': '009', 'BARANGAY 7': '010',
            'CAMAGONG': '011', 'CUBI-CUBI': '012', 'CULIT': '013', 'JAGUIMITAN': '014', 'KINABJANGAN': '015',
            'PUNTA': '016', 'SANTA ANA': '017', 'TALISAY': '018', 'TRIANGULO': '019'
        }
    },
    'REMEDIOS T. ROMUALDEZ': {
        code: '009',
        barangays: {
            'BALANGBALANG': '001', 'BASILISA': '002', 'HUMILOG': '003', 'PANAYTAYON': '004',
            'POBLACION I': '005', 'POBLACION II': '006', 'SAN ANTONIO': '007', 'TAGBONGABONG': '008'
        }
    },
    'SANTIAGO': {
        code: '010',
        barangays: {
            'CURVA': '001', 'ESTANISLAO MORGADO': '002', 'JAGUPIT': '003', 'LA PAZ': '004',
            'PANGAYLAN-IP': '005', 'POBLACION I': '006', 'POBLACION II': '007', 'SAN ISIDRO': '008',
            'TAGBUYACAN': '009'
        }
    },
    'TUBAY': {
        code: '011',
        barangays: {
            'BINUANGAN': '001', 'CABAYAWA': '002', 'DOÑA ROSARIO': '003', 'DOÑA TELESFORA': '004',
            'LA FRATERNIDAD': '005', 'LAWIGAN': '006', 'POBLACION 1': '007', 'POBLACION 2': '008',
            'SANTA ANA': '009', 'TAGMAMARKAY': '010', 'TAGPANGAHOY': '011', 'TINIGBASAN': '012', 'VICTORY': '013'
        }
    }
};


    // Function to get municipality code
    const getMunicipalityCode = (municipality: string): string => {
        return municipalityBarangayCodes[municipality?.toUpperCase()]?.code || '000';
    };

    // Function to get barangay code
    const getBarangayCode = (municipality: string, barangay: string): string => {
        if (!municipality || !barangay) return '000';
        
        const municipalityUpper = municipality.toUpperCase().trim();
        const barangayUpper = barangay.toUpperCase().trim();
        
        return municipalityBarangayCodes[municipalityUpper]?.barangays[barangayUpper] || '000';
    };

    // Modified function to generate TDN
    const generateTDN = () => {
        if (!td_municipality || !td_barangay) return '';
        
        const munCode = getMunicipalityCode(td_municipality);
        const brgCode = getBarangayCode(td_municipality, td_barangay);
        
        // Get current year
        const year = new Date().getFullYear();
        
        // Generate a random 4-digit number
        // const sequence = String(Math.floor(1000 + Math.random() * 9000));
        
        // Format: MUNCODE-BRGCODE-YEAR-SEQUENCE
        return `${year}-${munCode}-${brgCode}`;
    };

    useEffect(() => {
        if (td_municipality && td_barangay) {  // Only set value if we have both values
            setValue('ownerDetails.td', generateTDN());
        }
    }, [td_municipality, td_barangay, setValue]); // Change dependencies to what actually changes

    return (
        <div className="flex justify-between lg:flex-row flex-col border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-10 bg-white dark:bg-[#0e1726]">
            <div className="lg:w-1/2 w-full">
                <div className="flex items-center mt-4">
                    <InputField
                        value={watch('ownerDetails.td')}
                        label="TD / ARP NO."
                        id="tdArpNo"
                        type="text"
                        placeholder="Enter TD / ARP NO."
                        disabled={true}
                    />
                </div>
                <div className="flex items-center">
                    <InputField
                        label="Owner:"
                        id="owner"
                        type="text"
                        placeholder="Enter Owner"
                        {...register('ownerDetails.owner')}
                    />
                </div>
                <div className="items-center mr-9">
                    <div className="p-2 flex justify-center items-center  px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                        Owner Address
                    </div>
                    <textarea
                        id="ownerAddress"
                        name="ownerAddress"
                        className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1"
                        placeholder="Enter Owner"
                        {...register("ownerDetails.ownerAddress")}
                    ></textarea>
                </div>
                <div className="mt-4 items-center mr-9">
                    <div className="p-2 flex justify-center items-center  px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                        Administrator / Benificial User
                    </div>
                    <InputField
                        label="..."
                        id="admin_ben_user"
                        type="text"
                        placeholder="Enter Administrator / Benificial User"
                        {...register('ownerDetails.admin_ben_user')}
                    />
                </div>
                <div className="items-center mr-9">
                    <div className="p-2 flex justify-center items-center  px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                        Admin Address
                    </div>
                    <textarea
                        id="adminAddress"
                        name="adminAddress"
                        className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1"
                        placeholder="Enter Admin Address"
                        {...register("ownerDetails.adminAddress")}
                    ></textarea>
                </div>
            </div>
            <div className="lg:w-1/2 w-full">
                <div className="flex items-center mt-4">
                    <InputField
                        label="Transaction Code"
                        id="transactionCode"
                        type="text"
                        placeholder="Enter Code"
                        {...register('ownerDetails.transactionCode')}
                    />
                </div>
                <div className="flex items-center">
                    <InputField
                        label="PIN:"
                        id="pin"
                        type="text"
                        placeholder="Enter PIN"
                        {...register('ownerDetails.pin')}
                    />
                </div>
                <div className="flex items-center">
                    <InputField
                        label="TIN"
                        id="tin"
                        type="text"
                        placeholder="Enter TIN"
                        {...register('ownerDetails.tin')}
                    />
                </div>
                <div className="flex items-center">
                    <InputField
                        label="Tel No."
                        id="telNo"
                        type="text"
                        placeholder="Enter Tel No."
                        {...register('ownerDetails.telNo')}
                    />
                </div>
            </div>
        </div>
    );
};

export default OwnerDetailsForm;
