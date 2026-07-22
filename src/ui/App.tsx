import React, { useEffect, useRef } from "react";
import TopBar from "./components/TopBar";
import BookmarkBar from "./components/BookmarkBar";
import SidebarSwitcher from "./components/SidebarSwitcher";
import ThirdSection from "./components/ThirdSection";
import { toggleBunnyAI } from "./features/layoutSlice";
import DappWallet from "./components/dappWallet";
import { useAppDispatch, useAppSelector } from "./hooks/useTypedSelector";
import BrowserView from "./components/BrowserView";
import { addTab, setInitializeTab, setViewBounds } from "./features/tabsSlice";
import { getAllBookmark } from "./features/bookmarksSlice";

function App() {
  const { isBunnyAIOpen } = useAppSelector((state) => state.layout);
  const { tabs } = useAppSelector((state) => state.tabs);
  const dispatch = useAppDispatch();
  const mainRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.electronBrowserTabs.onBrowserInitialize((tab) => {
      dispatch(setInitializeTab(tab));
    });

    window.electronBrowserTabs.sendReady();
  }, []);

  useEffect(() => {
    async function getBookmarks() {
      const bookmarks = await window.slatebrowserdbAPI.getAllBookmark();
      console.log({ bookmarks });
      if (bookmarks) {
        dispatch(getAllBookmark(bookmarks));
      }
    }
    getBookmarks();
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100/50 overflow-hidden font-sans antialiased text-slate-900">
      {/* Fixed Top Bar */}
      <TopBar />
      <BookmarkBar />

      {/* Main Section Content Area */}
      <main ref={mainRef} className="flex-1 flex overflow-hidden relative">
        {/* Browser View: Full width flexible section */}
        <section className="flex-1 h-full w-full overflow-hidden flex flex-col bg-white">
          <BrowserView mainRef={mainRef} />
          {/* <BrowserViewsArea /> */}
        </section>

        {/* Bunny AI Section */}
        {/* <BunnyAI
          isOpen={isBunnyAIOpen}
          onClose={() => dispatch(toggleBunnyAI())}
        /> */}
        {false && (
          <DappWallet
            isOpen={isBunnyAIOpen}
            onClose={() => dispatch(toggleBunnyAI())}
          />
        )}

        {/* Third Section: Wallet or Workflow (Condition 2) */}
        <ThirdSection />
        {/* Sidebar Switcher: List of tabs section (Condition 1 & 2) */}
        <SidebarSwitcher />
      </main>

      {/* Modern guiding message / toast area if needed */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 z-100 animate-fade-in pointer-events-none">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
        <p className="text-xs font-medium text-slate-700">
          Slate is ready. Integrated wallet & AI active.
        </p>
      </div>
    </div>
  );
}

export default App;
