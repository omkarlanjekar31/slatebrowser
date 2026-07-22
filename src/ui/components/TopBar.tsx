import React, { useRef, useState } from "react";
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Home,
  Bookmark,
  Search,
  User,
  Globe,
  Shield,
  Star,
  Minus,
} from "lucide-react";
import {
  addTab,
  closeTab,
  goToHomeTab,
  handleInputUrlChange,
  setActiveTab,
  updateSingleTabUrl,
} from "../features/tabsSlice";
import { addBookmark, deleteBookmark } from "../features/bookmarksSlice.js";
import { useAppDispatch, useAppSelector } from "../hooks/useTypedSelector.js";
import { Minimize2, Maximize, Square } from "lucide-react";
const TopBar = () => {
  const { tabs, activeTabId } = useAppSelector((state) => state.tabs);
  const [isMaximized, setIsMaximized] = useState(true);
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const { bookmarks } = useAppSelector((state) => state.bookmarks);
  const viewBounds = useAppSelector((state) => state.tabs.viewBounds);
  const dispatch = useAppDispatch();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const currentUrl = useAppSelector((state) => state.tabs.currentUrl);

  const isBookmarked =
    activeTab && bookmarks.some((b) => b.url === activeTab.url);

  const toggleBookmark = async () => {
    if (!activeTab) return;
    if (isBookmarked) {
      const bookmark = bookmarks.find((b) => b.url === activeTab.url);
      if (bookmark) {
        const isDeleted = await window.slatebrowserdbAPI.deleteBookmark(
          bookmark.id,
        );
        console.log({ isDeleted });
        if (isDeleted) {
          dispatch(deleteBookmark(bookmark.id));
        }
      }
    } else {
      const addBookmarkBody: AddBookmarkType = {
        url: activeTab.url,
        name: activeTab.title,
      };
      const newBookmark =
        await window.slatebrowserdbAPI.addBookmark(addBookmarkBody);
      console.log({ newBookmark });
      if (newBookmark) {
        dispatch(addBookmark(newBookmark));
      }
    }
  };

  const handleAddNewTab = async () => {
    const addNewTabData: AddTabPayload = {
      bounds: viewBounds,
    };
    const newTabData = await window.electronBrowserTabs.addTab(addNewTabData);
    dispatch(addTab(newTabData));
    urlInputRef.current?.focus();
  };

  const handleCloseTab = async (e: any, tabId: string) => {
    e.stopPropagation();
    const deletedTabId = await window.electronBrowserTabs.closeTab(tabId);
    dispatch(closeTab(deletedTabId));
  };

  const handleTabChange = async (tabId: string) => {
    const currentUrl = tabs.find((f) => f.id == tabId)?.url;

    const tabChangePayload: AttachTabPayload = {
      id: tabId,
      bounds: viewBounds,
      url: currentUrl,
    };

    const resultTabId =
      await window.electronBrowserTabs.swtichTab(tabChangePayload);
    dispatch(setActiveTab(resultTabId));
  };

  const handleHome = async () => {
    const homeTab: Tab = await window.electronBrowserTabs.home(activeTabId, "");
    console.log({ homeTab });
    dispatch(goToHomeTab(homeTab));
  };

  const handleBack = async () => {
    window.electronBrowserTabs.back(activeTabId);
  };

  const handleForward = async () => {
    window.electronBrowserTabs.forward(activeTabId);
  };

  return (
    <div className="flex flex-col w-full bg-slate-100 select-none z-50">
      {/* Tabs Row - Sleek and Professional */}
      <div className="flex titlebar  h-10 flex-row justify-between">
        <div className="flex windowscontrols flex-row pt-2 px-4 items-end  space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center group relative min-w-[220px] max-w-[200px] h-8 px-4 rounded-t-lg cursor-pointer transition-all duration-200 ${
                tab.id == activeTabId
                  ? "bg-white text-slate-900 border-x border-t border-slate-200 shadow-sm"
                  : "text-slate-500 hover:bg-slate-200/50"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 flex items-center justify-center mr-2.5 ${tab.active ? "text-blue-600" : "text-slate-400"}`}
              >
                <Globe size={14} />
              </div>
              <span className="truncate text-[13px] font-medium flex-1">
                {tab.title}
              </span>
              <button
                onClick={(e: any) => handleCloseTab(e, tab.id)}
                className="p-0.5 rounded-md hover:bg-slate-200  ml-2"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddNewTab}
            className="p-1.5 mb-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors ml-1"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex windowscontrols space-x-1 bg-gray-100 h-full">
          {/* Minimize Button */}
          <button
            onClick={() =>
              window.electronBrowserTabs.sendFrameAction("MINIMIZE")
            }
            className="w-10 h-full flex items-center justify-center hover:bg-slate-200 "
            title="Minimize"
          >
            <Minus className="w-4 h-4 stroke-current text-gray-700" />
          </button>

          {/* Maximize / Restore Button */}
          <button
            onClick={() =>
              window.electronBrowserTabs.sendFrameAction("MAXIMIZE")
            }
            className="w-10 h-full flex items-center justify-center hover:bg-slate-200 "
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Square className="w-3 h-3 stroke-current text-gray-700" />
            ) : (
              <Maximize className="w-4 h-4 stroke-current text-gray-700" />
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={() => window.electronBrowserTabs.sendFrameAction("CLOSE")}
            className="w-10 h-full flex items-center justify-center hover:bg-red-500 hover:text-white "
            title="Close"
          >
            <X className="w-4 h-4 stroke-current" />
          </button>
        </div>
      </div>

      {/* Navigation Row - Refined and Minimalist */}
      <div className="flex items-center px-4 py-1 bg-white space-x-4 h-11 relative z-10">
        <div className="flex items-center space-x-0.5">
          <button
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            onClick={handleBack}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            onClick={handleForward}
          >
            <ChevronRight size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors ml-1">
            <RotateCw size={16} />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            onClick={handleHome}
          >
            <Home size={16} />
          </button>
        </div>

        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all group">
          <div className="flex items-center text-emerald-600 mr-3 text-[12px] font-semibold border-r border-slate-200 pr-3">
            <Shield size={14} className="mr-1.5" />
            <span className="hidden sm:inline">Secure</span>
          </div>
          <input
            type="text"
            ref={urlInputRef}
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-slate-700 placeholder-slate-400 font-normal"
            value={
              activeTab?.isStartedEdittingTypedUrl
                ? activeTab.typedUrl
                : currentUrl
            }
            placeholder="Search or enter address"
            onChange={(e: any) =>
              dispatch(handleInputUrlChange(e.target.value))
            }
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                let url = activeTab?.url || "";
                if (activeTab?.isStartedEdittingTypedUrl) {
                  url = activeTab.typedUrl;
                }
                const tabId = activeTab?.id;
                if (!url) return;

                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                  url = "https://" + url;
                }

                // window.electronBrowserTabs.updateUrl(tabId, url);

                if (tabId) {
                  const attachTabPayload = {
                    id: tabId,
                    url,
                    bounds: viewBounds,
                  };
                  const newUpdatedTab =
                    await window.electronBrowserTabs.urlChangeTab(
                      attachTabPayload,
                    );
                  dispatch(
                    updateSingleTabUrl({
                      tabId: newUpdatedTab.id,
                      url: newUpdatedTab.url,
                    }),
                  );
                }
              }
            }}
          />
          <button
            onClick={toggleBookmark}
            className={`p-1 rounded-md transition-colors ml-2 ${isBookmarked ? "bg-amber-100 text-amber-500 hover:bg-amber-200" : "hover:bg-slate-200 text-slate-400"}`}
          >
            <Star size={16} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* <div className="flex items-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-white hover:border-slate-300 transition-all">
            <span className="text-xs font-semibold text-slate-700">
              0.42 ETH
            </span>
          </div> */}
          <button className="px-3 py-1 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all">
            <User size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
