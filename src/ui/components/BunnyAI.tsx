import React, { useState } from 'react';
import { Send, X, Minimize2, Terminal, Shield, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const BunnyAI = ({ isOpen, onClose }:any) => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', content: "Slate Assistant sequence initialized. System governance at optimal parameters. How may I assist your workstation today?" }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), role: 'user', content: input }]);
        setInput('');

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Processing secure payload. Cryptographic verification complete. Execution modules available in 'Automation' hub."
            }]);
        }, 1000);
    };

    if (!isOpen) return null;
    return (
        <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            className="w-[380px] h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-40"
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-[14px] flex items-center justify-center text-white shadow-lg">
                        <Cpu size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-bold text-slate-900 mb-0.5">Slate Intelligence</h3>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            System Core Active
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <button className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition-all">
                        <Minimize2 size={16} />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scrollbar-hide">
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-4 rounded-xl text-[13px] font-medium leading-relaxed shadow-sm border ${m.role === 'user'
                            ? 'bg-slate-800 text-white border-slate-700 rounded-tr-none'
                            : 'bg-slate-50 text-slate-700 border-slate-100 rounded-tl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Directives */}
            <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex gap-3 overflow-x-auto scrollbar-hide">
                {['/audit_state', '/gas_pulse', '/bridge_asset'].map(cmd => (
                    <button key={cmd} className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all whitespace-nowrap shadow-sm">
                        {cmd}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/5 focus-within:border-slate-300 transition-all shadow-inner group">
                    <Terminal size={16} className="text-slate-400 mr-4 group-focus-within:text-slate-900" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Commit command..."
                        className="flex-1 bg-transparent border-none outline-none text-[14px] text-slate-800 placeholder-slate-400 font-medium"
                    />
                    <button
                        onClick={handleSend}
                        className="p-2 text-slate-900 hover:bg-slate-200 rounded-xl transition-all ml-3"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="flex items-center justify-center mt-4">
                    <div className="flex items-center space-x-2.5 opacity-40">
                        <Shield size={12} className="text-emerald-600" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">End-to-End Cryptography Active</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BunnyAI;
