import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import TableauDashboard from './TableauDashboard';
import FoodDeliveryForm from './test';


const Map = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('MAP'));
    }, []);

    return (
        <div className='w-full h-full z-0'   >

            <TableauDashboard
                url="https://public.tableau.com/views/PASSO2025-fixed04-28-25/Dashboard1?:language=en-US&publish=yes&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link"
                height="1000px"  // or a number like 800
                width="100%"    // or a specific width like "1200px" or 1200
            />
        </div>
    );
};

export default Map;