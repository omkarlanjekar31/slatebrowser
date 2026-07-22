import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Plus, LogOut, Key, Eye, EyeOff, ShieldAlert, ChevronLeft, Download, ShieldCheck } from 'lucide-react';
import { setView, switchAccount, addAccount, logoutWallet, renameAccount } from '../../features/walletSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useTypedSelector';

const WalletSettings = () => {
    const dispatch = useAppDispatch();
    const {
        accounts,
        currentAccountIndex,
        password,
        seedPhrase,
        currentView
    } = useAppSelector((state) => state.wallet);

    const [isRevealing, setIsRevealing] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [revealError, setRevealError] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [tempName, setTempName] = useState('');

    const handleReveal = () => {
        if (confirmPassword === password) {
            setRevealed(true);
            setRevealError('');
        } else {
            setRevealError('Incorrect password');
        }
    };

    const handleLogout = () => {
        dispatch(logoutWallet());
        dispatch(setView('dashboard')); // Reset view for next login
    };

    const downloadSeed = () => {
        const element = document.createElement("a");
        const file = new Blob([seedPhrase], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "slate-wallet-recovery-phrase.txt";
        document.body.appendChild(element);
        element.click();
    };

    const startEditing = (idx:any) => {
        setEditingIndex(idx);
        setTempName(accounts[idx].name);
    };

    const handleSaveName = () => {
        if (tempName.trim()) {
            dispatch(renameAccount({ index: editingIndex, newName: tempName.trim() }));
            setEditingIndex(null);
            setTempName('');
        }
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setTempName('');
    };

    return (
        <div className="flex-1 flex flex-col pt-6 overflow-y-auto scrollbar-hide">
            <div className="px-6 flex items-center justify-between mb-8">
                <button
                    onClick={() => dispatch(setView('dashboard'))}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors hover:cursor-pointer"
                >
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <h2 className="text-sm font-bold text-slate-800/80 uppercase ">Wallet Settings</h2>
                <div className="w-9"></div> {/* Balancer */}
            </div>

            <div className="px-6 space-y-8 pb-12">
                {/* Profile Section */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-slate-800/99 border-1 border-slate-50 flex items-center justify-center text-white text-3xl font-black shadow-sm mb-4 relative group">
                        {accounts[currentAccountIndex].name.split(' ').map(n => n[0]).join('')}
                        <button
                            onClick={() => startEditing(currentAccountIndex)}
                            className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-slate-200 shadow-md text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <Edit2 size={14} />
                        </button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800/99">{accounts[currentAccountIndex].name}</h3>
                    <button
                        onClick={() => startEditing(currentAccountIndex)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-800/99 transition-colors uppercase  mt-1"
                    >
                        Edit Name
                    </button>
                </div>

                {/* Account Switcher */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500   ml-1">Switch Account</h4>
                    <div className="p-3 bg-slate-50/40 border border-slate-200 rounded-[32px] space-y-1">
                        {accounts.map((acc, idx) => (
                            <button
                                key={idx}
                                onClick={() => dispatch(switchAccount(idx))}
                                className={`w-full flex mt-2 items-center justify-between p-3 rounded-2xl transition-all ${currentAccountIndex === idx
                                    ? 'bg-white shadow-sm border border-slate-100'
                                    : 'hover:bg-white/90 hover:cursor-pointer border border-white/90 hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold  ${currentAccountIndex === idx ? 'bg-slate-800/99 text-white' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                        {acc.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className={`text-sm font-bold ${currentAccountIndex === idx ? 'text-slate-800/99' : 'font-medium  text-slate-600'}`}>
                                        {acc.name}
                                    </span>
                                </div>
                                {currentAccountIndex !== idx && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEditing(idx);
                                        }}
                                        className="text-[10px] p-1 font-bold text-slate-400 hover:text-slate-800/99 transition-colors"
                                    >
                                        Edit
                                    </button>
                                )}
                            </button>
                        ))}
                        <button
                            onClick={() => dispatch(addAccount({ name: '' }))}
                            className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-slate-100/50 transition-all text-slate-400 hover:text-slate-900"
                        >
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                                <Plus size={14} />
                            </div>
                            <span className="text-[13px] font-bold">Add New Account</span>
                        </button>
                    </div>
                </div>

                {/* Security Section */}
                <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security</h4>
                    <div className="space-y-3">
                        {!revealed ? (
                            <button
                                onClick={() => setIsRevealing(true)}
                                className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-200 hover:cursor-pointer hover:shadow-sm transition-all group hover:bg-slate-50/40 "
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-800/99 group-hover:text-white transition-all">
                                        <Key size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[13px] font-bold text-slate-800/99">Show Recovery Phrase</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Reveal your secret 12 words</p>
                                    </div>
                                </div>
                                <X size={16} className="text-slate-400 rotate-45" />
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 bg-slate-800 rounded-[32px] text-white shadow-2xl space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-emerald-400">
                                        <ShieldCheck size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
                                    </div>
                                    <button onClick={() => setRevealed(false)} className="text-white/40 hover:text-white transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                                <p className="text-sm font-bold leading-loose text-center tracking-wide text-white/90">
                                    {seedPhrase}
                                </p>
                                <button
                                    onClick={downloadSeed}
                                    className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center space-x-2 transition-all font-bold text-sm"
                                >
                                    <Download size={18} />
                                    <span>Download Backup</span>
                                </button>
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3">
                                    <ShieldAlert size={16} className="text-red-400 mt-0.5" />
                                    <p className="text-[10px] text-red-200/80 font-medium leading-relaxed">
                                        Please keep it securely. It cannot be recovered if you logout from Slate Browser and lose this phrase.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 p-5 bg-red-50 border border-red-100 text-red-600 rounded-3xl hover:bg-red-500 hover:text-white hover:shadow-xl hover:shadow-red-100 transition-all font-bold text-[13px] group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Lock & Logout Wallet</span>
                </button>
            </div>

            {/* Password Verification Modal */}
            <AnimatePresence>
                {isRevealing && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-800/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100"
                        >
                            <div className="text-center space-y-4 mb-8">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-900 mx-auto">
                                    <Key size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Security Check</h3>
                                    <p className="text-[12px] text-slate-500 font-medium">Enter your wallet password to reveal phrase</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setRevealError('');
                                        }}
                                        placeholder="Wallet password"
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold"
                                        autoFocus
                                    />
                                    {revealError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{revealError}</p>}
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setIsRevealing(false);
                                            setConfirmPassword('');
                                            setRevealError('');
                                        }}
                                        className="flex-1 py-4 text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleReveal();
                                            if (confirmPassword === password) {
                                                setIsRevealing(false);
                                                setConfirmPassword('');
                                            }
                                        }}
                                        className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-700 transition-all text-[13px]"
                                    >
                                        Reveal Phrase
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Account Name Edit Modal */}
            <AnimatePresence>
                {editingIndex !== null && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-800/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100"
                        >
                            <div className="text-center space-y-4 mb-8">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-800/99 mx-auto">
                                    <Edit2 size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800/99">Rename Account</h3>
                                    <p className="text-xs text-slate-500 font-medium">Enter a new name for your account</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        placeholder="Account Name"
                                        className="w-full text-slate-800/99 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-800/99 focus:bg-white outline-none transition-all font-bold"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveName();
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 py-4 text-[13px] font-bold text-slate-400 hover:text-slate-800/99 transition-colors hover:cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveName}
                                        className="flex-1 py-4 bg-slate-800/99 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800/90 transition-all text-sm hover:cursor-pointer"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletSettings;
