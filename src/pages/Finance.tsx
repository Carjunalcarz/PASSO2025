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
    ] = queries.map(q => isNaN(q.data) ? 0 : q.data);

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Finance</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                        <div className="flex justify-between">
                            <img src="/mun_logo/pgan.webp" alt="Agusan Logo" className="w-[70px] h-[70px] opacity-2" />
                            <div className="text-2xl flex-rows text-md font-semibold">RPUS</div>
                        </div>
                        <p className="p-2 text-md font-semibold">Province of Agusan del Norte</p>
                        <div className="flex items-center">
                            <div className="text-xl font-bold ltr:mr-[100px]">{formatCurrency(taxable)}</div>
                            <div className="badge bg-white/30 flex items-center gap-1">
                                <IconCircleCheck className="w-4 h-4" />
                                TAXABLE
                            </div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-xl font-bold ltr:mr-[115px]">{formatCurrency(exempt)}</div>
                            <div className="badge bg-yellow-500/60 flex items-center gap-1">
                                <IconInfoCircle className="w-4 h-4" />
                                EXEMPT
                            </div>
                        </div>
                    </div>

                    {/* Market Value */}
                    <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Market Value</div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-5">
                            <div>
                                <div className="text-2xl font-bold">{formatCurrencyPHP(taxableMarketValue)}</div>
                                <div className="badge bg-yellow-500/60 mt-2">TAXABLE</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{formatCurrencyPHP(exemptMarketValue)}</div>
                                <div className="badge bg-white/30 mt-2">EXEMPT</div>
                            </div>
                        </div>
                    </div>

                    {/* Assessment Value */}
                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Assessment Value</div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-5">
                            <div>
                                <div className="text-2xl font-bold">{formatCurrencyPHP(taxableAssessmentValue)}</div>
                                <div className="badge bg-yellow-500/60 mt-2">TAXABLE</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{formatCurrencyPHP(exemptAssessmentValue)}</div>
                                <div className="badge bg-white/30 mt-2">EXEMPT</div>
                            </div>
                        </div>
                    </div>

                    {/* Area */}
                    <div className="panel bg-gradient-to-r from-[#ea580c] to-[#c2410c]/60">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Area</div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-5">
                            <div>
                                <div className="text-2xl font-bold">{formatCurrency(taxableArea)}</div>
                                <div className="badge bg-yellow-500/60 mt-2">TAXABLE</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{formatCurrency(exemptArea)}</div>
                                <div className="badge bg-white/30 mt-2">EXEMPT</div>
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
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:mb-5">
                            <div className="panel">
                                <MunicipalityPanel municipality="BUENAVISTA" logo="buenavista.jpg" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="CARMEN" logo="carmen.jpg" />
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
                                <MunicipalityPanel municipality="KITCHARAO" logo="kitcharao.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="REMEDIOS T. ROMUALDEZ" logo="rtr.png" />
                            </div>
                            <div className="panel">
                                <MunicipalityPanel municipality="TUBAY" logo="tubay.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;
