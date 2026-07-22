import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Layers, Plus, Play } from 'lucide-react';
import WalletOnboarding from './wallet/WalletOnboarding';
import WalletDashboard from './wallet/WalletDashboard';
import WalletSettings from './wallet/WalletSettings';
import WalletSend from './wallet/WalletSend';
import WalletReceive from './wallet/WalletReceive';
import WalletSwap from './wallet/WalletSwap';
import AddNetwork from './wallet/AddNetwork';
import { useAppDispatch, useAppSelector } from '../hooks/useTypedSelector';
import AIChatHomeComponent from './AIChatSection/AIChatHomeComponent';
import AIChatHistoryComponent from './AIChatSection/AIChatHistoryComponent';

const ThirdSection = () => {
    const dispatch = useAppDispatch();
    const { selectedSideTab, isThirdSectionOpen } = useAppSelector((state) => state.layout);
    const { isSetUp, isLoggedIn, currentView } = useAppSelector((state) => state.wallet);

    if (!isThirdSectionOpen) return null;

    const renderWalletContent = () => {
        if (!isSetUp) return <WalletOnboarding />;
        if (!isLoggedIn) return (
            <div className="flex-1 flex flex-col p-8 items-center justify-center space-y-8">
                <div className="w-20 h-20 bg-slate-800 rounded-[32px] flex items-center justify-center text-white shadow-2xl">
                    <Lock size={32} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-slate-900">Wallet Locked</h2>
                    <p className="text-sm text-slate-400 font-medium">Enter password to unlock your vault</p>
                </div>
                <div className="w-full space-y-4">
                    <input
                        type="password"
                        placeholder="Unlock password"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none transition-all font-bold"
                        onKeyDown={(e:any) => {
                            if (e.key === 'Enter') {
                                // Simple unlock for demo, in real app we check against stored hash
                                dispatch({ type: 'wallet/unlockWallet', payload: e.target.value });
                            }
                        }}
                    />
                    <button
                        className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                        onClick={(e:any) => {
                            const input = e.currentTarget.previousSibling;
                            dispatch({ type: 'wallet/unlockWallet', payload: input.value });
                        }}
                    >
                        Unlock
                    </button>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors">Forgot Password?</p>
            </div>
        );

        switch (currentView) {
            case 'settings':
                return <WalletSettings />;
            case 'send':
                return <WalletSend />;
            case 'receive':
                return <WalletReceive />;
            case 'swap':
                return <WalletSwap />;
            case 'addNetwork':
                return <AddNetwork />;
            case 'dashboard':
            default:
                return <WalletDashboard />;
        }
    };

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-white border-l border-[#dadce0] flex flex-col shadow-2xl z-40 relative   overflow-y-auto overflow-x-hidden"
        >
            <AnimatePresence mode="wait">
                {selectedSideTab === 'wallet' && (
                    <motion.div
                        key="wallet-container"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 flex flex-col"
                    >
                        {renderWalletContent()}
                    </motion.div>
                )}
                
                {selectedSideTab === 'ai_chat' && <AIChatHomeComponent/>}
                {selectedSideTab === 'ai_chat_history' && <AIChatHistoryComponent/>}
              
            </AnimatePresence>
        </motion.div>
    );
};

export default ThirdSection;
