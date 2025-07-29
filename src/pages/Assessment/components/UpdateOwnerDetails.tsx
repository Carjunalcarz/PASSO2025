import React, { useEffect, useState } from 'react';
import InputField from './shared/InputField';
import { FieldError } from 'react-hook-form';
import ImageUploadGallery from '../../../components/ImageUploadGallery';
import ImagePreviewModal from './ImagePreviewModal';
import { ImageListType } from 'react-images-uploading';

interface UpdateOwnerDetailsProps {
    register: any;
    watch: any;
    setValue: any;
    trigger?: any;
    getNestedError?: (path: string) => FieldError | undefined;
}

const UpdateOwnerDetails: React.FC<UpdateOwnerDetailsProps> = ({
    register,
    watch,
    setValue,
    trigger,
    getNestedError
}) => {

    const td_barangay = watch('update_buildingLocation.update_address_barangay');
    const td_municipality = watch('update_buildingLocation.update_address_municipality');
    const image_list = watch('ownerDetails.image_list');
    const id = watch('ownerDetails.id');
    const update_bcode = watch('update_buildingLocation.update_bcode');
    const update_mun_code = watch('update_buildingLocation.update_mun_code');   
    const update_year = watch('update_buildingLocation.update_year');
    const update_gr_name = watch('update_buildingLocation.update_gr_name');
    const update_gr_code = watch('update_buildingLocation.update_gr_code');
    
    const imageListForPreview = Array.isArray(image_list)
      ? image_list.map(b64 => {
          let prefix = 'data:image/png;base64,';
          if (b64.startsWith('/9j/')) {
            prefix = 'data:image/jpeg;base64,';
          }
          return { data_url: `${prefix}${b64}` };
        })
      : [];

    // Add municipality and barangay code mapping
    const municipalityBarangayCodes: { [key: string]: { code: string, barangays: { [key: string]: string } } } = {
        'BUENAVISTA': {
            code: '01',
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
            code: '02',
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
            code: '03',
            barangays: {
                'CAHAYAGAN': '001', 'GOSOON': '002', 'MANOLIGAO': '003', 'POBLACION': '004', 'ROJALES': '005',
                'SAN AGUSTIN': '006', 'TAGCATONG': '007', 'VINAPOR': '008'
            }
        },
        'JABONGA': {
            code: '04',
            barangays: {
                'A. BELTRAN': '001', 'BALEGUAN': '002', 'BANGONAY': '003', 'BUNGA': '004', 'COLORADO': '005',
                'CUYAGO': '006', 'LIBAS': '007', 'MAGDAGOOC': '008', 'MAGSAYSAY': '009', 'MARAIGING': '010',
                'POBLACION': '011', 'SAN JOSE': '012', 'SAN PABLO': '013', 'SAN VICENTE': '014', 'SANTO NIÑO': '015'
            }
        },
        'KITCHARAO': {
            code: '05',
            barangays: {
                'BANGAYAN': '001', 'CANAWAY': '002', 'CROSSING': '003', 'HINIMBANGAN': '004', 'JALIOBONG': '005',
                'MAHAYAHAY': '006', 'POBLACION': '007', 'SAN ISIDRO': '008', 'SAN ROQUE': '009', 'SANGAY': '010',
                'SONGKAY': '011'
            }
        },
        'LAS NIEVES': {
            code: '06',
            barangays: {
                'AMBACON': '001', 'BALUNGAGAN': '002', 'BONIFACIO': '003', 'CASIKLAN': '004', 'CONSORCIA': '005',
                'DURIAN': '006', 'EDUARDO G. MONTILLA': '007', 'IBUAN': '008', 'KATIPUNAN': '009', 'LINGAYAO': '010',
                'MALICATO': '011', 'MANINGALAO': '012', 'MARCOS CALO': '013', 'MAT-I': '014', 'PINANA-AN': '015',
                'POBLACION': '016', 'ROSARIO': '017', 'SAN ISIDRO': '018', 'SAN ROQUE': '019', 'TINUCORAN': '020'
            }
        },
        'MAGALLANES': {
            code: '07',
            barangays: {
                'BUHANG': '001', 'CALOC-AN': '002', 'GUIASAN': '003', 'MARCOS': '004', 'POBLACION': '005',
                'SANTO NIÑO': '006', 'SANTO ROSARIO': '007', 'TAOD-OY': '008'
            }
        },
        'NASIPIT': {
            code: '08',
            barangays: {
                'ACLAN': '001', 'AMONTAY': '002', 'ATA-ATAHON': '003', 'BARANGAY 1': '004', 'BARANGAY 2': '005',
                'BARANGAY 3': '006', 'BARANGAY 4': '007', 'BARANGAY 5': '008', 'BARANGAY 6': '009', 'BARANGAY 7': '010',
                'CAMAGONG': '011', 'CUBI-CUBI': '012', 'CULIT': '013', 'JAGUIMITAN': '014', 'KINABJANGAN': '015',
                'PUNTA': '016', 'SANTA ANA': '017', 'TALISAY': '018', 'TRIANGULO': '019'
            }
        },
        'REMEDIOS T. ROMUALDEZ': {
            code: '09',
            barangays: {
                'BALANGBALANG': '001', 'BASILISA': '002', 'HUMILOG': '003', 'PANAYTAYON': '004',
                'POBLACION I': '005', 'POBLACION II': '006', 'SAN ANTONIO': '007', 'TAGBONGABONG': '008'
            }
        },
        'SANTIAGO': {
            code: '10',
            barangays: {
                'CURVA': '001', 'ESTANISLAO MORGADO': '002', 'JAGUPIT': '003', 'LA PAZ': '004',
                'PANGAYLAN-IP': '005', 'POBLACION I': '006', 'POBLACION II': '007', 'SAN ISIDRO': '008',
                'TAGBUYACAN': '009'
            }
        },
        'TUBAY': {
            code: '11',
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

    // Function to format PIN input
    const formatPIN = (value: string): string => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');
        
        // Format as 123-45-0123-456-789
        if (digits.length <= 3) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
        if (digits.length <= 12) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`;
        if (digits.length <= 15) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 12)}-${digits.slice(12)}`;
        
        // Limit to 15 digits
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 12)}-${digits.slice(12, 15)}`;
    };

    // Function to format TIN input
    const formatTIN = (value: string): string => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');
        
        // Format as XXX-XXX-XXX-XXX (12 digits total)
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
        if (digits.length <= 12) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9)}`;
        
        // Limit to 12 digits
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 12)}`;
    };

    // Handle TIN input change
    const handleTINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatTIN(e.target.value);
        setValue('ownerDetails.tin', formattedValue);
        
        // Trigger validation after setting the value
        if (trigger) {
            trigger('ownerDetails.tin');
        }
    };

    // Handle PIN input change
    const handlePINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatPIN(e.target.value);
        setValue('ownerDetails.pin', formattedValue);
        
        // Trigger validation after setting the value
        if (trigger) {
            trigger('ownerDetails.pin');
        }
    };

    // Modified function to generate TDN
    const generateTDN = () => {
        if (!td_municipality || !td_barangay) return '';

        const munCode = getMunicipalityCode(td_municipality);
        const brgCode = getBarangayCode(td_municipality, td_barangay);
        setValue('update_buildingLocation.update_bcode', brgCode);
        setValue('update_buildingLocation.update_mun_code', munCode);

        const year = update_year;
        // Format: YEAR-MUNCODE-BRGCODE
        return `${year}-${munCode}-${brgCode}-${id}`;
    };

    useEffect(() => {
        if (td_municipality && td_barangay) {
            const newTDN = generateTDN();
            setValue('ownerDetails.td', newTDN);
            
            // Trigger validation for the TD field after setting the value
            if (trigger && newTDN) {
                trigger('ownerDetails.td');
            }
        }
    }, [td_municipality, td_barangay, update_year, id, setValue, trigger]);

    // Handle image list changes and convert to base64
    const handleOwnerPhotosChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        const base64List = imageList.map(img => img.data_url.split(',')[1]);
        // Get the current value
        const currentImageList = watch('ownerDetails.image_list') || [];
        // Only update if different
        if (JSON.stringify(currentImageList) !== JSON.stringify(base64List)) {
            setValue('ownerDetails.image_list', base64List);
            if (trigger) trigger('ownerDetails.image_list');
        }
    };

    // Modal state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');

    // Handle image preview
    const handleImagePreview = (imageUrl: string) => {
        setPreviewImageUrl(imageUrl);
        setIsPreviewOpen(true);
    };

    // Handle close preview
    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setPreviewImageUrl('');
    };

    return (
        <div className='px-10 border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-4 bg-white dark:bg-[#0e1726]'>
            <h2 className='text-xl px-5 text-wrap text-left'>OWNER DETAILS</h2>
            
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Form Inputs */}
                <div className="space-y-4">
                    <div className="flex items-center mt-4">
                        <InputField
                            value={watch('ownerDetails.td')}
                            label="TD / ARP NO."
                            id="tdArpNo"
                            type="text"
                            placeholder="Enter TD / ARP NO."
                            disabled={true}
                            error={getNestedError?.('ownerDetails.td')}
                        />
                    </div>
                    <div className="flex items-center">
                        <InputField
                            label="Owner:"
                            id="owner"
                            type="text"
                            placeholder="Enter Owner"
                            {...register('ownerDetails.owner')}
                            error={getNestedError?.('ownerDetails.owner')}
                        />
                    </div>
                    <div className="items-center mr-9">
                        <div className="p-2 flex justify-center items-center px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            Owner Address
                        </div>
                        <textarea
                            id="ownerAddress"
                            name="ownerAddress"
                            className={`form-input ltr:rounded-l-none rtl:rounded-r-none flex-1 ${
                                getNestedError?.('ownerDetails.ownerAddress') ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            placeholder="Enter Owner Address"
                            {...register("ownerDetails.ownerAddress")}
                        ></textarea>
                        {/* Error message */}
                        {getNestedError?.('ownerDetails.ownerAddress') && (
                            <div className="text-red-500 text-sm mt-1 ml-4">
                                {getNestedError('ownerDetails.ownerAddress')?.message}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 items-center mr-9">
                        <div className="p-2 flex justify-center items-center px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            Administrator / Beneficial User
                        </div>
                        <InputField
                            label="..."
                            id="admin_ben_user"
                            type="text"
                            placeholder="Enter Administrator / Beneficial User"
                            {...register('ownerDetails.admin_ben_user')}
                            error={getNestedError?.('ownerDetails.admin_ben_user')}
                        />
                    </div>
                    <div className="items-center mr-9">
                        <div className="p-2 flex justify-center items-center px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            Admin Address
                        </div>
                        <textarea
                            id="adminAddress"
                            name="adminAddress"
                            className={`form-input ltr:rounded-l-none rtl:rounded-r-none flex-1 ${
                                getNestedError?.('ownerDetails.admin_ben_user_address') ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            placeholder="Enter Admin Address"
                            {...register("ownerDetails.admin_ben_user_address")}
                        ></textarea>
                        {/* Error message */}
                        {getNestedError?.('ownerDetails.admin_ben_user_address') && (
                            <div className="text-red-500 text-sm mt-1 ml-4">
                                {getNestedError('ownerDetails.admin_ben_user_address')?.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Preview and Image Upload */}
                <div className="space-y-4">
                    <div className="flex items-center mt-4">
                        <InputField
                            label="Transaction Code"
                            id="transactionCode"
                            type="text"
                            placeholder="Enter Code"
                            {...register('ownerDetails.transactionCode')}
                            error={getNestedError?.('ownerDetails.transactionCode')}
                        />
                    </div>
                    <div className="flex items-center">
                        <InputField
                            label="PIN:"
                            id="pin"
                            type="text"
                            placeholder="Enter PIN"
                            value={watch('ownerDetails.pin')}
                            onChange={handlePINChange}
                            error={getNestedError?.('ownerDetails.pin')}
                            helperText="Format: 123-45-0123-456-789"
                        />
                    </div>
                    <div className="flex items-center">
                        <InputField
                            label="TIN"
                            id="tin"
                            type="text"
                            placeholder="Enter TIN"
                            value={watch('ownerDetails.tin')}
                            onChange={handleTINChange}
                            error={getNestedError?.('ownerDetails.tin')}
                            helperText="Format: XXX-XXX-XXX-XXX"
                        />
                    </div>
                    <div className="flex items-center">
                        <InputField
                            label="Tel No."
                            id="telNo"
                            type="text"
                            placeholder="Enter Tel No."
                            {...register('ownerDetails.telNo')}
                            error={getNestedError?.('ownerDetails.telNo')}
                            helperText="Format: +639XXXXXXXXX or 09XXXXXXXXX"
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className="mt-6 pt-4">
                        <h3 className="text-lg font-semibold mb-4">ID Photos</h3>
                        
                        <ImageUploadGallery
                            images={imageListForPreview}
                            onChange={handleOwnerPhotosChange}
                            maxNumber={5}
                            multiple={true}
                            maxImageHeight="400px"
                            imageFit="contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateOwnerDetails;

