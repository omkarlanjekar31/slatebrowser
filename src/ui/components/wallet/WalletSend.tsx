import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ArrowUpRight, Search, Info } from 'lucide-react';
import { setView, switchNetwork } from '../../features/walletSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useTypedSelector';

const WalletSend = () => {
    const dispatch = useAppDispatch();
    const {
        accounts,
        currentAccountIndex,
        selectedNetwork,
        networks
    } = useAppSelector((state) => state.wallet);

    const account = accounts[currentAccountIndex];
    const network = networks.find(n => n.id === selectedNetwork);

    const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [fiatValue, setFiatValue] = useState('0.00');

    // Mock exchange rates
    const rates:any = {
        ethereum: 2500,
        polygon: 0.8,
        arbitrum: 1.2
    };

    useEffect(() => {
        const rate = rates[selectedNetwork] || 0;
        const val = parseFloat(amount) * rate;
        setFiatValue(isNaN(val) ? '0.00' : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }, [amount, selectedNetwork]);

    const unit = selectedNetwork === 'ethereum' ? 'ETH' : selectedNetwork === 'polygon' ? 'MATIC' : 'ARB';

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
                <h2 className="text-sm font-bold text-slate-800/80 uppercase ">Send Assets</h2>
                <div className="w-9"></div> {/* Balancer */}
            </div>


            <div className="flex-1 px-6 overflow-y-auto scrollbar-hide space-y-6 pb-8">
                {/* Network Selector */}
                <div className="space-y-3">
                    <label className="text-xs font-bold  text-slate-500 ml-1">Select Network</label>
                    <div className="relative mt-1">
                        <button
                            onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
                            className="w-full flex items-center justify-between px-5 py-2 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: network?.color }}></div>
                                <span className="text-[14px] font-bold text-slate-700">{network?.name}</span>
                            </div>
                            <ChevronDown size={18} className={`text-slate-400 transition-transform ${isNetworkMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isNetworkMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-2 space-y-1">
                                        {networks.map(n => (
                                            <button
                                                key={n.id}
                                                onClick={() => {
                                                    dispatch(switchNetwork(n.id));
                                                    setIsNetworkMenuOpen(false);
                                                }}
                                                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: n.color }}></div>
                                                <span className={`text-[14px] font-bold ${selectedNetwork === n.id ? 'text-slate-900' : 'text-slate-500'}`}>
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

                {/* Recipient Address */}
                <div className="space-y-3">
                    <label className="text-xs font-bold  text-slate-500  ml-1">To Address</label>
                    <div className="relative mt-1">
                        <input
                            type="text"
                            placeholder="Public address (0x) or ENS"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 pr-12"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                            <Search size={18} />
                        </div>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end ml-1">
                        <label className="text-xs font-bold text-slate-500">Amount</label>
                        <span className="text-xs font-bold text-slate-500">Balance: {account.balance} {unit}</span>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-3xl text-white shadow-sm  border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent text-2xl font-bold outline-none w-full text-slate-700 placeholder:text-slate-400"
                            />
                            <div className="px-3 py-1 ml-2 bg-white/10 rounded-lg border border-white/5">
                                <span className="text-xs font-bold uppercase text-slate-700">{unit}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-white/40">
                            <p className="text-sm font-medium text-slate-700">≈ ${fiatValue}</p>
                            <button
                                onClick={() => setAmount(account.balance)}
                                className="text-[10px] font-bold uppercase text-slate-700 hover:text-white transition-colors"
                            >
                                Max
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-3">
                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-blue-600 leading-relaxed font-medium">
                        Ensure you're sending assets on the same network. Transactions cannot be reversed.
                    </p>
                </div>

                {/* Send Button */}
                <div className="pt-4">
                    <button
                        className={`w-full py-3 rounded-2xl font-medium text-sm shadow-xl transition-all flex items-center justify-center space-x-2 hover:cursor-pointer ${recipient && amount ? 'bg-slate-800/99 hover:bg-slate-800/97 text-white hover:scale-[1.02] active:scale-[0.98]' : 'bg-slate-100 text-slate-300'}`}
                        disabled={!recipient || !amount}
                    >
                        <span className="font-medium">Send Assets</span>
                        <ArrowUpRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletSend;
