import IconCircleCheck from '../../components/Icon/IconCircleCheck';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import axios from 'axios';
import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';

const token = localStorage.getItem('token');

interface MunicipalityPanelProps {
    municipality: string;
    logo: string;
}

const endpoints = [
    { key: 'taxable', url: 'count/taxable' },
    { key: 'exempt', url: 'count/exempt' },
    { key: 'taxableMarketValue', url: 'market-value/taxable' },
    { key: 'exemptMarketValue', url: 'market-value/exempt' },
    { key: 'taxableAssessmentValue', url: 'assessment-value/taxable' },
    { key: 'exemptAssessmentValue', url: 'assessment-value/exempt' },
    { key: 'taxableArea', url: 'area/taxable' },
    { key: 'exemptArea', url: 'area/exempt' },
];

const MunicipalityPanel = ({ municipality, logo }: MunicipalityPanelProps) => {
    const [showTaxable, setShowTaxable] = useState(true);

    const queries = useQueries({
        queries: endpoints.map(({ key, url }) => ({
            queryKey: ['municipality', key, municipality],
            queryFn: async () => {
                const res = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/${url}?municipality=${municipality}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return Object.values(res.data)[0]; // single value per endpoint
            },
            staleTime: 5 * 60 * 1000,
        })),
    });

    const isLoading = queries.some(q => q.isLoading);
    const isError = queries.some(q => q.isError);

    if (isLoading) return <div>
        <p className='text-white-dark'> Fetching Data ... - {municipality}</p>
        <span className="animate-[spin_3s_linear_infinite] border-8 border-r-warning border-l-primary border-t-danger border-b-success rounded-full w-14 h-14 inline-block align-middle m-auto mb-10"></span></div>;
    if (isError) return <div>Error fetching data</div>;

    const [
        taxable,
        exempt,
        taxableMarketValue,
        exemptMarketValue,
        taxableAssessmentValue,
        exemptAssessmentValue,
        taxableArea,
        exemptArea,
    ] = queries.map(q => q.data as number);

    const totalRpus = taxable;

    const current = {
        marketValue: showTaxable ? taxableMarketValue : exemptMarketValue,
        assessmentValue: showTaxable ? taxableAssessmentValue : exemptAssessmentValue,
        area: showTaxable ? taxableArea : exemptArea,
    };

    const total = {
        marketValue: taxableMarketValue + exemptMarketValue,
        assessmentValue: taxableAssessmentValue + exemptAssessmentValue,
        area: taxableArea + exemptArea,
    };

    const currency = (value: number) =>
        new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);

    const getPercentage = (value: number, total: number) =>
        total === 0 ? '0.00' : ((value / total) * 100).toFixed(2);

    return (
        <div className="font-semibold mb-5">
            <img src={`/mun_logo/${logo}`} alt={`${municipality} Logo`} className="opacity-2 w-20 h-20" />
            <div className="flex items-center font-semibold mb-5">
                <div className="ltr:ml-2 rtl:mr-2">
                    <h6 className="text-dark dark:text-white-light">
                        {municipality === 'REMEDIOS T. ROMUALDEZ' ? 'RTR' : municipality}
                    </h6>
                    <p className="text-xs text-gray-500">RPUS</p>
                    <div className="flex items-center space-x-2">
                        <p className="text-green-500 text-xs flex items-center">
                            <IconCircleCheck className="w-4 h-4 mr-1" />{currency(totalRpus)}
                        </p>
                        <p className="text-yellow-500/60 text-xs flex items-center">
                            <IconInfoCircle className="w-4 h-4 mr-1" />{currency(exempt)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowTaxable(!showTaxable)}
                    className="ml-auto px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                    {showTaxable ? 'Show Exempt' : 'Show Taxable'}
                </button>
            </div>

            {/* Market Value */}
            <ProgressBar
                title="Market Value"
                value={current.marketValue}
                total={total.marketValue}
                color="from-[#7579ff] to-[#b224ef]"
            />

            {/* Assessment Value */}
            <ProgressBar
                title="Assessment Value"
                value={current.assessmentValue}
                total={total.assessmentValue}
                color="from-[#60a5fa] to-[#3b82f6]"
            />

            {/* Area */}
            <ProgressBar
                title="Area"
                value={current.area}
                total={total.area}
                color="from-[#fb923c] to-[#f97316]"
            />
        </div>
    );
};

interface ProgressBarProps {
    title: string;
    value: number;
    total: number;
    color: string;
}

const ProgressBar = ({ title, value, total, color }: ProgressBarProps) => (
    <div className="flex-1 mt-2">
        <div className="flex font-semibold text-white-dark mb-2">
            <h6>{title} <span className="text-xs text-[#7579ff]">{total === 0 ? '0.00' : ((value / total) * 100).toFixed(2)}%</span></h6>
            <p className="ltr:ml-auto rtl:mr-auto">
                {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}
            </p>
        </div>
        <div className="rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
            <div
                className={`bg-gradient-to-r ${color} h-full rounded-full transition-all duration-300`}
                style={{ width: `${total === 0 ? 0 : (value / total) * 100}%` }}
            ></div>
        </div>
    </div>
);

export default MunicipalityPanel;
