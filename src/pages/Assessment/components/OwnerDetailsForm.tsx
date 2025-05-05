import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const OwnerDetailsForm: React.FC<{ register: any }> = ({ register }) => {


    return (
        <div className="flex justify-between lg:flex-row flex-col border border-[#e0e6ed] dark:border-[#17263c] rounded-lg p-10 bg-white dark:bg-[#0e1726]">
            <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 ">
                <div className="flex items-center">
                    <label htmlFor="tdArpNo" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        TD / ARP NO. :
                    </label>
                    <input
                        id="tdArpNo"
                        type="text"
                        {...register("tdArpNo")}
                        className="form-input flex-1"
                        placeholder="Enter TD / ARP NO."
                    />
                </div>
                <div className="mt-4 flex items-center">
                    <label htmlFor="owner" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        OWNER :
                    </label>
                    <input
                        id="owner"
                        type="text"
                        {...register("owner")}
                        className="form-input flex-1"
                        placeholder="Enter Owner"
                    />
                </div>
                <div className="mt-4 flex items-center">
                    <label htmlFor="ownerAddress" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        Address
                    </label>
                    <textarea
                        id="ownerAddress"
                        {...register("ownerAddress")}
                        className="form-textarea flex-1 resize-none rounded-lg border border-[#e0e6ed] bg-white px-4 py-2 text-sm font-normal text-black focus:border-primary focus:outline-none dark:border-[#17263c] dark:bg-[#121e32] dark:text-white-dark"
                        placeholder="Enter address here..."
                    ></textarea>
                </div>
                <div className="mt-4 flex items-center">
                    <label htmlFor="adminUser" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        Administrator / Benificial User :
                    </label>
                    <input
                        id="adminUser"
                        type="text"
                        {...register("adminUser")}
                        className="form-input flex-1"
                        placeholder="Enter Administrator / Benificial User"
                    />
                </div>
                <div className="mt-4 flex items-center">
                    <label htmlFor="adminAddress" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        Address:
                    </label>
                    <textarea
                        id="adminAddress"
                        {...register("adminAddress")}
                        className="form-textarea flex-1 resize-none rounded-lg border border-[#e0e6ed] bg-white px-4 py-2 text-sm font-normal text-black focus:border-primary focus:outline-none dark:border-[#17263c] dark:bg-[#121e32] dark:text-white-dark"
                        placeholder="Enter address here..."
                    ></textarea>
                </div>
            </div>
            <div className="lg:w-1/2 w-full">
                <div className="flex items-center ">
                    <label htmlFor="transactionCode" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        TRANSACTION CODE :
                    </label>
                    <input
                        id="transactionCode"
                        type="text"
                        {...register("transactionCode")}
                        className="form-input flex-1"
                        placeholder="Enter  Transaction Code"
                    />
                </div>
                <div className="flex items-center mt-4">
                    <label htmlFor="pin" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        PIN:
                    </label>
                    <input
                        id="pin"
                        type="text"
                        {...register("pin")}
                        className="form-input flex-1"
                        placeholder="Enter PIN"
                    />
                </div>
                <div className="flex items-center mt-4">
                    <label htmlFor="tin" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        TIN
                    </label>
                    <input
                        id="tin"
                        type="text"
                        {...register("tin")}
                        className="form-input flex-1"
                        placeholder="Enter TIN"
                    />
                </div>
                <div className="flex items-center mt-4">
                    <label htmlFor="telNo" className="ltr:mr-2 rtl:ml-2 w-1/3 mb-0">
                        Tel No.
                    </label>
                    <input
                        id="telNo"
                        type="text"
                        {...register("telNo")}
                        className="form-input flex-1"
                        placeholder="Enter Tel No."
                    />
                </div>
            </div>
        </div>
    );
};

export default OwnerDetailsForm;
