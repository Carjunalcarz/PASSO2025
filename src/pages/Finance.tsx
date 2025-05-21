import { Link } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { useEffect, useState } from 'react';
import IconHorizontalDots from '../components/Icon/IconHorizontalDots';
import IconEye from '../components/Icon/IconEye';
import IconBitcoin from '../components/Icon/IconBitcoin';
import IconEthereum from '../components/Icon/IconEthereum';
import IconLitecoin from '../components/Icon/IconLitecoin';
import IconBinance from '../components/Icon/IconBinance';
import IconTether from '../components/Icon/IconTether';
import IconSolana from '../components/Icon/IconSolana';
import IconCircleCheck from '../components/Icon/IconCircleCheck';
import IconInfoCircle from '../components/Icon/IconInfoCircle';
import axios from 'axios';

const Finance = () => {
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const [totalRpus, setTotalRpus] = useState(0);
    const [taxable, setTaxable] = useState(0);
    const [exempt, setExempt] = useState(0);
    const [taxableMarketValue, setTaxableMarketValue] = useState(0);
    const [exemptMarketValue, setExemptMarketValue] = useState(0);
    const [taxableAssessmentValue, setTaxableAssessmentValue] = useState(0);
    const [exemptAssessmentValue, setExemptAssessmentValue] = useState(0);
    const [taxableArea, setTaxableArea] = useState(0);
    const [exemptArea, setExemptArea] = useState(0);
    const [countTaxableCarmenRpu, setCountTaxableCarmenRpu] = useState(0);
    const [countExemptCarmenRpu, setCountExemptCarmenRpu] = useState(0);
    useEffect(() => {
        dispatch(setPageTitle('Finance'));
    });
    //bitcoinoption
    const bitcoin: any = {
        series: [
            {
                data: [204440, 400333, 33333],
            },
        ],
        options: {
            chart: {
                height: 45,
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                width: 2,
            },
            markers: {
                size: 0,
            },
            colors: ['#00ab55'],
            grid: {
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
            responsive: [
                {
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 95,
                        },
                        grid: {
                            padding: {
                                top: 45,
                                bottom: 0,
                                left: 0,
                            },
                        },
                    },
                },
            ],
        },
    };

    //ethereumoption
    const ethereum: any = {
        series: [
            {
                data: [44, 25, 59, 41, 66, 25, 21, 9, 36, 12],
            },
        ],
        options: {
            chart: {
                height: 45,
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                width: 2,
            },
            markers: {
                size: 0,
            },
            colors: ['#e7515a'],
            grid: {
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
            responsive: [
                {
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 95,
                        },
                        grid: {
                            padding: {
                                top: 45,
                                bottom: 0,
                                left: 0,
                            },
                        },
                    },
                },
            ],
        },
    };

    //litecoinoption
    const litecoin: any = {
        series: [
            {
                data: [9, 21, 36, 12, 66, 25, 44, 25, 41, 59],
            },
        ],
        options: {
            chart: {
                height: 45,
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                width: 2,
            },
            markers: {
                size: 0,
            },
            colors: ['#00ab55'],
            grid: {
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
            responsive: [
                {
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 95,
                        },
                        grid: {
                            padding: {
                                top: 45,
                                bottom: 0,
                                left: 0,
                            },
                        },
                    },
                },
            ],
        },
    };

    //binanceoption
    const binance: any = {
        series: [
            {
                data: [25, 44, 25, 59, 41, 21, 36, 12, 19, 9],
            },
        ],
        options: {
            chart: {
                height: 45,
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                width: 2,
            },
            markers: {
                size: 0,
            },
            colors: ['#e7515a'],
            grid: {
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
            responsive: [
                {
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 95,
                        },
                        grid: {
                            padding: {
                                top: 45,
                                bottom: 0,
                                left: 0,
                            },
                        },
                    },
                },
            ],
        },
    };

    //tetheroption
    const tether: any = {
        series: [
            {
                data: [21, 59, 41, 44, 25, 66, 9, 36, 25, 12],
            },
        ],
        options: {
            chart: {
                height: 45,
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                width: 2,
            },
            markers: {
                size: 0,
            },
            colors: ['#00ab55'],
            grid: {
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
            responsive: [
                {
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 95,
                        },
                        grid: {
                            padding: {
                                top: 45,
                                bottom: 0,
                                left: 0,
                            },
                        },
                    },
                },
            ],
        },
    };

    //solanaoption
    const solana: any = {
        series: [
            {
                data: [21, -9, 36, -12, 44, 25, 59, -41, 66, -25],
            },
        ],
        options: {
            chart: {
                height: 45,
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                width: 2,
            },
            markers: {
                size: 0,
            },
            colors: ['#e7515a'],
            grid: {
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
            responsive: [
                {
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 95,
                        },
                        grid: {
                            padding: {
                                top: 45,
                                bottom: 0,
                                left: 0,
                            },
                        },
                    },
                },
            ],
        },
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    // Add currency formatter
    const formatCurrencyPHP = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // ... existing code ...
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const count_taxable = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/count/taxable`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const count_exempt = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/count/exempt`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });


            const taxable_market_value = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/market-value/taxable`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const exempt_market_value = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/market-value/exempt`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const taxable_assessment_value = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/assessment-value/taxable`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const exempt_assessment_value = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/assessment-value/exempt`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const taxable_area = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/area/taxable`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const exempt_area = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/area/exempt`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const count_taxable_carmen_rpu = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/count/taxable?municipality=carmen`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const count_exempt_carmen_rpu = await axios.get(`${import.meta.env.VITE_API_URL_FASTAPI}/property-assessments/count/exempt?municipality=carmen`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });



            setTotalRpus(response.data.total);
            setTaxable(count_taxable.data.count);
            setExempt(count_exempt.data.count);
            setTaxableMarketValue(taxable_market_value.data.taxable_market_value);
            setExemptMarketValue(exempt_market_value.data.exempt_market_value);
            setTaxableAssessmentValue(taxable_assessment_value.data.taxable_assessment_value);
            setExemptAssessmentValue(exempt_assessment_value.data.exempt_assessment_value);
            setTaxableArea(taxable_area.data.taxable_area);
            setExemptArea(exempt_area.data.exempt_area);



            setCountTaxableCarmenRpu(count_taxable_carmen_rpu.data.count);
            setCountExemptCarmenRpu(count_exempt_carmen_rpu.data.count);
        };
        fetchData();
    }, []);



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

                    {/* Sessions */}
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

                    {/*  Time On-Site */}
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

                    {/* Bounce Rate */}
                    <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
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

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/*  Favorites  */}
                    <div>
                        <div className="flex items-center mb-5 font-bold">
                            <span className="text-lg">Favorites</span>
                            <button type="button" className="ltr:ml-auto rtl:mr-auto text-primary hover:text-black dark:hover:text-white-dark">
                                See All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:mb-5">
                            {/*  Bitcoin  */}
                            <div className="panel">
                                <div className="flex items-center font-semibold mb-5">
                                    
                                        <img src="/mun_logo/nasipit.png" alt="Agusan Logo" className="opacity-2 w-20 h-20" />
                                   
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6 className="text-dark dark:text-white-light">NASIPIT</h6>
                                        <p className="text-xs text-gray-500">RPUS</p>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-green-500 text-xs flex items-center"> <IconCircleCheck className="w-4 h-4 mr-1" /> {formatCurrency(countTaxableCarmenRpu)}</p>
                                            <p className="text-yellow-500/60 text-xs flex items-center"> <IconInfoCircle className="w-4 h-4 mr-1" /> {formatCurrency(countExemptCarmenRpu)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-5 overflow-hidden">
                                    <ReactApexChart series={ethereum.series} options={ethereum.options} type="line" height={45} />
                                </div>
                                <div className="flex justify-between items-center font-bold text-base">
                                    $21,000 <span className="text-danger font-normal text-sm">-1.25%</span>
                                </div>
                            </div>
                            {/*  Ethereum*/}
                            <div className="panel">
                                <div className="flex items-center font-semibold mb-5">
                                    <div className="shrink-0 w-10 h-10 bg-warning rounded-full grid place-content-center p-2">
                                        <IconEthereum />
                                    </div>
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6 className="text-dark dark:text-white-light">ETH</h6>
                                        <p className="text-white-dark text-xs">Ethereum</p>
                                    </div>
                                </div>
                                <div className="mb-5 overflow-hidden">
                                    <ReactApexChart series={ethereum.series} options={ethereum.options} type="line" height={45} />
                                </div>
                                <div className="flex justify-between items-center font-bold text-base">
                                    $21,000 <span className="text-danger font-normal text-sm">-1.25%</span>
                                </div>
                            </div>
                            {/*  Litecoin*/}
                            <div className="panel">
                                <div className="flex items-center font-semibold mb-5">
                                    <div className="shrink-0 w-10 h-10 rounded-full grid place-content-center">
                                        <IconLitecoin />
                                    </div>
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6 className="text-dark dark:text-white-light">LTC</h6>
                                        <p className="text-white-dark text-xs">Litecoin</p>
                                    </div>
                                </div>
                                <div className="mb-5 overflow-hidden">
                                    <ReactApexChart series={litecoin.series} options={litecoin.options} type="line" height={45} />
                                </div>
                                <div className="flex justify-between items-center font-bold text-base">
                                    $11,657 <span className="text-success font-normal text-sm">+0.25%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*  Prices  */}
                    <div>
                        <div className="flex items-center mb-5 font-bold">
                            <span className="text-lg">Live Prices</span>
                            <button type="button" className="ltr:ml-auto rtl:mr-auto text-primary hover:text-black dark:hover:text-white-dark">
                                See All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                            {/*  Binance */}
                            <div className="panel">
                                <div className="flex items-center font-semibold mb-5">
                                    <div className="shrink-0 w-10 h-10 rounded-full grid place-content-center">
                                        <IconBinance />
                                    </div>
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6 className="text-dark dark:text-white-light">BNB</h6>
                                        <p className="text-white-dark text-xs">Binance</p>
                                    </div>
                                </div>
                                <div className="mb-5 overflow-hidden">
                                    <ReactApexChart series={binance.series} options={binance.options} type="line" height={45} />
                                </div>
                                <div className="flex justify-between items-center font-bold text-base">
                                    $21,000 <span className="text-danger font-normal text-sm">-1.25%</span>
                                </div>
                            </div>
                            {/*  Tether  */}
                            <div className="panel">
                                <div className="flex items-center font-semibold mb-5">
                                    <div className="shrink-0 w-10 h-10 rounded-full grid place-content-center">
                                        <IconTether />
                                    </div>
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6 className="text-dark dark:text-white-light">USDT</h6>
                                        <p className="text-white-dark text-xs">Tether</p>
                                    </div>
                                </div>
                                <div className="mb-5 overflow-hidden">
                                    <ReactApexChart series={tether.series} options={tether.options} type="line" height={45} />
                                </div>
                                <div className="flex justify-between items-center font-bold text-base">
                                    $20,000 <span className="text-success font-normal text-sm">+0.25%</span>
                                </div>
                            </div>
                            {/*  Solana */}
                            <div className="panel">
                                <div className="flex items-center font-semibold mb-5">
                                    <div className="shrink-0 w-10 h-10 bg-warning rounded-full p-2 grid place-content-center">
                                        <IconSolana />
                                    </div>
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6 className="text-dark dark:text-white-light">SOL</h6>
                                        <p className="text-white-dark text-xs">Solana</p>
                                    </div>
                                </div>
                                <div className="mb-5 overflow-hidden">
                                    <ReactApexChart series={solana.series} options={solana.options} type="line" height={45} />
                                </div>
                                <div className="flex justify-between items-center font-bold text-base">
                                    $21,000 <span className="text-danger font-normal text-sm">-1.25%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="grid gap-6 xl:grid-flow-row">
                        {/*  Previous Statement  */}
                        <div className="panel overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-lg font-bold">Previous Statement</div>
                                    <div className="text-success"> Paid on June 27, 2022 </div>
                                </div>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        btnClassName="hover:opacity-80"
                                        button={<IconHorizontalDots className="hover:opacity-80 opacity-70" />}
                                    >
                                        <ul>
                                            <li>
                                                <button type="button">View Report</button>
                                            </li>
                                            <li>
                                                <button type="button">Edit Report</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="relative mt-10">
                                <div className="absolute -bottom-12 ltr:-right-12 rtl:-left-12 w-24 h-24">
                                    <IconCircleCheck className="text-success opacity-20 w-full h-full" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-primary">Card Limit</div>
                                        <div className="mt-2 font-semibold text-2xl">$50,000.00</div>
                                    </div>
                                    <div>
                                        <div className="text-primary">Spent</div>
                                        <div className="mt-2 font-semibold text-2xl">$15,000.00</div>
                                    </div>
                                    <div>
                                        <div className="text-primary">Minimum</div>
                                        <div className="mt-2 font-semibold text-2xl">$2,500.00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*  Current Statement */}
                        <div className="panel overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-lg font-bold">Current Statement</div>
                                    <div className="text-danger"> Must be paid before July 27, 2022 </div>
                                </div>
                                <div className="dropdown">
                                    <Dropdown offset={[0, 5]} placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="hover:opacity-80 opacity-70" />}>
                                        <ul>
                                            <li>
                                                <button type="button">View Report</button>
                                            </li>
                                            <li>
                                                <button type="button">Edit Report</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="relative mt-10">
                                <div className="absolute -bottom-12 ltr:-right-12 rtl:-left-12 w-24 h-24">
                                    <IconInfoCircle className="text-danger opacity-20 w-24 h-full" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-primary">Card Limit</div>
                                        <div className="mt-2 font-semibold text-2xl">$50,000.00</div>
                                    </div>
                                    <div>
                                        <div className="text-primary">Spent</div>
                                        <div className="mt-2 font-semibold text-2xl">$30,500.00</div>
                                    </div>
                                    <div>
                                        <div className="text-primary">Minimum</div>
                                        <div className="mt-2 font-semibold text-2xl">$8,000.00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  Recent Transactions  */}
                    <div className="panel">
                        <div className="mb-5 text-lg font-bold">Recent Transactions</div>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">ID</th>
                                        <th>DATE</th>
                                        <th>NAME</th>
                                        <th>AMOUNT</th>
                                        <th className="text-center ltr:rounded-r-md rtl:rounded-l-md">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="font-semibold">#01</td>
                                        <td className="whitespace-nowrap">Oct 08, 2021</td>
                                        <td className="whitespace-nowrap">Eric Page</td>
                                        <td>$1,358.75</td>
                                        <td className="text-center">
                                            <span className="badge bg-success/20 text-success rounded-full hover:top-0">Completed</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">#02</td>
                                        <td className="whitespace-nowrap">Dec 18, 2021</td>
                                        <td className="whitespace-nowrap">Nita Parr</td>
                                        <td>-$1,042.82</td>
                                        <td className="text-center">
                                            <span className="badge bg-info/20 text-info rounded-full hover:top-0">In Process</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">#03</td>
                                        <td className="whitespace-nowrap">Dec 25, 2021</td>
                                        <td className="whitespace-nowrap">Carl Bell</td>
                                        <td>$1,828.16</td>
                                        <td className="text-center">
                                            <span className="badge bg-danger/20 text-danger rounded-full hover:top-0">Pending</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">#04</td>
                                        <td className="whitespace-nowrap">Nov 29, 2021</td>
                                        <td className="whitespace-nowrap">Dan Hart</td>
                                        <td>$1,647.55</td>
                                        <td className="text-center">
                                            <span className="badge bg-success/20 text-success rounded-full hover:top-0">Completed</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">#05</td>
                                        <td className="whitespace-nowrap">Nov 24, 2021</td>
                                        <td className="whitespace-nowrap">Jake Ross</td>
                                        <td>$927.43</td>
                                        <td className="text-center">
                                            <span className="badge bg-success/20 text-success rounded-full hover:top-0">Completed</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">#06</td>
                                        <td className="whitespace-nowrap">Jan 26, 2022</td>
                                        <td className="whitespace-nowrap">Anna Bell</td>
                                        <td>$250.00</td>
                                        <td className="text-center">
                                            <span className="badge bg-info/20 text-info rounded-full hover:top-0">In Process</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;
