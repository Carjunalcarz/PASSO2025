import { Disclosure } from '@headlessui/react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import IconMail from '../../../components/Icon/IconMail';
import IconStar from '../../../components/Icon/IconStar';
import IconSend from '../../../components/Icon/IconSend';
import IconInfoHexagon from '../../../components/Icon/IconInfoHexagon';
import IconFile from '../../../components/Icon/IconFile';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconCaretDown from '../../../components/Icon/IconCaretDown';
import IconArchive from '../../../components/Icon/IconArchive';
import IconBookmark from '../../../components/Icon/IconBookmark';
import IconVideo from '../../../components/Icon/IconVideo';
import IconChartSquare from '../../../components/Icon/IconChartSquare';
import IconUserPlus from '../../../components/Icon/IconUserPlus';
import IconPlus from '../../../components/Icon/IconPlus';
import { Dispatch, SetStateAction } from 'react';

type MailItem = any;

interface SideBarProps {
  isShowMailMenu: boolean;
  setIsShowMailMenu: Dispatch<SetStateAction<boolean>>;
  isEdit: boolean;
  selectedTab: string;
  setSelectedTab: Dispatch<SetStateAction<string>>;
  tabChanged: (tabType: string) => void;
  mailList: MailItem[];
  openMail: (type: string, item: MailItem | null) => void;
}

const SideBar = ({
  isShowMailMenu,
  setIsShowMailMenu,
  isEdit,
  selectedTab,
  setSelectedTab,
  tabChanged,
  mailList,
  openMail,
}: SideBarProps) => {
  return (
    <div
      className={`panel xl:block p-4 dark:gray-50 w-[250px] max-w-full flex-none space-y-3 xl:relative absolute z-10 xl:h-auto h-full hidden ltr:xl:rounded-r-md ltr:rounded-r-none rtl:xl:rounded-l-md rtl:rounded-l-none overflow-hidden ${
        isShowMailMenu ? '!block' : ''
      }`}
    >
      <div className="flex flex-col h-full pb-16">
        <div className="pb-5">
          <button className="btn btn-primary w-full" type="button" onClick={() => openMail('add', null)}>
            New Message
          </button>
        </div>
        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
          <div className="space-y-1">
            <button
              type="button"
              className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                !isEdit && selectedTab === 'inbox' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
              }`}
              onClick={() => {
                setSelectedTab('inbox');
                tabChanged('inbox');
              }}
            >
              <div className="flex items-center">
                <IconMail className="w-5 h-5 shrink-0" />
                <div className="ltr:ml-3 rtl:mr-3">Inbox</div>
              </div>
              <div className="bg-primary-light dark:bg-[#060818] rounded-md py-0.5 px-2 font-semibold whitespace-nowrap">
                {mailList && mailList.filter((d) => d.type === 'inbox').length}
              </div>
            </button>

            <button
              type="button"
              className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                !isEdit && selectedTab === 'star' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
              }`}
              onClick={() => {
                setSelectedTab('star');
                tabChanged('star');
              }}
            >
              <div className="flex items-center">
                <IconStar className="shrink-0" />
                <div className="ltr:ml-3 rtl:mr-3">Marked</div>
              </div>
            </button>

            <button
              type="button"
              className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                !isEdit && selectedTab === 'sent_mail' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
              }`}
              onClick={() => {
                setSelectedTab('sent_mail');
                tabChanged('sent_mail');
              }}
            >
              <div className="flex items-center">
                <IconSend className="shrink-0" />
                <div className="ltr:ml-3 rtl:mr-3">Sent</div>
              </div>
            </button>

            <button
              type="button"
              className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                !isEdit && selectedTab === 'spam' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
              }`}
              onClick={() => {
                setSelectedTab('spam');
                tabChanged('spam');
              }}
            >
              <div className="flex items-center">
                <IconInfoHexagon className="shrink-0" />
                <div className="ltr:ml-3 rtl:mr-3">Spam</div>
              </div>
            </button>

            <button
              type="button"
              className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                !isEdit && selectedTab === 'draft' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
              }`}
              onClick={() => {
                setSelectedTab('draft');
                tabChanged('draft');
              }}
            >
              <div className="flex items-center">
                <IconFile className="w-4.5 h-4.5" />
                <div className="ltr:ml-3 rtl:mr-3">Drafts</div>
              </div>
              <div className="bg-primary-light dark:bg-[#060818] rounded-md py-0.5 px-2 font-semibold whitespace-nowrap">
                {mailList && mailList.filter((d) => d.type === 'draft').length}
              </div>
            </button>

            <button
              type="button"
              className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                !isEdit && selectedTab === 'trash' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
              }`}
              onClick={() => {
                setSelectedTab('trash');
                tabChanged('trash');
              }}
            >
              <div className="flex items-center">
                <IconTrashLines className="shrink-0" />
                <div className="ltr:ml-3 rtl:mr-3">Trash</div>
              </div>
            </button>

            <Disclosure as="div">
              {({ open }) => (
                <>
                  <Disclosure.Button className="w-full flex items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10">
                    <IconCaretDown className={`w-5 h-5 shrink-0 ${open && 'rotate-180'}`} />
                    <div className="ltr:ml-3 rtl:mr-3">{open ? 'Less' : 'More'}</div>
                  </Disclosure.Button>
                  <Disclosure.Panel as="ul" unmount={false} className="mt-1 space-y-1">
                    <li>
                      <button
                        type="button"
                        className={`w-full flex items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                          !isEdit && selectedTab === 'archive' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
                        }`}
                        onClick={() => {
                          setSelectedTab('archive');
                          tabChanged('archive');
                        }}
                      >
                        <IconArchive className="shrink-0" />
                        <div className="ltr:ml-3 rtl:mr-3">Archive</div>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`w-full flex items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10 ${
                          !isEdit && selectedTab === 'important' ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''
                        }`}
                        onClick={() => {
                          setSelectedTab('important');
                          tabChanged('important');
                        }}
                      >
                        <IconBookmark className="shrink-0" />
                        <div className="ltr:ml-3 rtl:mr-3">Important</div>
                      </button>
                    </li>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>

            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>

            <button type="button" className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10`}>
              <div className="flex items-center">
                <IconVideo className="shrink-0" />
                <div className="ltr:ml-3 rtl:mr-3">New meeting</div>
              </div>
            </button>
            <button type="button" className={`w-full flex justify-between items-center p-2 hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium h-10`}>
              <div className="flex items-center">
                <IconChartSquare className="shrink-0 rotate-180" />
                <div className="ltr:ml-3 rtl:mr-3">Join a meeting</div>
              </div>
            </button>
            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
          </div>
        </PerfectScrollbar>

        <div className="ltr:left-0 rtl:right-0 absolute bottom-0 p-4 w-full">
          <button
            type="button"
            className="w-full flex p-2 justify-between items-center hover:bg-white-dark/10 rounded-md dark:hover:text-primary hover:text-primary dark:hover:bg-[#181F32] font-medium group"
            onClick={() => setIsShowMailMenu(false)}
          >
            <div className="flex items-center">
              <IconUserPlus className="shrink-0" />
              <div className="ltr:ml-3 rtl:mr-3">Add Account</div>
            </div>
            <div className="bg-primary-light dark:bg-[#060818] rounded-md py-1 px-2">
              <IconPlus />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
