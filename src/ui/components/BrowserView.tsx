import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Newspaper,
  ExternalLink,
  Zap,
  Search,
  Shield,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useTypedSelector";
import { setViewBounds } from "../features/tabsSlice";
import BrowserViewsArea from "./BrowserViewsArea";
import { computeNativeBounds } from "../helpers/Browser.helper";

const BrowserView = ({
  mainRef,
}: {
  mainRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const { tabs, activeTabId, currentUrl } = useAppSelector(
    (state) => state.tabs,
  );
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const dispatch = useAppDispatch();
  const browserViewsRef = useRef<HTMLDivElement>(null);
  const isThirdSectionOpen = useAppSelector(
    (state) => state.layout.isThirdSectionOpen,
  );
  const thirdSectionWidth = useAppSelector(
    (state) => state.layout.thirdSectionWidth,
  );

  ///

  async function handleViewBoundsUpdate() {
    if (!browserViewsRef || !browserViewsRef.current) return;
    const boundsRect = browserViewsRef.current.getBoundingClientRect();

    // MUST await the async IPC call
    const winBounds = await window.electronBrowserTabs.getWindowContentBounds();
    if (!boundsRect || !winBounds) return;

    const nativeBounds = computeNativeBounds(boundsRect, winBounds);

    dispatch(setViewBounds(nativeBounds));

    window.electronBrowserTabs.updateViewBounds(nativeBounds);
  }

  useEffect(() => {
    if (!browserViewsRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      handleViewBoundsUpdate();
    });

    resizeObserver.observe(browserViewsRef.current);
    // Also run once immediately
    handleViewBoundsUpdate();
    return () => resizeObserver.disconnect();
  }, [isThirdSectionOpen]);

  useEffect(() => {
    if (!mainRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      handleViewBoundsUpdate();
    });

    resizeObserver.observe(mainRef.current);

    handleViewBoundsUpdate();

    return () => resizeObserver.disconnect();
  }, [isThirdSectionOpen]);

  //
  const updateBounds = () => {
    if (browserViewsRef.current) {
      const rect = browserViewsRef.current.getBoundingClientRect();

      const bounds = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
      dispatch(setViewBounds(bounds));
      // Send to Electron
      window.electronBrowserTabs.updateViewBounds(bounds);
    }
  };

  // useEffect(() => {
  //   const handleUpdateViewBounds = () => {
  //     if (mainRef.current) {
  //       // setTotalWidth(mainRef.current.clientWidth);
  //       handleViewBoundsUpdate();
  //     }
  //   };
  //   handleUpdateViewBounds();
  // }, [isThirdSectionOpen]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (mainRef.current) {
  //       // setTotalWidth(mainRef.current.clientWidth);
  //       handleViewBoundsUpdate();
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   handleResize();
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  return (
    <div className="flex-1 h-full bg-slate-50 relative overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full flex flex-col overflow-y-auto relative"
        >
          {/* {activeTab?.url != "about:blank" && ( */}
          <BrowserViewsArea browserViewsRef={browserViewsRef} />
          {/* )} */}

          {activeTab?.url == "about:blank" && false && (
            <div className="flex flex-row">
              <div className="flex-1 flex flex-col p-8 overflow-y-auto items-center">
                <div className="w-full max-w-6xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-12 px-2 ">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <span className="font-bold text-xl tracking-tighter">
                          S
                        </span>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-0">
                          Slate
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-extrabold">
                          Professional Workstation
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-8">
                      <button className="text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                        Configuration
                      </button>
                      <button className="text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                        Resources
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="mb-14 px-2">
                    <div className="max-w-3xl mx-auto relative group">
                      <input
                        type="text"
                        placeholder="Search or enter URL"
                        className="w-full bg-white border border-slate-200 rounded-2xl py-5 px-14 shadow-lg shadow-slate-200/50 outline-none transition-all text-base text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300"
                      />
                      <div className="absolute left-5 top-1/2 -translate-y-1/2">
                        <Search size={22} className="text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
                    {/* Market Intelligence */}
                    <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[12px] font-bold text-slate-400 flex items-center uppercase tracking-[0.15em]">
                          <TrendingUp
                            size={18}
                            className="text-slate-900 mr-3"
                          />
                          Market Intelligence
                        </h3>
                        <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          Bullish +2.45%
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          {
                            name: "Bitcoin",
                            symbol: "BTC",
                            price: "$94,250",
                            trend: "+1.2%",
                            color: "text-emerald-600",
                          },
                          {
                            name: "Ethereum",
                            symbol: "ETH",
                            price: "$3,420",
                            trend: "+0.8%",
                            color: "text-emerald-600",
                          },
                          {
                            name: "Solana",
                            symbol: "SOL",
                            price: "$184",
                            trend: "-2.4%",
                            color: "text-rose-600",
                          },
                        ].map((coin) => (
                          <div
                            key={coin.name}
                            className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-3 -mx-3 rounded-2xl transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                {coin.symbol}
                              </div>
                              <span className="text-[15px] font-bold text-slate-900">
                                {coin.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-[15px] font-bold text-slate-900 leading-none mb-1">
                                {coin.price}
                              </p>
                              <p
                                className={`text-[12px] font-bold ${coin.color}`}
                              >
                                {coin.trend}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System Ecosystem */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                      <div>
                        <h3 className="text-[12px] font-bold text-slate-400 mb-8 flex items-center uppercase tracking-[0.15em]">
                          <LayoutDashboard
                            size={18}
                            className="text-slate-900 mr-3"
                          />
                          Ecosystem
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {["DeFi Hub", "Analytics", "Vault", "Bridge"].map(
                            (item) => (
                              <div
                                key={item}
                                className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group shadow-sm"
                              >
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 mb-2 transition-all">
                                  <Zap size={16} />
                                </div>
                                <span className="text-[12px] font-bold text-slate-500 group-hover:text-slate-900">
                                  {item}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Briefings */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all">
                      <h3 className="text-[12px] font-bold text-slate-400 mb-8 flex items-center uppercase tracking-[0.15em]">
                        <Newspaper size={18} className="text-slate-900 mr-3" />
                        Briefings
                      </h3>
                      <div className="space-y-6 flex-1">
                        {[
                          {
                            title: "Ethereum Pectra upgrade scheduled for 2025",
                            time: "2h ago",
                          },
                          {
                            title: "DeFi TVL surges across L2 protocols",
                            time: "5h ago",
                          },
                        ].map((news, idx) => (
                          <div key={idx} className="cursor-pointer group">
                            <p className="text-[14px] font-bold text-slate-700 line-clamp-2 group-hover:text-slate-900 transition-colors mb-1.5 leading-snug">
                              {news.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                              {news.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Onboarding Professional */}
                  <div className="mt-12 p-10 bg-slate-800 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl mx-2">
                    <div className="relative z-10 text-center md:text-left mb-8 md:mb-0">
                      <h2 className="text-xl font-bold mb-3 flex items-center justify-center md:justify-start tracking-tight text-white">
                        <Zap className="text-blue-400 mr-3" size={24} />
                        Professional On-Chain Workflow
                      </h2>
                      <p className="text-[14px] text-slate-400 max-w-xl leading-relaxed font-medium">
                        Elevate your digital assets management with Slate.
                        Secure bridging, decentralized identity, and
                        institutional-grade tools.
                      </p>
                    </div>
                    <div className="relative z-10 flex space-x-4">
                      <button className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3.5 rounded-2xl font-bold transition-all text-[14px] shadow-xl">
                        Initialize
                      </button>
                      <button className="bg-transparent hover:bg-white/10 border border-slate-700 px-8 py-3.5 rounded-2xl font-bold transition-all text-[14px] text-slate-300">
                        Dismiss
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BrowserView;
