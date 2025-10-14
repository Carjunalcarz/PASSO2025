import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { useEffect } from 'react';
import MunicipalityPanel from './Components/MunicipalityPanel';
import { useQuery } from '@tanstack/react-query';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

interface ChartData {
    name: string;
    data: number[];
}

// Collection ID for property assessments from environment variables
const PROPERTY_ASSESSMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROPERTY_ASSESSMENTS_COLLECTION_ID || 'property_assessments';

const Finance = () => {
    const { user } = useAuth();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('ADN-DATA'));
    }, [dispatch]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

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

    // Using useQuery to fetch analytics data from Appwrite
    const { data: analyticsData, isLoading, isError } = useQuery({
        queryKey: ['finance', 'analytics', PROPERTY_ASSESSMENTS_COLLECTION_ID],
        queryFn: async () => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            return await databaseService.getAnalytics(PROPERTY_ASSESSMENTS_COLLECTION_ID);
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!user, // Only run query if user is authenticated
    });

    // Show loading state if not authenticated
    if (!user) {
        return <div>Please log in to view analytics data</div>;
    }

    // Show loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Show error state
    if (isError) {
        return <div>Error loading data</div>;
    }

    // Destructure analytics data safely with defaults
    const {
        totalRpus = 0,
        taxableCount: taxable = 0,
        exemptCount: exempt = 0,
        taxableMarketValue = 0,
        exemptMarketValue = 0,
        taxableAssessmentValue = 0,
        exemptAssessmentValue = 0,
        taxableArea = 0,
        exemptArea = 0,
    } = analyticsData || {};

    // Common chart options
    const commonChartOptions = {
        chart: {
            toolbar: { show: false },
            type: 'bar' as const,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 3,
            },
        },
        dataLabels: {
            enabled: true,
        },
        colors: ['#4361ee', '#e7515a'],
        legend: {
            position: 'top' as const,
        },
    };

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


            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {/* RPU Distribution Chart */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">RPU Distribution</h5>
                    </div>
                    <ReactApexChart
                        type="bar"
                        height={300}
                        options={{
                            ...commonChartOptions,
                            xaxis: { categories: ['RPUs'] },
                            yaxis: {
                                title: { text: 'Number of RPUs' },
                                labels: {
                                    formatter: (val) => Math.round(val).toString()
                                }
                            },
                        }}
                        series={[
                            { name: 'Taxable', data: [taxable] },
                            { name: 'Exempt', data: [exempt] }
                        ]}
                    />
                </div>

                {/* Area Distribution Chart */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Area Distribution (sqm)</h5>
                    </div>
                    <ReactApexChart
                        type="bar"
                        height={300}
                        options={{
                            ...commonChartOptions,
                            xaxis: { categories: ['Area'] },
                            yaxis: {
                                title: { text: 'Square Meters' },
                                labels: {
                                    formatter: (val) => formatCurrency(val)
                                }
                            },
                        }}
                        series={[
                            { name: 'Taxable Area', data: [taxableArea] },
                            { name: 'Exempt Area', data: [exemptArea] }
                        ]}
                    />
                </div>

                {/* Market Value Distribution Chart */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Market Value Distribution</h5>
                    </div>
                    <ReactApexChart
                        type="bar"
                        height={300}
                        options={{
                            ...commonChartOptions,
                            xaxis: { categories: ['Market Value'] },
                            yaxis: {
                                title: { text: 'Amount (PHP)' },
                                labels: {
                                    formatter: (val) => formatCurrencyPHP(val)
                                }
                            },
                            dataLabels: {
                                enabled: true,
                                formatter: function (val: number) {
                                    return formatCurrencyPHP(val);
                                }
                            },
                            tooltip: {
                                y: {
                                    formatter: function (val: number) {
                                        return formatCurrencyPHP(val);
                                    }
                                }
                            }
                        }}
                        series={[
                            { name: 'Taxable Market Value', data: [taxableMarketValue] },
                            { name: 'Exempt Market Value', data: [exemptMarketValue] }
                        ]}
                    />
                </div>

                {/* Assessment Value Distribution Chart */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Assessment Value Distribution</h5>
                    </div>
                    <ReactApexChart
                        type="bar"
                        height={300}
                        options={{
                            ...commonChartOptions,
                            xaxis: { categories: ['Assessment Value'] },
                            yaxis: {
                                title: { text: 'Amount (PHP)' },
                                labels: {
                                    formatter: (val) => formatCurrencyPHP(val)
                                }
                            },
                            dataLabels: {
                                enabled: true,
                                formatter: function (val: number) {
                                    return formatCurrencyPHP(val);
                                }
                            },
                            tooltip: {
                                y: {
                                    formatter: function (val: number) {
                                        return formatCurrencyPHP(val);
                                    }
                                }
                            }
                        }}
                        series={[
                            { name: 'Taxable Assessment Value', data: [taxableAssessmentValue] },
                            { name: 'Exempt Assessment Value', data: [exemptAssessmentValue] }
                        ]}
                    />
                </div>
            </div>
            {/* Municipality panels */}
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
            </div>
        </div>


    );
};

export default Finance;
