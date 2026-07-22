import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Wallet,
  Zap,
  Settings,
  HelpCircle,
  History,
  LayoutGrid,
} from "lucide-react";
import * as Icons from "lucide-react";
import { toggleThirdSection } from "../features/layoutSlice";
import { useAppSelector } from "../hooks/useTypedSelector";

const SidebarSwitcher = () => {
  const dispatch = useDispatch();
  const { selectedSideTab, isThirdSectionOpen, thirdSectionTabsItems } =
    useAppSelector((state) => state.layout);

  return (
    <div className="w-14 h-full bg-slate-50 border-l border-slate-200 flex flex-col items-center py-8 space-y-10 z-50">
      <div className="flex flex-col space-y-6 w-full px-2">
        {thirdSectionTabsItems.map((item) => {
          const IconComponent = Icons[
            item.icon as keyof typeof Icons
          ] as React.ElementType;

          const isActive = selectedSideTab === item.id && isThirdSectionOpen;

          return (
            <div
              key={item.id}
              className="relative group w-full flex justify-center"
            >
              <button
                onClick={() => dispatch(toggleThirdSection(item.id))}
                className={`w-10 h-10 rounded-xl transition-all duration-300 relative flex items-center justify-center ${
                  isActive
                    ? "text-slate-900 bg-white shadow-lg shadow-slate-200/50 border border-slate-200 scale-105"
                    : "text-slate-400 hover:text-slate-900 hover:bg-white"
                }`}
              >
                {IconComponent && <IconComponent size={20} />}
              </button>
              {isActive && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-slate-900 rounded-l-full shadow-sm"></div>
              )}

              {/* Tooltip */}
              <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-800 text-white text-[12px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-100 shadow-xl translate-x-2 group-hover:translate-x-0">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1"></div>

      <div className="flex flex-col items-center space-y-6 pb-8 w-full px-2">
        {/* <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all">
          <History size={20} />
        </button> */}
        <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all">
          <Settings size={20} />
        </button>
        <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all cursor-pointer shadow-sm group">
          <HelpCircle size={18} />
        </div>
      </div>
    </div>
  );
};

export default SidebarSwitcher;
