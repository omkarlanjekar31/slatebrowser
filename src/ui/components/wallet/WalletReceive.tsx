import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { switchNetwork, setView } from '../../features/walletSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useTypedSelector';

const WalletReceive = () => {
    const dispatch = useAppDispatch();
    const {
        accounts,
        currentAccountIndex,
        selectedNetwork,
        networks
    } = useAppSelector((state) => state.wallet);

    const [copied, setCopied] = useState(false);
    const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);

    const account = accounts[currentAccountIndex];
    const network = networks.find(n => n.id === selectedNetwork);

    const copyAddress = () => {
        navigator.clipboard.writeText(account.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getExplorerUrl = (address:any, networkId:any) => {
        switch (networkId) {
            case 'ethereum': return `https://etherscan.io/address/${address}`;
            case 'polygon': return `https://polygonscan.com/address/${address}`;
            case 'arbitrum': return `https://arbiscan.io/address/${address}`;
            default: return `https://etherscan.io/address/${address}`;
        }
    };

    // Placeholder QR code using a public API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${account.address}&color=${network?.color.replace('#', '')}&bgcolor=FFFFFF`;

    return (
        <div className="flex-1 flex flex-col pt-4 overflow-hidden bg-white">
            {/* Header */}
            <div className="px-6 flex items-center justify-between mb-8">
                <button
                    onClick={() => dispatch(setView('dashboard'))}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors hover:cursor-pointer"
                >
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <h2 className="text-sm font-bold text-slate-800/80 uppercase ">Receive Assets</h2>
                <div className="w-9"></div> {/* Balancer */}
            </div>

            {/* Network Selector */}
            <div className="px-6 mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase mb-3 ml-1">Select Network</p>
                <div className="relative">
                    <button
                        onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
                        className="w-full flex items-center justify-between px-5 py-2 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all group hover:cursor-pointer"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: network?.color }}></div>
                            <span className="text-sm font-bold text-slate-700">{network?.name}</span>
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
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors hover:cursor-pointer ${selectedNetwork === n.id ? 'text-slate-800/99' : 'hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }}></div>
                                            <span className="text-sm font-bold">
                                                {n.name}
                                            </span>
                                            {selectedNetwork === n.id && <Check size={14} className="ml-auto text-emerald-400" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Receive Section */}
            <div className="flex-1 px-6 flex flex-col items-center justify-center pb-12">
                {/* QR Code Container */}
                <div className="relative p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-xl mb-8 group">
                    <div className="absolute inset-0  rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-48 h-48 bg-white rounded-2xl overflow-hidden flex items-center justify-center">
                        <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-full h-full object-contain p-2"
                        />
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-400 uppercase mb-4">Your {network?.name} Address</p>

                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-3 break-all relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: network?.color }}></div>
                            <p className="text-sm font-mono font-bold text-slate-700 leading-relaxed pr-8">
                                {account.address}
                            </p>
                            <button
                                onClick={copyAddress}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm hover:cursor-pointer"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <a
                            href={getExplorerUrl(account.address, selectedNetwork)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800/99 text-white rounded-3xl font-medium   hover:cursor-pointer hover:bg-slate-800/90"
                        >
                            <span className="text-sm">View on Explorer</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>

                    <p className="text-[10px] text-center font-bold text-slate-400 leading-relaxed px-4">
                        Only send <span className="text-slate-900 uppercase">{network?.id === 'ethereum' ? 'ETH' : network?.id === 'polygon' ? 'MATIC' : 'ETH'}</span> and assets on the <span className="text-slate-900 font-bold">{network?.name}</span> network to this address.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletReceive;
