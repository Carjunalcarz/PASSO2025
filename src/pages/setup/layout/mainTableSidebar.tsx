import PerfectScrollbar from 'react-perfect-scrollbar';
import IconUsers from '../../../components/Icon/IconUsers';
import IconLayoutGrid from '../../../components/Icon/IconLayoutGrid';
import IconChartSquare from '../../../components/Icon/IconChartSquare';
import IconSearch from '../../../components/Icon/IconSearch';
import IconCaretDown from '../../../components/Icon/IconCaretDown';
import IconBuilding from '../../../components/Icon/IconBuilding';
import IconCode from '../../../components/Icon/IconCode';
import IconBox from '../../../components/Icon/IconBox';
import IconDollarSign from '../../../components/Icon/IconDollarSign';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconCpuBolt from '../../../components/Icon/IconCpuBolt';
import IconTag from '../../../components/Icon/IconTag';
import { Dispatch, SetStateAction, useState } from 'react';

interface SubMenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    subItems?: SubMenuItem[];
}

interface MainTableSidebarProps {
    isShowMenu: boolean;
    setIsShowMenu: Dispatch<SetStateAction<boolean>>;
    selectedTab: string;
    setSelectedTab: Dispatch<SetStateAction<string>>;
}

const MainTableSidebar = ({
    isShowMenu,
    setIsShowMenu,
    selectedTab,
    setSelectedTab,
}: MainTableSidebarProps) => {
    const [searchMenu, setSearchMenu] = useState('');
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['building-parts-rate']);

    const menuItems = [
        {
            id: 'building-parts-rate',
            label: 'Building Parts Rate',
            icon: IconDollarSign,
            subItems: [
                { id: 'building-parts-rate', label: 'Building Parts Rate', icon: IconDollarSign },
                { id: 'building-component', label: 'Building Component', icon: IconLayoutGrid },
                { id: 'building-parts', label: 'Building Parts', icon: IconBox },
            ]
        },
        {
            id: 'building-structural-types',
            label: 'Structural Types',
            icon: IconBuilding,
            subItems: [
                { id: 'building-structural-types', label: 'Structural Types', icon: IconBuilding },
                { id: 'building-code', label: 'Building Code', icon: IconCode },
                { id: 'building-depreciation', label: 'Building Depreciation', icon: IconCalendar },
            ]
        },
        {
            id: 'machinery',
            label: 'Machinery',
            icon: IconCpuBolt,
            subItems: [
                { id: 'machinery-types', label: 'Machinery Types', icon: IconCpuBolt },
                { id: 'machinery-rates', label: 'Machinery Rates', icon: IconDollarSign },
            ]
        },
        {
            id: 'classifications',
            label: 'Classifications',
            icon: IconTag,
            subItems: [
                { id: 'classifications', label: 'Classifications', icon: IconTag },
                { id: 'sub-classifications', label: 'Sub-Classifications', icon: IconTag },
            ]
        },
        {
            id: 'kinds',
            label: 'Kinds',
            icon: IconTag,
            subItems: [
                { id: 'kinds', label: 'Kinds', icon: IconTag },
                { id: 'sub-kinds', label: 'Sub-Kinds', icon: IconTag },
            ]
        },
        {
            id: 'products',
            label: 'Products',
            icon: IconBox,
        },
        {
            id: 'property-nature',
            label: 'Property Nature',
            icon: IconLayoutGrid,
        },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        const matchesParent = item.label.toLowerCase().includes(searchMenu.toLowerCase());
        const matchesChild = item.subItems?.some(subItem =>
            subItem.label.toLowerCase().includes(searchMenu.toLowerCase())
        );
        return matchesParent || matchesChild;
    });

    return (
        <div
            className={`panel xl:block p-4 dark:gray-50 w-[250px] max-w-full flex-none space-y-3 xl:relative absolute z-10 xl:h-auto h-full hidden ltr:xl:rounded-r-md ltr:rounded-r-none rtl:xl:rounded-l-md rtl:rounded-l-none overflow-hidden ${isShowMenu ? '!block' : ''
                }`}
        >
            <div className="flex flex-col h-full pb-16">
                <div className="pb-3">
                    <div className="relative">
                        <input
                            type="text"
                            className="form-input ltr:pr-10 rtl:pl-10 peer"
                            placeholder="Search menu..."
                            value={searchMenu}
                            onChange={(e) => setSearchMenu(e.target.value)}
                        />
                        <div className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                    <div className="space-y-1">
                        {filteredMenuItems.length > 0 ? (
                            filteredMenuItems.map((item) => {
                                const IconComponent = item.icon;
                                const isExpanded = expandedMenus.includes(item.id);
                                const hasSubItems = item.subItems && item.subItems.length > 0;

                                return (
                                    <div key={item.id}>
                                        <button
                                            type="button"
                                            className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${selectedTab === item.id ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
                                                }`}
                                            onClick={() => {
                                                if (hasSubItems) {
                                                    setExpandedMenus(prev =>
                                                        prev.includes(item.id)
                                                            ? prev.filter(id => id !== item.id)
                                                            : [...prev, item.id]
                                                    );
                                                } else {
                                                    setSelectedTab(item.id);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <IconComponent className="w-5 h-5 shrink-0" />
                                                <div className="ltr:ml-3 rtl:mr-3">{item.label}</div>
                                            </div>
                                            {hasSubItems && (
                                                <IconCaretDown
                                                    className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                />
                                            )}
                                        </button>

                                        {hasSubItems && isExpanded && (
                                            <div className="ltr:ml-4 rtl:mr-4 mt-1 space-y-1">
                                                {item.subItems.map((subItem) => {
                                                    const SubIconComponent = subItem.icon;
                                                    return (
                                                        <button
                                                            key={subItem.id}
                                                            type="button"
                                                            className={`w-full flex items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${selectedTab === subItem.id ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
                                                                }`}
                                                            onClick={() => setSelectedTab(subItem.id)}
                                                        >
                                                            <SubIconComponent className="w-4 h-4 shrink-0" />
                                                            <div className="ltr:ml-3 rtl:mr-3 text-sm">{subItem.label}</div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                                No menu items found
                            </div>
                        )}

                        <div className="h-px border-b border-white-light dark:border-[#1b2e4b] my-4"></div>
                    </div>
                </PerfectScrollbar>
            </div>
        </div>
    );
};

export default MainTableSidebar;
