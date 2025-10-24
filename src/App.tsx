import { PropsWithChildren, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from './store';
import { toggleRTL, toggleTheme, toggleLocale, toggleMenu, toggleLayout, toggleAnimation, toggleNavbar, toggleSemidark } from './store/themeConfigSlice';
import store from './store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import { databaseService } from './services/databaseService';

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
        dispatch(toggleMenu(localStorage.getItem('menu') || themeConfig.menu));
        dispatch(toggleLayout(localStorage.getItem('layout') || themeConfig.layout));
        dispatch(toggleRTL(localStorage.getItem('rtlClass') || themeConfig.rtlClass));
        dispatch(toggleAnimation(localStorage.getItem('animation') || themeConfig.animation));
        dispatch(toggleNavbar(localStorage.getItem('navbar') || themeConfig.navbar));
        dispatch(toggleLocale(localStorage.getItem('i18nextLng') || themeConfig.locale));
        dispatch(toggleSemidark(localStorage.getItem('semidark') || themeConfig.semidark));

        // Make debug utilities available globally in browser console
        if (typeof window !== 'undefined') {
            (window as any).debugTable = (collectionId: string = 'property_assessments') => {
                return databaseService.debugTableStatus(collectionId);
            };
            (window as any).quickStatus = (collectionId: string = 'property_assessments') => {
                return databaseService.quickTableStatus(collectionId);
            };
            (window as any).diagnoseDataIssue = (collectionId: string = 'property_assessments') => {
                return databaseService.diagnoseDataRetrievalIssue(collectionId);
            };
            
            console.log(`
🔍 Debug utilities loaded! Available commands in console:

📊 Full Debug:
   await debugTable('property_assessments')

⚡ Quick Status:
   await quickStatus('property_assessments')

🔧 Diagnose Data Issues:
   await diagnoseDataIssue('property_assessments')
            `);
        }
    }, [dispatch, themeConfig.theme, themeConfig.menu, themeConfig.layout, themeConfig.rtlClass, themeConfig.animation, themeConfig.navbar, themeConfig.locale, themeConfig.semidark]);
    console.log(import.meta.env.VITE_API_URL_FASTAPI);
    return (
        <>
            <div
                className={`${(store.getState().themeConfig.sidebar && 'toggle-sidebar') || ''} ${themeConfig.menu} ${themeConfig.layout} ${themeConfig.rtlClass
                    } main-section antialiased relative font-nunito text-sm font-normal`}
            >
                {children}
            </div>
            <ToastContainer position="top-right" />
            <Toaster position="top-right" />
        </>
    );
}

export default App;
