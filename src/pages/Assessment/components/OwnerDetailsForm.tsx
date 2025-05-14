import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import InputField from './shared/InputField';


const OwnerDetailsForm: React.FC<{ register: any, watch: any, setValue: any }> = ({ register, watch, setValue }) => {

    const td_barangay = watch('buildingLocation.address_barangay');
    const td_municipality = watch('buildingLocation.address_municipality');

    console.log(td_barangay);
    return (
        <div className="flex justify-between lg:flex-row flex-col border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-10 bg-white dark:bg-[#0e1726]">
            <div className="lg:w-1/2 w-full">
                <div className="flex items-center mt-4">
                    <InputField
                        value={`${!td_municipality ? 'Municipality' : td_municipality} / ${!td_barangay ? 'Barangay' : td_barangay}`}
                        label="TD / ARP NO."
                        id="tdArpNo"
                        type="text"
                        placeholder="Enter TD / ARP NO."
                        {...register('ownerDetails.td')}
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
                        id="ownerAddress"
                        name="ownerAddress"
                        className="form-input ltr:rounded-l-none rtl:rounded-r-none flex-1"
                        placeholder="Enter Owner"
                        {...register("ownerDetail.ownerAddress")}
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
