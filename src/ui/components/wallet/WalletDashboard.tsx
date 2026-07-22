import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Settings,
  FileCode,
  CheckCircle,
} from "lucide-react";
import { switchNetwork, setView } from "../../features/walletSlice";
import * as Icons from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useTypedSelector";

const WalletDashboard = () => {
  const dispatch = useAppDispatch();
  const {
    accounts,
    currentAccountIndex,
    selectedNetwork,
    networks,
    transactions,
  } = useAppSelector((state) => state.wallet);

  const [copied, setCopied] = useState(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);

  const account = accounts[currentAccountIndex];
  const network = networks.find((n) => n.id === selectedNetwork);

  const copyAddress = () => {
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col pt-4 overflow-hidden">
      {/* Header: Network & Profile */}
      <div className="px-6 pb-6 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100  hover:cursor-pointer transition-all group"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: network?.color }}
            ></div>
            <span className="text-[12px] font-bold text-slate-700">
              {network?.name}
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${isNetworkMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isNetworkMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  {networks.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        dispatch(switchNetwork(n.id));
                        setIsNetworkMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl  hover:cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: n.color }}
                      ></div>
                      <span
                        className={`text-[12px] font-bold ${selectedNetwork === n.id ? "text-slate-900" : "text-slate-500"}`}
                      >
                        {n.name}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-50 mt-1 pt-1">
                    <button
                      onClick={() => {
                        dispatch(setView("addNetwork"));
                        setIsNetworkMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-blue-600  hover:cursor-pointer"
                    >
                      <Plus size={14} />
                      <span className="text-[12px] font-bold">
                        Add custom network
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-xs font-bold text-slate-800/99 ">
              {account.name}
            </span>
          </div>
          <button
            onClick={() => dispatch(setView("settings"))}
            className="w-10 h-10 rounded-full bg-slate-800/99 border-1 border-slate-100 flex items-center justify-center text-white font-bold text-sm hover:scale-105 hover:bg-slate-800 transition-transform shadow-sm hover:cursor-pointer"
          >
            {account.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-6 mb-8">
        <div className="p-8 bg-slate-100 rounded-[32px] text-white shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-8 right-8 text-slate-500 hover:!cursor-pointer">
            <RefreshCw size={20} className="" />
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-bold text-md text-slate-800/99   mb-2">
              Available Balance
            </p>
            <h3 className="text-3xl text-slate-700 font-bold tracking-tighter mb-4 flex items-baseline">
              {"USDC"} ${account.balance}
              {/* <span className="text-sm font-medium text-slate-800/99 ml-3 tracking-normal">≈ $24.81</span> */}
            </h3>

            <button
              onClick={copyAddress}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-50/40 rounded-xl transition-all  shadow-xs border border-slate-200  text-slate-700  hover:cursor-pointer"
            >
              <span className=" text-xs font-mono text-slate-700">
                {account.address}
              </span>
              {copied ? (
                <Check size={12} className="text-slate-700" />
              ) : (
                <Copy size={12} className="text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 px-6 mb-8">
        {[
          {
            label: "Send",
            icon: ArrowUpRight,
            onClick: () => dispatch(setView("send")),
          },
          {
            label: "Receive",
            icon: ArrowDownLeft,
            onClick: () => dispatch(setView("receive")),
          },
          {
            label: "Swap",
            icon: RefreshCw,
            onClick: () => dispatch(setView("swap")),
          },
          { label: "Buy", icon: Plus },
        ].map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl  shadow-sm border border-slate-200  flex items-center justify-center text-slate-600 group-hover:bg-slate-800/99 group-hover:text-white group-hover:cursor-pointer shadow-2xl transition-all">
              <action.icon size={20} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-600 group-hover:text-slate-900 group-hover:cursor-pointer uppercase ">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      <hr className="border-t border-slate-300" />

      {/* Transactions */}
      <div className="flex-1 px-6 overflow-y-auto scrollbar-hide mt-3">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 z-10">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Recent Activity
          </h3>
          <button className="text-[10px] font-extrabold text-slate-800/99 hover:opacity-70 transition-all uppercase tracking-widest border-b   pb-0.5">
            View Explorer
          </button>
        </div>

        <div className="space-y-3 pb-8">
          {transactions.map((tx) => {
            const IconComponent = Icons[
              tx.icon as keyof typeof Icons
            ] as React.ElementType;
            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-all">
                    {/* <div className="w-5 h-5 border-2 border-current rounded-full"></div> */}
                    {IconComponent && <IconComponent size={17} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800/99  mb-0.5">
                      {tx.type}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                      {tx.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-slate-800/99">
                    {tx.amount} {tx.unit}
                  </p>
                  <ExternalLink
                    size={12}
                    className="text-slate-300 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
