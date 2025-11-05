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
import IconMenu from '../Icon/IconMenu';
import IconSettings from '../Icon/IconSettings';
import IconLogout from '../Icon/IconLogout';
import { useAuth } from '../../contexts/AuthContext';


const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
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

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 z-50 transition-all duration-300 ${semidark ? 'text-slate-300' : ''}`}
            >
                <div className="bg-white dark:bg-black h-full flex flex-col">
                    {/* Logo Section */}
                    <div className="flex justify-between items-center px-4 py-3 flex-shrink-0">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            {/* <img className="w-8 flex-none" src="/logo.png" alt="logo" /> */}
                            <span className="text-xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-slate-200">
                                {t('Project-1')}
                            </span>
                        </NavLink>

                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-slate-500/10 dark:hover:bg-slate-700/20 dark:text-slate-200 transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconMenu className="m-auto" />
                        </button>
                    </div>

                    {/* Menu Section */}
                    <div className="flex-1 min-h-0">
                        <PerfectScrollbar className="h-full">
                            <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                                {/* Dashboard Menu */}
                                <li className="menu nav-item">
                                    <button
                                        type="button"
                                        className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`}
                                        onClick={() => toggleMenu('dashboard')}
                                    >
                                        <div className="flex items-center">
                                            <IconMenuDashboard className="group-hover:!text-primary shrink-0" />
                                            <span className="ltr:pl-3 rtl:pr-3 text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-200">
                                                {t('Dashboard')}
                                            </span>
                                        </div>
                                        <div className={currentMenu !== 'dashboard' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                            <IconCaretDown />
                                        </div>
                                    </button>

                                    <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                                        <ul className="sub-menu text-slate-500">
                                            <li>
                                                <NavLink to="/">{t('Home')}</NavLink>
                                            </li>
                                        </ul>
                                    </AnimateHeight>
                                </li>

                                {/* Apps Section Header */}
                                <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-slate-100/50 dark:bg-slate-800/30 -mx-4 mb-1">
                                    <IconMinus className="w-4 h-5 flex-none hidden" />
                                    <span>{t('Applications')}</span>
                                </h2>

                                {/* Settings Menu */}
                                <li className="menu nav-item">
                                    <button
                                        type="button"
                                        className={`${currentMenu === 'settings' ? 'active' : ''} nav-link group w-full`}
                                        onClick={() => toggleMenu('settings')}
                                    >
                                        <div className="flex items-center">
                                            <IconSettings className="group-hover:!text-primary shrink-0" />
                                            <span className="ltr:pl-3 rtl:pr-3 text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-200">
                                                {t('Settings')}
                                            </span>
                                        </div>
                                        <div className={currentMenu !== 'settings' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                            <IconCaretDown />
                                        </div>
                                    </button>

                                    <AnimateHeight duration={300} height={currentMenu === 'settings' ? 'auto' : 0}>
                                        <ul className="sub-menu text-gray-500">
                                            <li>
                                                <NavLink to="/users/profile">{t('profile')}</NavLink>
                                            </li>
                                            <li>
                                                <NavLink to="/users/user-account-settings">{t('settings')}</NavLink>
                                            </li>
                                            <li>
                                                <NavLink to="/users/persons">{t('Persons')}</NavLink>
                                            </li>
                                        </ul>
                                    </AnimateHeight>
                                </li>
                            </ul>
                        </PerfectScrollbar>
                    </div>

                    {/* Sidebar Footer - User Info */}
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {user?.email}
                                    </p>

                                </div>
                                <button
                                    type="button"
                                    className="text-xs text-slate-500 dark:text-slate-400 truncate"
                                    onClick={logout}
                                >
                                    <IconLogout />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
