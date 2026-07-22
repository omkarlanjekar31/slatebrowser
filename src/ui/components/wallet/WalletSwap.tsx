import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, RefreshCw, Info, ArrowDown, Check } from 'lucide-react';
import { setView } from '../../features/walletSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useTypedSelector';

const WalletSwap = () => {
    const dispatch = useAppDispatch();
    const {
        accounts,
        currentAccountIndex,
        selectedNetwork,
        networks
    } = useAppSelector((state) => state.wallet);

    const account = accounts[currentAccountIndex];

    const [fromNetwork, setFromNetwork] = useState(selectedNetwork);
    const [toNetwork, setToNetwork] = useState('polygon');
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('0.00');
    const [isFromMenuOpen, setIsFromMenuOpen] = useState(false);
    const [isToMenuOpen, setIsToMenuOpen] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const fromNetObj = networks.find(n => n.id === fromNetwork);
    const toNetObj = networks.find(n => n.id === toNetwork);

    // Mock exchange rates relative to ETH
    const rates :any= {
        ethereum: 1,
        polygon: 2800, // 1 ETH = 2800 MATIC (mock)
        arbitrum: 0.95 // 1 ETH = 0.95 ARB (mock)
    };

    useEffect(() => {
        if (!fromAmount) {
            setToAmount('0.00');
            return;
        }

        const fromRate = rates[fromNetwork];
        const toRate = rates[toNetwork];

        // Convert fromAmount to 'base' (ETH) then to target
        const inBase = parseFloat(fromAmount) / fromRate;
        const result = inBase * toRate;

        setToAmount(result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }));
    }, [fromAmount, fromNetwork, toNetwork]);

    const handleSwap = () => {
        setIsSwapping(true);
        setTimeout(() => {
            setIsSwapping(false);
            setIsSuccess(true);
            setTimeout(() => {
                dispatch(setView('dashboard'));
            }, 2000);
        }, 3000);
    };

    const getUnit = (netId:string) => {
        if (netId === 'ethereum') return 'ETH';
        if (netId === 'polygon') return 'MATIC';
        return 'ARB';
    };

    if (isSuccess) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl"
                >
                    <Check size={40} strokeWidth={3} />
                </motion.div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Swap Successful!</h2>
                    <p className="text-sm text-slate-400 font-medium">Your assets are being moved across chains.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full text-center">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Transaction Hash</p>
                    <p className="text-[12px] font-mono text-slate-600 font-bold">0x7d...f2a9</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col pt-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 flex items-center justify-between mb-8">
                <button
                    onClick={() => dispatch(setView('dashboard'))}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors hover:cursor-pointer"
                >
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <h2 className="text-sm font-bold text-slate-800/80 uppercase ">Swap Assets</h2>
                <div className="w-9"></div> {/* Balancer */}
            </div>


            <div className="flex-1 px-6 overflow-y-auto scrollbar-hide space-y-4 pb-8">
                {/* From Section */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end ml-1">
                        <label className="text-xs font-bold text-slate-400">From</label>
                        <span className="text-xs font-bold text-slate-500">Balance: {account.balance} {getUnit(fromNetwork)}</span>
                    </div>

                    <div className="p-6 bg-slate-100 border border-slate-200 rounded-[32px] space-y-4">
                        <div className="flex items-center justify-between">
                            <input
                                type="number"
                                placeholder="0.00"
                                value={fromAmount}
                                onChange={(e) => setFromAmount(e.target.value)}
                                className="border-0 pb-1 border-b border-slate-400 text-3xl font-bold outline-none w-full placeholder:text-slate-300"
                            />

                            <div className="relative">
                                <button
                                    onClick={() => setIsFromMenuOpen(!isFromMenuOpen)}
                                    className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-all whitespace-nowrap hover:cursor-pointer ml-2"
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fromNetObj?.color }}></div>
                                    <span className="text-xs font-bold text-slate-700">{fromNetObj?.name}</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isFromMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isFromMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-2 space-y-1">
                                                {networks.map(n => (
                                                    <button
                                                        key={n.id}
                                                        onClick={() => {
                                                            setFromNetwork(n.id);
                                                            setIsFromMenuOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors hover:cursor-pointer"
                                                    >
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }}></div>
                                                        <span className={`text-xs font-bold ${fromNetwork === n.id ? 'text-slate-900' : 'text-slate-500'}`}>
                                                            {n.name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-slate-500 truncate">
                            {account.address}
                        </div>
                    </div>
                </div>

                {/* Divider / Switcher Icon */}
                <div className="flex justify-center -my-3 relative z-10">
                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-sm border-1 border-white">
                        <ArrowDown size={16} />
                    </div>
                </div>

                {/* To Section */}
                <div className="space-y-3 mt-2">
                    <label className="text-xs font-bold text-slate-400   ml-1">To (Estimated)</label>
                    <div className="p-6 bg-slate-100 border border-slate-200 rounded-[32px] space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold truncate pr-4 text-slate-700">
                                {toAmount}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsToMenuOpen(!isToMenuOpen)}
                                    className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-full hover:bg-slate-50 transition-all whitespace-nowrap hover:cursor-pointer ml-2"
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: toNetObj?.color }}></div>
                                    <span className="text-xs font-bold text-slate-700">{toNetObj?.name}</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isToMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isToMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-2 space-y-1">
                                                {networks.map(n => (
                                                    <button
                                                        key={n.id}
                                                        onClick={() => {
                                                            setToNetwork(n.id);
                                                            setIsToMenuOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors hover:cursor-pointer"
                                                    >
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }}></div>
                                                        <span className={`text-[12px] font-bold ${toNetwork === n.id ? 'text-slate-900' : 'text-slate-500'}`}>
                                                            {n.name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-slate-500 truncate">
                            {account.address}
                        </div>
                    </div>
                </div>

                {/* Exchange Rate Info */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-400">
                        <Info size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Exchange Rate</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800/99">
                        1 {getUnit(fromNetwork)} ≈ {(rates[toNetwork] / rates[fromNetwork]).toFixed(2)} {getUnit(toNetwork)}
                    </span>
                </div>

                {/* Swap Button */}
                <div className="pt-4">
                    <button
                        onClick={handleSwap}
                        disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
                        className={`w-full py-3 rounded-3xl font-medium text-sm shadow-xl transition-all flex items-center justify-center space-x-3  ${!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-800 text-white hover:scale-[1.02] active:scale-[0.98]'}`}
                    >
                        {isSwapping ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                <span className='text-sm'>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span className='text-sm'>Swap Assets</span>
                                <RefreshCw size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletSwap;
