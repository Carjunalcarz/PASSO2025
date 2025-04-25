const PersonalInfo = () => {
    return (
        <div className="mt-8 px-10">
            <div className="flex justify-between lg:flex-row flex-col">
                <div className="lg:w-1/2 w-full ltr:lg:mr-6 rtl:lg:ml-6 mb-6">
                    <div className="flex items-center">
                        <label htmlFor="reciever-email" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
                            TD / ARP NO. :
                        </label>
                        <input id="reciever-email" type="email" name="reciever-email" className="form-input flex-1" placeholder="Enter TD / ARP NO." />
                    </div>
                    <div className="mt-4 flex items-center">
                        <label htmlFor="reciever-email" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
                            OWNER :
                        </label>
                        <input id="reciever-email" type="email" name="reciever-email" className="form-input flex-1" placeholder="Enter Owner" />
                    </div>
                    <div className="mt-4 flex items-center">
                        <label htmlFor="reciever-address" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
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
                        <label htmlFor="reciever-number" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
                            Administrator / Benificial User :
                        </label>
                        <input id="reciever-number" type="text" name="reciever-number" className="form-input flex-1" placeholder="Enter Administrator / Benificial User" />
                    </div>
                    <div className="mt-4 flex items-center">
                        <label htmlFor="reciever-number" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
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
                    <div className="flex items-center">
                        <label htmlFor="acno" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
                            TRANSACTION CODE :
                        </label>
                        <input id="acno" type="text" name="acno" className="form-input flex-1" placeholder="Enter Transaction Code" />
                    </div>
                    <div className="flex items-center mt-4">
                        <label htmlFor="acno" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
                            PIN:
                        </label>
                        <input id="acno" type="text" name="acno" className="form-input flex-1" placeholder="Enter PIN" />
                    </div>
                    <div className="flex items-center mt-4">
                        <label htmlFor="bank-name" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
                            TIN
                        </label>
                        <input id="bank-name" type="text" name="bank-name" className="form-input flex-1" placeholder="Enter TIN" />
                    </div>
                    <div className="flex items-center mt-4">
                        <label htmlFor="swift-code" className="ltr:mr-2 rtl:ml-2 w-1/4 mb-0">
                            Tel No.
                        </label>
                        <input id="swift-code" type="text" name="swift-code" className="form-input flex-1" placeholder="Enter Tel No." />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;



