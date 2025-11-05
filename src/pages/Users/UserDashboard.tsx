import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import UserSidebar from './layout/UserSidebar';

interface UserDashboardProps {}

const UserDashboard: React.FC<UserDashboardProps> = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    
    useEffect(() => {
        dispatch(setPageTitle('User Dashboard'));
    });

    const [isShowMailMenu, setIsShowMailMenu] = useState(false);
    const [selectedTab, setSelectedTab] = useState('person');

    return (
        <div>
            <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full">
                <div
                    className={`overlay bg-black/60 z-[5] w-full h-full rounded-md absolute hidden ${isShowMailMenu ? '!block xl:!hidden' : ''}`}
                    onClick={() => setIsShowMailMenu(!isShowMailMenu)}
                ></div>
                <UserSidebar
                    isShowMenu={isShowMailMenu}
                    setIsShowMenu={setIsShowMailMenu}
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                />

                <div className="panel p-0 flex-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
