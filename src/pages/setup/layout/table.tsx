import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Dropdown from '../../../components/Dropdown';
import IconArchive from '../../../components/Icon/IconArchive';
import IconInfoHexagon from '../../../components/Icon/IconInfoHexagon';
import IconWheel from '../../../components/Icon/IconWheel';
import IconHorizontalDots from '../../../components/Icon/IconHorizontalDots';
import IconOpenBook from '../../../components/Icon/IconOpenBook';
import IconBook from '../../../components/Icon/IconBook';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconTrash from '../../../components/Icon/IconTrash';
import IconRestore from '../../../components/Icon/IconRestore';
import IconMenu from '../../../components/Icon/IconMenu';
import IconSearch from '../../../components/Icon/IconSearch';
import IconSettings from '../../../components/Icon/IconSettings';
import IconHelpCircle from '../../../components/Icon/IconHelpCircle';
import IconUser from '../../../components/Icon/IconUser';
import IconMessage2 from '../../../components/Icon/IconMessage2';
import IconUsers from '../../../components/Icon/IconUsers';
import IconTag from '../../../components/Icon/IconTag';
import IconCaretDown from '../../../components/Icon/IconCaretDown';
import IconStar from '../../../components/Icon/IconStar';
import IconBookmark from '../../../components/Icon/IconBookmark';
import IconPaperclip from '../../../components/Icon/IconPaperclip';
import IconArrowLeft from '../../../components/Icon/IconArrowLeft';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconArrowBackward from '../../../components/Icon/IconArrowBackward';
import IconArrowForward from '../../../components/Icon/IconArrowForward';
import IconGallery from '../../../components/Icon/IconGallery';
import IconFolder from '../../../components/Icon/IconFolder';
import IconZipFile from '../../../components/Icon/IconZipFile';
import IconDownload from '../../../components/Icon/IconDownload';
import IconTxtFile from '../../../components/Icon/IconTxtFile';
import IconRefresh from '../../../components/Icon/IconRefresh';
import { Dispatch, SetStateAction } from 'react';

type MailItem = any;

interface Pager {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
}

interface Params {
  id: number | null;
  to: string;
  cc: string;
  title: string;
  description: string;
  displayDescription: string;
  file?: FileList | null;
}

interface TableProps {
  selectedMail: MailItem | null;
  isEdit: boolean;
  ids: number[];
  filteredMailList: MailItem[];
  pagedMails: MailItem[];
  pager: Pager;
  selectedTab: string;
  isRtl: boolean;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  toggleAll: () => void;
  refreshMails: () => void;
  setArchive: () => void;
  setSpam: () => void;
  setGroup: (group: string) => void;
  setAction: (type: string) => void;
  selectMail: (item: MailItem | null) => void;
  setStar: (mailId: number) => void;
  setImportant: (mailId: number) => void;
  showTime: (item: MailItem) => string;
  handleCheckboxChange: (id: number) => void;
  checkAllCheckbox: () => boolean;
  openMail: (type: string, item: MailItem | null) => void;
  closeMsgPopUp: () => void;
  changeValue: (e: any) => void;
  saveMail: (type: string, id: any) => void;
  setIsShowMailMenu: Dispatch<SetStateAction<boolean>>;
  isShowMailMenu: boolean;
  params: Params;
  onPrevPage: () => void;
  onNextPage: () => void;
  setSelectedTab: Dispatch<SetStateAction<string>>;
  tabChanged: (tabType: string) => void;
}

