import { Link } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { useEffect } from 'react';
import IconCircleCheck from '../components/Icon/IconCircleCheck';
import IconInfoCircle from '../components/Icon/IconInfoCircle';
import axios from 'axios';
import MunicipalityPanel from './Components/MunicipalityPanel';
import { useQueries } from '@tanstack/react-query';

const Finance = () => {
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('ADN-DATA'));
    }, [dispatch]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Common headers for axios requests
    const headers = { Authorization: `Bearer ${token}` };
    const baseUrl = `${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments`;

    // Currency formatters
    const formatCurrencyPHP = (amount: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

    // Using useQueries to fetch all required data in parallel
    const queries = useQueries({
        queries: [
            {
                queryKey: ['finance', 'total'],
                queryFn: async () => {
                    const res = await axios.get(baseUrl, { headers });
                    return res.data.total;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ['finance', 'countTaxable'],
                queryFn: async () => {
                    const res = await axios.get(`${baseUrl}/count/taxable`, { headers });
                    return res.data.count;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ['finance', 'countExempt'],
                queryFn: async () => {
                    const res = await axios.get(`${baseUrl}/count/exempt`, { headers });
                    return res.data.count;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ['finance', 'taxableMarketValue'],
                queryFn: async () => {
                    const res = await axios.get(`${baseUrl}/market-value/taxable`, { headers });
                    return res.data.taxable_market_value;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ['finance', 'exemptMarketValue'],
                queryFn: async () => {
                    const res = await axios.get(`${baseUrl}/market-value/exempt`, { headers });
                    return res.data.exempt_market_value;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ['finance', 'taxableAssessmentValue'],
                queryFn: async () => {
                    const res = await axios.get(`${baseUrl}/assessment-value/taxable`, { headers });
                    return res.data.taxable_assessment_value;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ['finance', 'exemptAssessmentValue'],
                queryFn: async () => {
                    const res = await axios.get(`${baseUrl}/assessment-value/exempt`, { headers });
                    return res.data.exempt_assessment_value;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ['finance', 'taxableArea'],
                queryFn: async () => {
                    const res = await axios.get(`${baseUrl}/area/taxable`, { headers });
                    return res.data.taxable_area;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ['finance', 'exemptArea'],
                queryFn: async () => {
                    const res = await axios.get(`${baseUrl}/area/exempt`, { headers });
                    return res.data.exempt_area;
                },
                staleTime: 5 * 60 * 1000,
            },
        ],
    });



    // Destructure data safely and set default to 0 if NaN
    const [
        totalRpus,
        taxable,
        exempt,
        taxableMarketValue,
        exemptMarketValue,
        taxableAssessmentValue,
        exemptAssessmentValue,
        taxableArea,
        exemptArea,
    ] = queries.map(q => {
        const value = Number(q.data);
        return isNaN(value) ? 0 : value;
    });

    const isLoading = queries.some(q => q.isLoading);
    const exempt_marketvalue_percentage = exemptMarketValue === 0 ? 0 : Math.min(100, Math.max(0, (exemptMarketValue / (exemptMarketValue + taxableMarketValue)) * 100));
    const taxable_marketvalue_percentage = exemptMarketValue === 0 ? 0 : Math.min(100, Math.max(0, (taxableMarketValue / (exemptMarketValue + taxableMarketValue)) * 100));
    const taxable_rpu_percentage = taxable === 0 ? 0 : Math.min(100, Math.max(0, (taxable / (exempt + taxable)) * 100));
    const exempt_rpu_percentage = exempt === 0 ? 0 : Math.min(100, Math.max(0, (exempt / (exempt + taxable)) * 100));
    const taxable_ass_percentage = taxableAssessmentValue === 0 ? 0 : Math.min(100, Math.max(0, (taxableAssessmentValue / (taxableAssessmentValue + exemptAssessmentValue)) * 100));
    const exempt_ass_percentage = exemptAssessmentValue === 0 ? 0 : Math.min(100, Math.max(0, (exemptAssessmentValue / (exemptAssessmentValue + taxableAssessmentValue)) * 100));
    const taxable_area_percentage = taxableArea === 0 ? 0 : Math.min(100, Math.max(0, (taxableArea / (taxableArea + exemptArea)) * 100));
    const exempt_area_percentage = exemptArea === 0 ? 0 : Math.min(100, Math.max(0, (exemptArea / (exemptArea + taxableArea)) * 100));




    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Agusan del Norte</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl1360:grid-cols-4 gap-4 mb-6">
                    {/* RPUS */}
                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400 p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-2">

                            <Link to={`/assessment/adn`}>
                                <img
                                    src={`/mun_logo/pgan.webp`}
                                    alt={`pgan Logo`}
                                    className="opacity-90 hover:opacity-100 transition-opacity duration-200 w-20 h-20 cursor-pointer"
                                />
                            </Link>
                            <h2 className='text-lg text-white'>Agusan del Norte</h2>
                            <div className="text-xl sm:text-2xl font-semibold text-white">

                                <h2 className='text-right'>RPUS</h2>
                            </div>
                        </div>



                        {/* TAXABLE */}
                        <div>
                            <div>
                                <div className="flex justify-between items-center text-lg  text-white text-right">
                                    <h2 className="flex items-center gap-1">
                                        <IconCircleCheck className="w-5 h-5" /> Taxable <span className='pl-2 font-bold'> {taxable_rpu_percentage.toFixed(2)} %</span>
                                    </h2>
                                    {isLoading ? (
                                        <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                    ) : (
                                        <span>{formatCurrency(taxable)}</span>
                                    )}

                                </div>
                                <div className="rounded-md h-6 bg-gray-100 shadow-inner overflow-hidden relative mt-1">
                                    {exempt_rpu_percentage > 0 && (
                                        <div
                                            className="bg-green-500 h-full rounded-md transition-all duration-500 ease-in-out flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                                            style={{ width: `${taxable_rpu_percentage}%` }}
                                        />
                                    )}
                                </div>
                            </div>



                        </div>

                        {/* EXEMPT */}
                        <div>
                            <div>
                                <div className="flex justify-between items-center text-lg  text-white text-right">
                                    <h2 className="flex items-center gap-1">
                                        <IconCircleCheck className="w-5 h-5" /> Exempt <span className='pl-2 font-bold'> {exempt_rpu_percentage.toFixed(2)} %</span>
                                    </h2>
                                    {isLoading ? (
                                        <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                    ) : (
                                        <span>{formatCurrency(exempt)}</span>
                                    )}

                                </div>
                                <div className="rounded-md h-6 bg-gray-100 shadow-inner overflow-hidden relative mt-1">
                                    {exempt_rpu_percentage > 0 && (
                                        <div
                                            className="bg-yellow-500 h-full rounded-md transition-all duration-500 ease-in-out flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                                            style={{ width: `${exempt_rpu_percentage}%` }}
                                        />
                                    )}
                                </div>
                            </div>



                        </div>

                    </div>


                    {/* Market Value */}
                    <div className="panel bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                        <div className="flex items-center ">
                            <div className="text-md sm:text-lg font-semibold text-white">Market Value</div>
                        </div>

                        <div className="grid grid-cols-1">
                            {/* TAXABLE */}
                            <div className="items-center text-lg  text-white text-right">
                                <div>
                                    <h2 className="flex items-center">
                                        <IconCircleCheck className="w-5 h-5" /> Taxable {taxable_marketvalue_percentage.toFixed(2)} %
                                    </h2></div>
                                {isLoading ? (
                                    <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                ) : (
                                    <span>{formatCurrencyPHP(taxableMarketValue)}</span>
                                )}
                            </div>
                            <div className="rounded-md h-6 bg-gray-100 shadow-inner overflow-hidden relative">
                                {exempt_rpu_percentage > 0 && (
                                    <div
                                        className="bg-green-600 h-full rounded-md transition-all duration-500 ease-in-out flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                                        style={{ width: `${taxable_marketvalue_percentage}%` }}
                                    />
                                )}
                            </div>

                            {/* EXEMPT */}
                            <div>
                                <div className="flex items-center text-lg  text-white text-right mt-2">
                                    <h2 className="flex items-center">
                                        <IconInfoCircle className="w-5 h-5" /> Exempt <span className='pl-2 font-bold'> {exempt_marketvalue_percentage.toFixed(2)} %</span>
                                    </h2>


                                </div>
                                <div className='items-center text-lg  text-white text-right'>
                                    {isLoading ? (
                                        <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                    ) : (
                                        <span>{formatCurrencyPHP(exemptMarketValue)}</span>
                                    )}
                                </div>
                                <div className="rounded-md h-6 bg-gray-100 shadow-inner overflow-hidden relative">
                                    {exempt_rpu_percentage > 0 && (
                                        <div
                                            className="bg-yellow-500 h-full rounded-md transition-all duration-500 ease-in-out flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                                            style={{ width: `${exempt_marketvalue_percentage}%` }}
                                        />
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>


                    {/* Assessed Value */}
                    <div className="panel bg-gradient-to-r from-violet-500 to-violet-400 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                        <div className="flex items-center ">
                            <div className="text-md sm:text-lg font-semibold text-white">Assessment Value</div>
                        </div>

                        <div className="grid grid-cols-1">
                            {/* TAXABLE */}
                            <div className="items-center text-lg  text-white text-right">
                                <div>
                                    <h2 className="flex items-center">
                                        <IconCircleCheck className="w-5 h-5" /> Taxable {taxable_ass_percentage.toFixed(2)} %
                                    </h2></div>
                                {isLoading ? (
                                    <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                ) : (
                                    <span>{formatCurrencyPHP(taxableAssessmentValue)}</span>
                                )}
                            </div>
                            <div className="rounded-md h-6 bg-gray-100 shadow-inner overflow-hidden relative">
                                {exempt_rpu_percentage > 0 && (
                                    <div
                                        className="bg-green-500 h-full rounded-md transition-all duration-500 ease-in-out flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                                        style={{ width: `${taxable_ass_percentage}%` }}
                                    />
                                )}
                            </div>

                            {/* EXEMPT */}
                            <div>
                                <div className="flex items-center text-lg  text-white text-right mt-2">
                                    <h2 className="flex items-center">
                                        <IconInfoCircle className="w-5 h-5" /> Exempt <span className='pl-2 font-bold'> {exempt_ass_percentage.toFixed(2)} %</span>
                                    </h2>


                                </div>
                                <div className='items-center text-lg  text-white text-right'>
                                    {isLoading ? (
                                        <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                    ) : (
                                        <span>{formatCurrencyPHP(exemptAssessmentValue)}</span>
                                    )}
                                </div>
                                <div className="rounded-md h-6 bg-gray-100 shadow-inner overflow-hidden relative">
                                    {exempt_rpu_percentage > 0 && (
                                        <div
                                            className="bg-yellow-500 h-full rounded-md transition-all duration-500 ease-in-out flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                                            style={{ width: `${exempt_ass_percentage}%` }}
                                        />
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>



                    {/* Area Value */}
                    <div className="panel   bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                        <div className="flex items-center ">
                            <div className="text-md sm:text-lg font-semibold text-white">Area Value</div>
                        </div>

                        <div className="grid grid-cols-1">
                            {/* TAXABLE */}
                            <div className="items-center text-lg  text-white text-right">
                                <div>
                                    <h2 className="flex items-center">
                                        <IconCircleCheck className="w-5 h-5" /> Taxable  {taxable_area_percentage.toFixed(2)} %
                                    </h2></div>
                                {isLoading ? (
                                    <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                ) : (
                                    <span>{formatCurrency(taxableArea)} sqm.</span>
                                )}
                            </div>
                            <div className="rounded-md h-6 bg-gray-100 shadow-inner overflow-hidden relative">
                                {exempt_rpu_percentage > 0 && (
                                    <div
                                        className="bg-green-500 h-full rounded-md transition-all duration-500 ease-in-out flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                                        style={{ width: `${taxable_area_percentage}%` }}
                                    />
                                )}
                            </div>

                            {/* EXEMPT */}
                            <div>
                                <div className="flex items-center text-lg  text-white text-right mt-2">
                                    <h2 className="flex items-center">
                                        <IconInfoCircle className="w-5 h-5" /> Exempt <span className='pl-2 font-bold'> {exempt_marketvalue_percentage.toFixed(2)} %</span>
                                    </h2>


                                </div>
                                <div className='items-center text-lg  text-white text-right'>
                                    {isLoading ? (
                                        <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                    ) : (
                                        <span>{formatCurrency(exemptArea)} sqm.</span>
                                    )}
                                </div>
                                <div className="rounded-md h-6 bg-gray-100 shadow-inner overflow-hidden relative">
                                    {exempt_rpu_percentage > 0 && (
                                        <div
                                            className="bg-yellow-500 h-full rounded-md transition-all duration-500 ease-in-out flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                                            style={{ width: `${exempt_area_percentage}%` }}
                                        />
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div>
                    {/* Favorites */}
                    <div>
                        <div className="flex items-center mb-5 font-bold">
                            <span className="text-lg">Favorites</span>
                            <button
                                type="button"
                                className="ltr:ml-auto rtl:mr-auto text-primary hover:text-black dark:hover:text-white-dark"
                            >
                                See All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:mb-5">
                            <div className="panel">
                                <MunicipalityPanel municipality="BUENAVISTA" logo="buenavista.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="CARMEN" logo="carmen.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="JABONGA" logo="jabonga.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="KITCHARAO" logo="kitcharao.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="MAGALLANES" logo="magallanes.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="LASNIEVES" logo="las-nieves.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="NASIPIT" logo="nasipit.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="SANTIAGO" logo="santiago.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="RTR" logo="rtr.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="TUBAY" logo="tubay.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Finance;
