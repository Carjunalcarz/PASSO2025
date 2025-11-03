import { createBrowserRouter } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';
import { BlankLayout as BlankLayoutV2, DefaultLayout as DefaultLayoutV2 } from '../components/LayoutsV2';

const finalRoutes = routes.map((route) => {
    return {
        ...route,
        element: route.layout === 'blank' ? <BlankLayoutV2>{route.element}</BlankLayoutV2> : <DefaultLayoutV2>{route.element}</DefaultLayoutV2>,
    };
});

const router = createBrowserRouter(finalRoutes);

export default router;
