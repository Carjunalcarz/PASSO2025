import IconCircleCheck from '../../components/Icon/IconCircleCheck';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import axios from 'axios';
import { useEffect, useState } from 'react';
const token = localStorage.getItem('token');
interface MunicipalityPanelProps {
    municipality: string;
    logo: string;

}

const MunicipalityPanel = ({ municipality, logo }: MunicipalityPanelProps) => {
    const [totalRpus, setTotalRpus] = useState(0);
    const [taxable, setTaxable] = useState(0);
    const [exempt, setExempt] = useState(0);
    const [taxableMarketValue, setTaxableMarketValue] = useState(0);
    const [exemptMarketValue, setExemptMarketValue] = useState(0);
    const [taxableAssessmentValue, setTaxableAssessmentValue] = useState(0);
    const [exemptAssessmentValue, setExemptAssessmentValue] = useState(0);
    const [taxableArea, setTaxableArea] = useState(0);
    const [exemptArea, setExemptArea] = useState(0);
    const [showTaxable, setShowTaxable] = useState(true);
   

    useEffect(() => {
        const fetchData = async () => {
            const municipality_count_taxable = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/count/taxable?municipality=${municipality}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const municipality_count_exempt = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/count/exempt?municipality=${municipality}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });


            const municipality_taxable_market_value = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/market-value/taxable?municipality=${municipality}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const municipality_exempt_market_value = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/market-value/exempt?municipality=${municipality}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const municipality_taxable_assessment_value = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/assessment-value/taxable?municipality=${municipality}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const municipality_exempt_assessment_value = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/assessment-value/exempt?municipality=${municipality}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const municipality_taxable_area = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/area/taxable?municipality=${municipality}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const municipality_exempt_area = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/area/exempt?municipality=${municipality}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            

         setTotalRpus(municipality_count_taxable.data.count);
         setTaxable(municipality_count_taxable.data.count);
         setExempt(municipality_count_exempt.data.count);
         setTaxableMarketValue(municipality_taxable_market_value.data.taxable_market_value);
         setExemptMarketValue(municipality_exempt_market_value.data.exempt_market_value);
         setTaxableAssessmentValue(municipality_taxable_assessment_value.data.taxable_assessment_value);
         setExemptAssessmentValue(municipality_exempt_assessment_value.data.exempt_assessment_value);
         setTaxableArea(municipality_taxable_area.data.taxable_area);
         setExemptArea(municipality_exempt_area.data.exempt_area);



        };
        fetchData();
    }, []);



    const currency = (value: number) => {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
    }

    return (
        <div className="font-semibold mb-5">
            <img src={`/mun_logo/${logo}`} alt="Agusan Logo" className="opacity-2 w-20 h-20" />
            <div className="flex items-center font-semibold mb-5">
            <div className="ltr:ml-2 rtl:mr-2">
                <h6 className="text-dark dark:text-white-light">{municipality=="REMEDIOS T. ROMUALDEZ" ? "RTR" : municipality}</h6>
                <p className="text-xs text-gray-500">RPUS</p>
                <div className="flex items-center space-x-2">
                    <p className="text-green-500 text-xs flex items-center"> <IconCircleCheck className="w-4 h-4 mr-1" />{currency(totalRpus)}</p>
                    <p className="text-yellow-500/60 text-xs flex items-center"> <IconInfoCircle className="w-4 h-4 mr-1" />{currency(exempt)}</p>
                </div>
            </div>
            <button 
                onClick={() => setShowTaxable(!showTaxable)}
                className="ml-auto px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary-dark transition-colors"
            >
                {showTaxable ? 'Show Exempt' : 'Show Taxable'}
            </button>
            </div>
            <div className="flex-1">
                <div className="flex font-semibold text-white-dark mb-2">
                <h6>Market Value <span className="text-xs text-[#7579ff]">
                    {((showTaxable ? taxableMarketValue : exemptMarketValue) / (taxableMarketValue+exemptMarketValue) * 100).toFixed(2)}%
                </span></h6>
                    <p className="ltr:ml-auto rtl:mr-auto">{currency(showTaxable ? taxableMarketValue : exemptMarketValue)}</p>
                </div>
                <div className="rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                    <div 
                        className="bg-gradient-to-r from-[#7579ff] to-[#b224ef] h-full rounded-full transition-all duration-300"
                        style={{ width: `${((showTaxable ? taxableMarketValue : exemptMarketValue) / (taxableMarketValue+exemptMarketValue)) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex-1 mt-2">
                <div className="flex font-semibold text-white-dark mb-2">
                    <h6>Assessment Value <span className="text-xs text-[#60a5fa]">
                        {((showTaxable ? taxableAssessmentValue : exemptAssessmentValue) / (taxableAssessmentValue+exemptAssessmentValue) * 100).toFixed(2)}%
                    </span></h6>
                    <p className="ltr:ml-auto rtl:mr-auto">{currency(showTaxable ? taxableAssessmentValue : exemptAssessmentValue)}</p>
                </div>
                <div className="rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                    <div 
                        className="bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] h-full rounded-full transition-all duration-300"
                        style={{ width: `${((showTaxable ? taxableAssessmentValue : exemptAssessmentValue) / (taxableAssessmentValue+exemptAssessmentValue)) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex-1 mt-2">
                <div className="flex font-semibold text-white-dark mb-2">
                    <h6>Area <span className="text-xs text-[#fb923c]">
                        {((showTaxable ? taxableArea : exemptArea) / (taxableArea+exemptArea) * 100).toFixed(2)}%
                    </span></h6>
                    <p className="ltr:ml-auto rtl:mr-auto">{currency(showTaxable ? taxableArea : exemptArea)}</p>
                </div>
                <div className="rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                    <div 
                        className="bg-gradient-to-r from-[#fb923c] to-[#f97316] h-full rounded-full transition-all duration-300"
                        style={{ width: `${((showTaxable ? taxableArea : exemptArea) / (taxableArea+exemptArea)) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

function setTotalRpus(total: any) {
    throw new Error('Function not implemented.');
}
function setTaxableAssessmentValue(taxable_assessment_value: any) {
    throw new Error('Function not implemented.');
}


export default MunicipalityPanel;
