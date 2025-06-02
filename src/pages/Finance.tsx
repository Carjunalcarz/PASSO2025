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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {/* RPUS */}
                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400 p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-2">
                            <img
                                src="/mun_logo/pgan.webp"
                                alt="Agusan Logo"
                                className="w-14 h-14 opacity-90 sm:w-16 sm:h-16"
                            />
                            <div className="text-xl sm:text-2xl font-semibold text-white">RPUS</div>
                        </div>

                        <p className="text-base sm:text-lg font-semibold text-white mb-4">
                            Province of Agusan del Norte
                        </p>

                        {/* TAXABLE */}
                        <div className="mb-4">
                            <div className="badge bg-white/30 flex items-center gap-1 px-2 py-1 rounded text-white mt-2">
                                <IconCircleCheck className="w-4 h-4" />
                                <span className="text-sm sm:text-base">TAXABLE    {isLoading ? (
                                    <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                ) : (
                                    formatCurrency(taxable)
                                )} </span>
                            </div>
                        </div>

                        {/* EXEMPT */}
                        <div>
                            <div className="text-lg sm:text-xl font-bold text-white">

                            </div>
                            <div className="badge bg-yellow-500/60 flex items-center gap-1 px-2 py-1 rounded text-white mt-2">
                                <IconInfoCircle className="w-4 h-4" />
                                <span className="text-sm sm:text-base">EXEMPT    {isLoading ? (
                                    <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                ) : (
                                    formatCurrency(exempt)
                                )}</span>
                            </div>
                        </div>
                    </div>


                    {/* Market Value */}
                    <div className="panel bg-gradient-to-r from-violet-500 to-violet-400 p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-md sm:text-lg font-semibold text-white">Market Value</div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* TAXABLE */}
                            <div>
                                <div className=" text-xl sm:text-2xl font-bold text-white text-right">
                                    {isLoading ? (
                                        <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                    ) : (
                                        formatCurrencyPHP(taxableMarketValue)
                                    )}
                                </div>
                                <div className="flex items-center gap-1 badge bg-yellow-500/60 mt-2 px-2 py-1 rounded text-white text-sm sm:text-base">
                                    <IconCircleCheck className="w-4 h-4" />TAXABLE
                                </div>
                            </div>

                            {/* EXEMPT */}
                            <div>
                                <div className="text-xl sm:text-2xl font-bold text-white text-right">
                                    {isLoading ? (
                                        <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                    ) : (
                                        formatCurrencyPHP(exemptMarketValue)
                                    )}
                                </div>
                                <div className="flex items-center gap-1 badge bg-white/30 mt-2 px-2 py-1 rounded text-white text-sm sm:text-base">
                                    <IconInfoCircle className="w-4 h-4" />EXEMPT
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Assessment Value */}
                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-md sm:text-lg font-semibold text-white">Assessment Value</div>
                        </div>

                        {/* TAXABLE */}
                        <div className="mb-4">
                            <div className="text-xl sm:text-2xl font-bold text-white text-right">
                                {isLoading ? (
                                    <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                ) : (
                                    formatCurrencyPHP(taxableAssessmentValue)
                                )}
                            </div>
                            <div className="flex items-center gap-1 badge bg-yellow-500/60 mt-2 px-2 py-1 rounded text-white text-sm sm:text-base">
                                <IconCircleCheck className="w-4 h-4" />TAXABLE
                            </div>
                        </div>

                        {/* EXEMPT */}
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-white text-right">
                                {isLoading ? (
                                    <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                                ) : (
                                    formatCurrencyPHP(exemptAssessmentValue)
                                )}
                            </div>
                            <div className="flex items-center gap-1 badge bg-white/30 mt-2 px-2 py-1 rounded text-white text-sm sm:text-base">
                                <IconInfoCircle className="w-4 h-4" />EXEMPT
                            </div>
                        </div>
                    </div>

                    {/* Area */}
                    <div className="panel bg-gradient-to-r from-[#ea580c] to-[#c2410c]/60 p-3 sm:p-4 rounded-lg shadow-md w-full max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-md sm:text-lg font-semibold text-white">Area</div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-white text-right"> {isLoading ? (
                            <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                        ) : (
                            formatCurrency(taxableArea)
                        )}</div>
                        {/* TAXABLE */}
                        <div className="mb-3">
                            <div className="flex items-center gap-1 badge bg-yellow-500/60 mt-1 px-3 py-1 text-white text-sm sm:text-base rounded-md">
                                <IconCircleCheck className="w-4 h-4" />TAXABLE
                            </div>
                        </div>

                        {/* EXEMPT */}
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-white text-right"> {isLoading ? (
                                <span className="animate-spin border-4 border-[#f1f2f3] border-l-primary rounded-full w-6 h-6 inline-block" />
                            ) : (
                                formatCurrency(exemptArea)
                            )}</div>
                            <div className="flex items-center gap-1 badge bg-white/30 mt-1 px-3 py-1 text-white text-sm sm:text-base rounded-md">
                                <IconInfoCircle className="w-4 h-4" />EXEMPT
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
                                <MunicipalityPanel municipality="LAS NIEVES" logo="las-nieves.png" />
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
