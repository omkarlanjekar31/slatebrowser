import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Import, ArrowRight, ShieldCheck, Info, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { setupWallet } from '../../features/walletSlice';
import PasswordCrackTimer from './PasswordCrackTimer';
import { useAppDispatch } from '../../hooks/useTypedSelector';

const WalletOnboarding = () => {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState('choice'); // choice, create, import, password
    const [seedPhrase, setSeedPhrase] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const generateSeed = () => {
        // Mock seed generation
        const words = "apple banana cherry date elderberry fig grape hazelnut indigo jasmine kiwi lemon".split(' ');
        setSeedPhrase(words.join(' '));
        setStep('create');
    };

    const handleSetup = () => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        dispatch(setupWallet({ seedPhrase, password }));
    };

    const nextStep = () => {
        if (step === 'choice') generateSeed();
        else if (step === 'create' || step === 'import') setStep('password');
    };

    return (
        <div className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
                {step === 'choice' && (
                    <motion.div
                        key="choice"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-800/99 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800/99 tracking-tight">Welcome to Slate Wallet</h2>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Your gateway to the decentralized web. Secure, private, and powerful.</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={generateSeed}
                                className="w-full p-6 rounded-3xl border-2 border-slate-100 hover:border-slate-800/99 hover:shadow-xl transition-all group text-left bg-white hover:cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-slate-800/99 group-hover:text-white transition-all text-slate-600">
                                        <Key size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800/99">Create New Wallet</h4>
                                        <p className="text-[12px] text-slate-400 font-medium">Generate a new 12-word recovery phrase</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setStep('import')}
                                className="w-full p-6 rounded-3xl border-2 border-slate-100 hover:border-slate-800/99 hover:shadow-xl transition-all group text-left bg-white hover:cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-slate-800/99 group-hover:text-white transition-all text-slate-600">
                                        <Import size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800/99">Import Existing Wallet</h4>
                                        <p className="text-[12px] text-slate-400 font-medium">Use your existing recovery phrase</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {(step === 'create' || step === 'import') && (
                    <motion.div
                        key="phrase"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >

                        <button
                            onClick={() => setStep('choice')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors hover:cursor-pointer"
                        >
                            <ChevronLeft size={20} className="text-slate-600" />
                        </button>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800/99  tracking-tight mb-2">
                                {step === 'create' ? 'Your Recovery Phrase' : 'Secret Recovery Phrase'}
                            </h2>
                            <p className="text-[12px] text-slate-500 font-medium">
                                {step === 'create'
                                    ? 'Write down these 12 words in order and save them in a safe place.'
                                    : 'Paste your secret recovery phrase here to restore your wallet.'}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 relative group">
                            {step === 'create' ? (
                                <p className="text-sm font-bold text-slate-800/99 leading-loose text-center tracking-wide">
                                    {seedPhrase}
                                </p>
                            ) : (
                                <textarea
                                    value={seedPhrase}
                                    onChange={(e) => setSeedPhrase(e.target.value)}
                                    placeholder="Enter your 12 words here..."
                                    className="w-full h-32 bg-transparent border-none text-sm font-bold text-slate-800/99 focus:ring-0 resize-none text-center outline-none"
                                />
                            )}
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start space-x-3">
                            <Info size={18} className="text-amber-600 mt-0.5" />
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                <strong>IMPORTANT:</strong> This phrase is the ONLY way to recover your wallet. Slate Browser does not store it. If you lose it, your funds are gone forever.
                            </p>
                        </div>

                        <button
                            onClick={() => setStep('password')}
                            disabled={!seedPhrase}
                            className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <span>I've saved it securely</span>
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}

                {step === 'password' && (
                    <motion.div
                        key="password"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* <button onClick={() => setStep('create')} className="flex items-center text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest">
                            <ChevronLeft size={16} className="mr-1" /> 
                        </button> */}
                        <button
                            onClick={() => setStep('create')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors hover:cursor-pointer"
                        >
                            <ChevronLeft size={20} className="text-slate-600" />
                        </button>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800/99 mb-2">Create Password</h2>
                            <p className="text-[12px] text-slate-500 font-medium">This password will unlock your wallet only on this device.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Enter secure password"
                                    className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <PasswordCrackTimer password={password} />

                            {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>}
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                                Tip: Use at least 8 characters, including symbols and numbers to make it harder to crack!
                            </p>
                        </div>

                        <button
                            onClick={handleSetup}
                            disabled={!password}
                            className="w-full py-4 bg-slate-800/99 text-white rounded-2xl font-bold  hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-xl shadow-slate-200"
                        >
                            <span>Initialize Wallet</span>
                            <ShieldCheck size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletOnboarding;
