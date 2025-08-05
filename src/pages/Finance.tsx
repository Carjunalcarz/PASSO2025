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
            <div className='overflow-x-auto scrollbar-hidden scrollbar-hover'>
                <div className='flex flex-wrap gap-4 mb-6'>
                    {/* Favorites */}
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6 md:mb-5">
                            <div className="panel">
                                <MunicipalityPanel municipality="" logo="pgan.webp" />
                            </div>
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
            </div>

        </div >

    );
};

export default Finance;
