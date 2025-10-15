import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '../Icon/IconCaretsDown';
import IconCaretDown from '../Icon/IconCaretDown';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconMinus from '../Icon/IconMinus';
import IconMenuChat from '../Icon/Menu/IconMenuChat';
import IconMenuMailbox from '../Icon/Menu/IconMenuMailbox';
import IconMenuTodo from '../Icon/Menu/IconMenuTodo';
import IconMenuNotes from '../Icon/Menu/IconMenuNotes';
import IconMenuScrumboard from '../Icon/Menu/IconMenuScrumboard';
import IconMenuContacts from '../Icon/Menu/IconMenuContacts';
import IconMenuInvoice from '../Icon/Menu/IconMenuInvoice';
import IconMenuCalendar from '../Icon/Menu/IconMenuCalendar';
import IconMenuComponents from '../Icon/Menu/IconMenuComponents';
import IconMenuElements from '../Icon/Menu/IconMenuElements';
import IconMenuCharts from '../Icon/Menu/IconMenuCharts';
import IconMenuWidgets from '../Icon/Menu/IconMenuWidgets';
import IconMenuFontIcons from '../Icon/Menu/IconMenuFontIcons';
import IconMenuDragAndDrop from '../Icon/Menu/IconMenuDragAndDrop';
import IconMenuTables from '../Icon/Menu/IconMenuTables';
import IconMenuDatatables from '../Icon/Menu/IconMenuDatatables';
import IconMenuForms from '../Icon/Menu/IconMenuForms';
import IconMenuUsers from '../Icon/Menu/IconMenuUsers';
import IconMenuPages from '../Icon/Menu/IconMenuPages';
import IconMenuAuthentication from '../Icon/Menu/IconMenuAuthentication';
import IconMenuDocumentation from '../Icon/Menu/IconMenuDocumentation';
import IconPlus from '../Icon/IconPlus';
import IconMunicipality from '../Icon/IconMunicipality';
import IconAssessment from '../Icon/IconAssessment';
import IconBuilding from '../Icon/IconBuilding';
import IconLogout from '../Icon/IconLogout';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);
    // console.log(document.title);
    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 z-50 transition-all duration-300 ${semidark ? 'text-slate-300' : ''}`}
            >
                <div className="bg-white dark:bg-black h-full flex flex-col">
                    <div className="flex justify-between items-center px-4 py-3 flex-shrink-0">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-8  flex-none" src="/mun_logo/RPT.png" alt="logo" />
                            <span className="text-xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-slate-200">{t('PASSO-RPTASS')}</span>
                        </NavLink>

                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-slate-500/10 dark:hover:bg-slate-700/20 dark:text-slate-200 transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0">
                        <PerfectScrollbar className="h-full">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('dashboard')}>
                                    <div className="flex items-center">
                                        <IconMenuDashboard
                                            className="group-hover:!text-primary shrink-0" />
                                        <span className="ltr:pl-3 rtl:pr-3 text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-200">{t('dashboard')}</span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                                    <ul className="sub-menu text-slate-500">
                                        <li>
                                            <NavLink to="/adn-data">{t('Agusan del Norte')}</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/map">{t('MAP')}</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/unit_value">{t('Unit Value')}</NavLink>
                                        </li>
                                        {/* <li>
                                            <NavLink to="/analytics">{t('analytics')}</NavLink>
                                        </li>

                                        <li>
                                            <NavLink to="/crypto">{t('crypto')}</NavLink>
                                        </li> */}
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-slate-100/50 dark:bg-slate-800/30 -mx-4 mb-1">
                                <IconMinus className="w-4 h-5 flex-none hidden" />
                                <span>{t('apps')}</span>
                            </h2>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'Municipality' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('Municipality')}>
                                    <div className="flex items-center">
                                        <IconMunicipality
                                            className="group-hover:!text-primary shrink-0" />
                                        <span className="ltr:pl-3 rtl:pr-3 text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-200">{t('Municipality')}</span>
                                    </div>

                                    <div className={currentMenu !== 'Tables' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'Municipality' ? 'auto' : 0}>
                                    <div className="sub-menu text-slate-500 px-4 ml-4">
                                        <div className="py-2">
                                            <NavLink to="/assessment/adn" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/pgan.webp" alt="PGAN Logo" className="w-5 h-5" />
                                                {t('Agusan del Norte')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/buenavista" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/buenavista.png" alt="Buenavista Logo" className="w-5 h-5" />
                                                {t('Buenavista')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink
                                                to="/assessment/carmen"
                                                className={({ isActive }) =>
                                                    `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                    }`
                                                }
                                            >
                                                <img src="/mun_logo/carmen.png" alt="Carmen Logo" className="w-5 h-5" />
                                                {t('Carmen')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/jabonga" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/jabonga.png" alt="Jabonga Logo" className="w-5 h-5" />
                                                {t('Jabonga')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/kitcharao" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/kitcharao.png" alt="Kitcharao Logo" className="w-5 h-5" />
                                                {t('Kitcharao')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/lasnieves" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/las-nieves.png" alt="Lasnieves Logo" className="w-5 h-5" />
                                                {t('Lasnieves')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/magallanes" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/magallanes.png" alt="Magallanes Logo" className="w-5 h-5" />
                                                {t('Magallanes')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/nasipit" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/nasipit.png" alt="Nasipit Logo" className="w-5 h-5" />
                                                {t('Nasipit')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/remedios_t_romualdez" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/rtr.png" alt="RTR Logo" className="w-5 h-5" />
                                                {t('RTR')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/santiago" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/santiago.png" alt="Santiago Logo" className="w-5 h-5" />
                                                {t('Santiago')}
                                            </NavLink>
                                        </div>
                                        <div className="py-2">
                                            <NavLink to="/assessment/tubay" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <img src="/mun_logo/tubay.png" alt="Tubay Logo" className="w-5 h-5" />
                                                {t('Tubay')}
                                            </NavLink>
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </li>


                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'Assessment' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('Assessment')}>
                                    <div className="flex items-center">
                                        <IconAssessment
                                            className="group-hover:!text-primary shrink-0" />
                                        <span className="ltr:pl-3 rtl:pr-3 text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-200">{t('Assessment')}</span>
                                    </div>

                                    <div className={currentMenu !== 'Tables' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'Assessment' ? 'auto' : 0}>
                                    <div className="sub-menu text-slate-500 px-4 ml-4">
                                        <div className="py-2 -mx-4">
                                            <NavLink
                                                to="/assessment/add_assessment"
                                                className={({ isActive }) =>
                                                    `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                    }`
                                                }
                                            >
                                                <IconPlus className="w-5 h-5" />
                                                {t('Add Assessment')}
                                            </NavLink>
                                        </div>
                                    </div>
                                </AnimateHeight>
                                <AnimateHeight duration={300} height={currentMenu === 'Assessment' ? 'auto' : 0}>
                                    <div className="sub-menu text-slate-500 px-4 ml-4">
                                        <div className="py-2 -mx-4">
                                            <NavLink to="/assessment/building_assessment" className={({ isActive }) =>
                                                `nav-link group w-full flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-primary font-bold' : ''
                                                }`
                                            }>
                                                <IconBuilding className="w-5 h-5" />
                                                {t('Building Assessment')}
                                            </NavLink>
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </li>

                            </ul>
                        </PerfectScrollbar>
                    </div>

                    {/* Sidebar Footer with User Info and Logout */}
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-md text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex-shrink-0"
                                title="Logout"
                            >
                                <IconLogout className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </nav >
        </div >
    );
};

export default Sidebar;
