import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, ChevronLeft, X, Info } from 'lucide-react';
import { setView, addNetwork } from '../../features/walletSlice';
import { useAppDispatch } from '../../hooks/useTypedSelector';

const AddNetwork = () => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        name: '',
        rpcUrl: '',
        chainId: '',
        symbol: '',
        explorerUrl: ''
    });

    const [errors, setErrors] = useState<any>({});

    const handleChange = (e:any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev:any) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors:any = {};
        if (!formData.name) newErrors.name = 'Network Name is required';
        if (!formData.rpcUrl) newErrors.rpcUrl = 'RPC URL is required';
        if (!formData.chainId) newErrors.chainId = 'Chain ID is required';
        if (!formData.symbol) newErrors.symbol = 'Symbol is required';

        // Basic URL validation
        try {
            if (formData.rpcUrl) new URL(formData.rpcUrl);
        } catch (e) {
            newErrors.rpcUrl = 'Invalid RPC URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            dispatch(addNetwork(formData));
            dispatch(setView('dashboard'));
        }
    };

    const inputClasses = (name:any) => `
        w-full p-2 bg-slate-50 border text-sm ${errors[name] ? 'border-rose-300' : 'border-slate-200'} 
        rounded-xl focus:border-slate-500/99 outline-none transition-all 
         text-slate-800/99 placeholder:text-slate-300
    `;

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
                <h2 className="text-sm font-bold text-slate-800/80 uppercase ">Add Custom Network</h2>
                <div className="w-9"></div> {/* Balancer */}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-3">
                        <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[12px] font-medium text-blue-600 leading-relaxed">
                            Adding a custom network can be risky. Only add networks you trust.
                            Malicious networks can report fake transactions or show false balances.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">Network Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Ethereum Mainnet"
                                className={inputClasses('name')}
                            />
                            {errors.name && <p className="text-xs font-bold text-rose-500 mt-1 ml-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500    ml-1 mb-3 block">New RPC URL</label>
                            <input
                                name="rpcUrl"
                                value={formData.rpcUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className={inputClasses('rpcUrl')}
                            />
                            {errors.rpcUrl && <p className="text-xs font-bold text-rose-500 mt-1 ml-1">{errors.rpcUrl}</p>}
                        </div>

                        <div className="grid grid-cols-2 mt-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500  ml-1 mb-2 block">Chain ID</label>
                                <input
                                    name="chainId"
                                    value={formData.chainId}
                                    onChange={handleChange}
                                    placeholder="e.g. 1"
                                    className={inputClasses('chainId')}
                                />
                                {errors.chainId && <p className="text-xs font-bold text-rose-500 mt-1 ml-1">{errors.chainId}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500  ml-1 mb-2 block">Symbol</label>
                                <input
                                    name="symbol"
                                    value={formData.symbol}
                                    onChange={handleChange}
                                    placeholder="e.g. ETH"
                                    className={inputClasses('symbol')}
                                />
                                {errors.symbol && <p className="text-xs font-bold text-rose-500 mt-1 ml-1">{errors.symbol}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-3 block">Block Explorer URL (Optional)</label>
                            <input
                                name="explorerUrl"
                                value={formData.explorerUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className={inputClasses('explorerUrl')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-50 space-y-3">
                <button
                    onClick={handleSave}
                    className="w-full py-3 bg-slate-800/99 text-white rounded-2xl font-bold shadow-sm transition-all flex items-center justify-center space-x-2 hover:cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Save size={18} />
                    <span>Add Network</span>
                </button>
                <button
                    onClick={() => dispatch(setView('dashboard'))}
                    className="w-full py-3 text-slate-400 font-bold hover:text-slate-900 transition-colors hover:cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddNetwork;