const Table = ({
  selectedMail,
  isEdit,
  ids,
  filteredMailList,
  pagedMails,
  pager,
  selectedTab,
  isRtl,
  searchText,
  setSearchText,
  toggleAll,
  refreshMails,
  setArchive,
  setSpam,
  setGroup,
  setAction,
  selectMail,
  setStar,
  setImportant,
  showTime,
  handleCheckboxChange,
  checkAllCheckbox,
  openMail,
  closeMsgPopUp,
  changeValue,
  saveMail,
  setIsShowMailMenu,
  isShowMailMenu,
  params,
  onPrevPage,
  onNextPage,
  setSelectedTab,
  tabChanged,
}: TableProps) => {
  return (
    <div className="panel p-0 flex-1 overflow-x-hidden h-full">
      {!selectedMail && !isEdit && (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center flex-wrap-reverse gap-4 p-4">
            <div className="flex items-center w-full sm:w-auto">
              <div className="ltr:mr-4 rtl:ml-4">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={checkAllCheckbox()}
                  value={ids as any}
                  onChange={toggleAll}
                  onClick={(event) => event.stopPropagation()}
                />
              </div>

              <div className="ltr:mr-4 rtl:ml-4">
                <Tippy content="Refresh">
                  <button type="button" className="hover:text-primary flex items-center" onClick={refreshMails}>
                    <IconRefresh />
                  </button>
                </Tippy>
              </div>

              {selectedTab !== 'trash' && (
                <ul className="flex grow items-center sm:flex-none gap-4 ltr:sm:mr-4 rtl:sm:ml-4">
                  <li>
                    <div>
                      <Tippy content="Archive">
                        <button type="button" className="hover:text-primary flex items-center" onClick={setArchive}>
                          <IconArchive />
                        </button>
                      </Tippy>
                    </div>
                  </li>
                  <li>
                    <div>
                      <Tippy content="Spam">
                        <button type="button" className="hover:text-primary flex items-center" onClick={setSpam}>
                          <IconInfoHexagon />
                        </button>
                      </Tippy>
                    </div>
                  </li>
                  <li>
                    <div className="dropdown">
                      <Dropdown
                        offset={[0, 1]}
                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                        btnClassName="hover:text-primary flex items-center"
                        button={
                          <Tippy content="Group">
                            <span>
                              <IconWheel />
                            </span>
                          </Tippy>
                        }
                      >
                        <ul className="text-sm font-medium">
                          <li>
                            <button type="button" onClick={() => setGroup('personal')}>
                              <div className="w-2 h-2 rounded-full bg-primary ltr:mr-3 rtl:ml-3 shrink-0"></div>
                              Personal
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={() => setGroup('work')}>
                              <div className="w-2 h-2 rounded-full bg-warning ltr:mr-3 rtl:ml-3 shrink-0"></div>
                              Work
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={() => setGroup('social')}>
                              <div className="w-2 h-2 rounded-full bg-success ltr:mr-3 rtl:ml-3 shrink-0"></div>
                              Social
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={() => setGroup('private')}>
                              <div className="w-2 h-2 rounded-full bg-danger ltr:mr-3 rtl:ml-3 shrink-0"></div>
                              Private
                            </button>
                          </li>
                        </ul>
                      </Dropdown>
                    </div>
                  </li>
                  <li>
                    <div className="dropdown">
                      <Dropdown
                        offset={[0, 1]}
                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                        btnClassName="hover:text-primary flex items-center"
                        button={<IconHorizontalDots className="rotate-90 opacity-70" />}
                      >
                        <ul className="whitespace-nowrap">
                          <li>
                            <button type="button" onClick={() => setAction('read')}>
                              <IconOpenBook className="ltr:mr-2 rtl:ml-2 shrink-0" />
                              Mark as Read
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={() => setAction('unread')}>
                              <IconBook className="ltr:mr-2 rtl:ml-2 shrink-0" />
                              Mark as Unread
                            </button>
                          </li>
                          <li>
                            <button type="button" onClick={() => setAction('trash')}>
                              <IconTrashLines className="ltr:mr-2 rtl:ml-2 shrink-0" />
                              Trash
                            </button>
                          </li>
                        </ul>
                      </Dropdown>
                    </div>
                  </li>
                </ul>
              )}

              {selectedTab === 'trash' && (
                <ul className="flex flex-1 items-center sm:flex-none gap-4 ltr:sm:mr-3 rtl:sm:ml-4">
                  <li>
                    <div>
                      <Tippy content="Permanently Delete">
                        <button type="button" className="block hover:text-primary" onClick={() => setAction('delete')}>
                          <IconTrash />
                        </button>
                      </Tippy>
                    </div>
                  </li>
                  <li>
                    <div>
                      <Tippy content="Restore">
                        <button type="button" className="block hover:text-primary" onClick={() => setAction('restore')}>
                          <IconRestore />
                        </button>
                      </Tippy>
                    </div>
                  </li>
                </ul>
              )}
            </div>

            <div className="flex justify-between items-center sm:w-auto w-full">
              <div className="flex items-center ltr:mr-4 rtl:ml-4">
                <button type="button" className="xl:hidden hover:text-primary block ltr:mr-3 rtl:ml-3" onClick={() => setIsShowMailMenu(!isShowMailMenu)}>
                  <IconMenu />
                </button>
                <div className="relative group">
                  <input
                    type="text"
                    className="form-input ltr:pr-8 rtl:pl-8 peer"
                    placeholder="Search Mail"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyUp={() => {}}
                  />
                  <div className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                    <IconSearch />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ltr:mr-4 rtl:ml-4">
                  <Tippy content="Settings">
                    <button type="button" className="hover:text-primary">
                      <IconSettings />
                    </button>
                  </Tippy>
                </div>
                <div>
                  <Tippy content="Help">
                    <button type="button" className="hover:text-primary">
                      <IconHelpCircle className="w-6 h-6" />
                    </button>
                  </Tippy>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>

          <div className="flex flex-wrap flex-col md:flex-row xl:w-auto justify-between items-center px-4 pb-4">
            <div className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <button
                type="button"
                className={`btn btn-outline-primary flex ${selectedTab === 'personal' ? 'text-white bg-primary' : ''}`}
                onClick={() => {
                  setSelectedTab('personal');
                  tabChanged('personal');
                }}
              >
                <IconUser className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                Personal
              </button>

              <button
                type="button"
                className={`btn btn-outline-warning flex ${selectedTab === 'work' ? 'text-white bg-warning' : ''}`}
                onClick={() => {
                  setSelectedTab('work');
                  tabChanged('work');
                }}
              >
                <IconMessage2 className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                Work
              </button>

              <button
                type="button"
                className={`btn btn-outline-success flex ${selectedTab === 'social' ? 'text-white bg-success' : ''}`}
                onClick={() => {
                  setSelectedTab('social');
                  tabChanged('social');
                }}
              >
                <IconUsers className="ltr:mr-2 rtl:ml-2" />
                Social
              </button>

              <button
                type="button"
                className={`btn btn-outline-danger flex ${selectedTab === 'private' ? 'text-white bg-danger' : ''}`}
                onClick={() => {
                  setSelectedTab('private');
                  tabChanged('private');
                }}
              >
                <IconTag className="ltr:mr-2 rtl:ml-2" />
                Private
              </button>
            </div>

            <div className="mt-4 md:flex-auto flex-1">
              <div className="flex items-center md:justify-end justify-center">
                <div className="ltr:mr-3 rtl:ml-3">{pager.startIndex + 1 + '-' + (pager.endIndex + 1) + ' of ' + filteredMailList.length}</div>
                <button
                  type="button"
                  disabled={pager.currentPage === 1}
                  className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg:white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={onPrevPage}
                >
                  <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
                </button>
                <button
                  type="button"
                  disabled={pager.currentPage === pager.totalPages}
                  className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg:white-dark/20 enabled:dark:hover:bg-white-dark/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={onNextPage}
                >
                  <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>

          {pagedMails.length ? (
            <div className="table-responsive grow overflow-y-auto sm:min-h-[300px] min-h-[400px]">
              <table className="table-hover">
                <tbody>
                  {pagedMails.map((mail: any) => {
                    return (
                      <tr key={mail.id} className="cursor-pointer" onClick={() => selectMail(mail)}>
                        <td>
                          <div className="flex items-center whitespace-nowrap">
                            <div className="ltr:mr-3 rtl:ml-3">
                              {ids.includes(mail.id)}
                              <input
                                type="checkbox"
                                id={`chk-${mail.id}`}
                                value={mail.id}
                                checked={ids.length ? ids.includes(mail.id) : false}
                                onChange={() => handleCheckboxChange(mail.id)}
                                onClick={(event) => event.stopPropagation()}
                                className="form-checkbox"
                              />
                            </div>
                            <div className="ltr:mr-3 rtl:ml-3">
                              <Tippy content="Star">
                                <button
                                  type="button"
                                  className={`enabled:hover:text-warning disabled:opacity-60 flex items-center ${mail.isStar ? 'text-warning' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStar(mail.id);
                                  }}
                                  disabled={selectedTab === 'trash'}
                                >
                                  <IconStar className={mail.isStar ? 'fill-warning' : ''} />
                                </button>
                              </Tippy>
                            </div>
                            <div className="ltr:mr-3 rtl:ml-3">
                              <Tippy content="Important">
                                <button
                                  type="button"
                                  className={`enabled:hover:text-primary disabled:opacity-60 rotate-90 flex items-center ${mail.isImportant ? 'text-primary' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImportant(mail.id);
                                  }}
                                  disabled={selectedTab === 'trash'}
                                >
                                  <IconBookmark bookmark={false} className={`w-4.5 h-4.5 ${mail.isImportant && 'fill-primary'}`} />
                                </button>
                              </Tippy>
                            </div>
                            <div className={`dark:text-gray-300 whitespace-nowrap font-semibold ${!mail.isUnread ? 'text-gray-500 dark:text-gray-500 font-normal' : ''}`}>
                              {mail.firstName ? mail.firstName + ' ' + mail.lastName : mail.email}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-medium text-white-dark overflow-hidden min-w-[300px] line-clamp-1">
                            <span className={`${mail.isUnread ? 'text-gray-800 dark:text-gray-300 font-semibold' : ''}`}>
                              <span>{mail.title}</span> &minus;
                              <span> {mail.displayDescription}</span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                (mail.group === 'personal' && 'bg-primary') ||
                                (mail.group === 'work' && 'bg-warning') ||
                                (mail.group === 'social' && 'bg-success') ||
                                (mail.group === 'private' && 'bg-danger')
                              }`}
                            ></div>
                            {mail.attachments && (
                              <div className="ltr:ml-4 rtl:mr-4">
                                <IconPaperclip />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap font-medium ltr:text-right rtl:text-left">{showTime(mail)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid place-content-center min-h-[300px] font-semibold text-lg h-full">No data available</div>
          )}
        </div>
      )}

      {selectedMail && !isEdit && (
        <div>
          <div className="flex items-center justify-between flex-wrap p-4">
            <div className="flex items-center">
              <button type="button" className="ltr:mr-2 rtl:ml-2 hover:text-primary" onClick={() => selectMail(null)}>
                <IconArrowLeft className="w-5 h-5 rotate-180" />
              </button>
              <h4 className="text-base md:text-lg font-medium ltr:mr-2 rtl:ml-2">{selectedMail.title}</h4>
              <div className="badge bg-info hover:top-0">{selectedMail.type}</div>
            </div>
            <div>
              <Tippy content="Print">
                <button type="button">
                  <IconPrinter />
                </button>
              </Tippy>
            </div>
          </div>
          <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
          <div className="p-4 relative">
            <div className="flex flex-wrap">
              <div className="flex-shrink-0 ltr:mr-2 rtl:ml-2">
                {selectedMail.path ? (
                  <img src={`/assets/images/${selectedMail.path}`} className="h-12 w-12 rounded-full object-cover" alt="avatar" />
                ) : (
                  <div className="border border-gray-300 dark:border-gray-800 rounded-full p-3">
                    <IconUser className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="ltr:mr-2 rtl:ml-2 flex-1">
                <div className="flex items-center">
                  <div className="text-lg ltr:mr-4 rtl:ml-4 whitespace-nowrap">
                    {selectedMail.firstName ? selectedMail.firstName + ' ' + selectedMail.lastName : selectedMail.email}
                  </div>
                  {selectedMail.group && (
                    <div className="ltr:mr-4 rtl:ml-4">
                      <Tippy content={selectedMail.group} className="capitalize">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            (selectedMail.group === 'personal' && 'bg-primary') ||
                            (selectedMail.group === 'work' && 'bg-warning') ||
                            (selectedMail.group === 'social' && 'bg-success') ||
                            (selectedMail.group === 'private' && 'bg-danger')
                          }`}
                        ></div>
                      </Tippy>
                    </div>
                  )}
                  <div className="text-white-dark whitespace-nowrap">1 days ago</div>
                </div>
                <div className="text-white-dark flex items-center">
                  <div className="ltr:mr-1 rtl:ml-1">{selectedMail.type === 'sent_mail' ? selectedMail.email : 'to me'}</div>
                  <div className="dropdown">
                    <Dropdown
                      offset={[0, 5]}
                      placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                      btnClassName="hover:text-primary flex items-center"
                      button={<IconCaretDown className="w-5 h-5" />}
                    >
                      <ul className="sm:w-56">
                        <li>
                          <div className="flex items-center px-4 py-2">
                            <div className="text-white-dark ltr:mr-2 rtl:ml-2 w-1/4">From:</div>
                            <div className="flex-1">{selectedMail.type === 'sent_mail' ? 'vristo@gmail.com' : selectedMail.email}</div>
                          </div>
                        </li>
                        <li>
                          <div className="flex items-center px-4 py-2">
                            <div className="text-white-dark ltr:mr-2 rtl:ml-2 w-1/4">To:</div>
                            <div className="flex-1">{selectedMail.type !== 'sent_mail' ? 'vristo@gmail.com' : selectedMail.email}</div>
                          </div>
                        </li>
                        <li>
                          <div className="flex items-center px-4 py-2">
                            <div className="text-white-dark ltr:mr-2 rtl:ml-2 w-1/4">Date:</div>
                            <div className="flex-1">{selectedMail.date + ', ' + selectedMail.time}</div>
                          </div>
                        </li>
                        <li>
                          <div className="flex items-center px-4 py-2">
                            <div className="text-white-dark ltr:mr-2 rtl:ml-2 w-1/4">Subject:</div>
                            <div className="flex-1">{selectedMail.title}</div>
                          </div>
                        </li>
                      </ul>
                    </Dropdown>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                  <Tippy content="Star">
                    <button
                      type="button"
                      className={`enabled:hover:text-warning disabled:opacity-60 ${selectedMail.isStar ? 'text-warning' : ''}`}
                      onClick={() => setStar(selectedMail.id)}
                      disabled={selectedTab === 'trash'}
                    >
                      <IconStar className={selectedMail.isStar ? 'fill-warning' : ''} />
                    </button>
                  </Tippy>
                  <Tippy content="Important">
                    <button
                      type="button"
                      className={`enabled:hover:text-primary disabled:opacity-60 ${selectedMail.isImportant ? 'text-primary' : ''}`}
                      onClick={() => setImportant(selectedMail.id)}
                      disabled={selectedTab === 'trash'}
                    >
                      <IconBookmark bookmark={false} className={`w-4.5 h-4.5 rotate-90 ${selectedMail.isImportant && 'fill-primary'}`} />
                    </button>
                  </Tippy>
                  <Tippy content="Reply">
                    <button type="button" className="hover:text-info" onClick={() => openMail('reply', selectedMail)}>
                      <IconArrowBackward className="rtl:hidden" />
                      <IconArrowForward className="ltr:hidden" />
                    </button>
                  </Tippy>
                  <Tippy content="Forward">
                    <button type="button" className="hover:text-info" onClick={() => openMail('forward', selectedMail)}>
                      <IconArrowBackward className="ltr:hidden" />
                      <IconArrowForward className="rtl:hidden" />
                    </button>
                  </Tippy>
                </div>
              </div>
            </div>

            <div className="mt-8 prose dark:prose-p:text-white prose-p:text-sm md:prose-p:text-sm max-w-full prose-img:inline-block prose-img:m-0" dangerouslySetInnerHTML={{ __html: selectedMail.description }}></div>
            <p className="mt-4">Best Regards,</p>
            <p>{selectedMail.firstName + ' ' + selectedMail.lastName}</p>

            {selectedMail.attachments && (
              <div className="mt-8">
                <div className="text-base mb-4">Attachments</div>
                <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                <div className="flex items-center flex-wrap mt-6">
                  {selectedMail.attachments.map((attachment: any, i: number) => {
                    return (
                      <button
                        key={i}
                        type="button"
                        className="flex items-center ltr:mr-4 rtl:ml-4 mb-4 border border-white-light dark:border-[#1b2e4b] rounded-md hover:text-primary hover:border-primary transition-all duration-300 px-4 py-2.5 relative group"
                      >
                        {attachment.type === 'image' && <IconGallery />}
                        {attachment.type === 'folder' && <IconFolder />}
                        {attachment.type === 'zip' && <IconZipFile />}
                        {attachment.type !== 'zip' && attachment.type !== 'image' && attachment.type !== 'folder' && <IconTxtFile className="w-5 h-5" />}

                        <div className="ltr:ml-3 rtl:mr-3">
                          <p className="text-xs text-primary font-semibold">{attachment.name}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-600">{attachment.size}</p>
                        </div>
                        <div className="bg-dark-light/40 z-[5] w-full h-full absolute ltr:left-0 rtl:right-0 top-0 rounded-md hidden group-hover:block"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-1 btn btn-primary hidden group-hover:block z-10">
                          <IconDownload className="w-4.5 h-4.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isEdit && (
        <div className="relative">
          <div className="py-4 px-6 flex items-center">
            <button type="button" className="xl:hidden hover:text-primary block ltr:mr-3 rtl:ml-3" onClick={() => setIsShowMailMenu(!isShowMailMenu)}>
              <IconMenu />
            </button>
            <h4 className="text-lg text-gray-600 dark:text-gray-400 font-medium">Message</h4>
          </div>
          <div className="h-px bg-gradient-to-l from-indigo-900/20 via-black dark:via-white to-indigo-900/20 opacity-[0.1]"></div>
          <form className="p-6 grid gap-6">
            <div>
              <input id="to" type="text" className="form-input" placeholder="Enter To" defaultValue={(params as any).to} onChange={changeValue} />
            </div>
            <div>
              <input id="cc" type="text" className="form-input" placeholder="Enter Cc" defaultValue={(params as any).cc} onChange={changeValue} />
            </div>
            <div>
              <input id="title" type="text" className="form-input" placeholder="Enter Subject" defaultValue={(params as any).title} onChange={changeValue} />
            </div>
            <div className="h-fit">
              <ReactQuill
                theme="snow"
                value={(params as any).description || ''}
                defaultValue={(params as any).description || ''}
                onChange={(content, delta, source, editor) => {
                  (params as any).description = content;
                  (params as any).displayDescription = editor.getText();
                }}
                style={{ minHeight: '200px' }}
              />
            </div>
            <div>
              <input
                type="file"
                className="form-input file:py-2 file:px-4 file:border-0 file:font-semibold p-0 file:bg-primary/90 ltr:file:mr-5 rtl:file:ml-5 file:text-white file:hover:bg-primary"
                multiple
                accept="image/*,.zip,.pdf,.xls,.xlsx,.txt.doc,.docx"
                required
              />
            </div>
            <div className="flex items-center ltr:ml-auto rtl:mr-auto mt-8">
              <button type="button" className="btn btn-outline-danger ltr:mr-3 rtl:ml-3" onClick={closeMsgPopUp}>
                Close
              </button>
              <button type="button" className="btn btn-success ltr:mr-3 rtl:ml-3" onClick={() => saveMail('save', null)}>
                Save
              </button>
              <button type="button" className="btn btn-primary" onClick={() => saveMail('send', (params as any).id)}>
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Table;
