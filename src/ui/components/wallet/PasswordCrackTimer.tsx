import React, { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const PasswordCrackTimer = ({ password }:{password:string}) => {
    const crackTime = useMemo(() => {
        if (!password) return { label: 'Empty', time: '', color: 'text-slate-400', icon: Shield };

        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        if (password.length < 6) return { label: 'Instant', time: '< 1 second', color: 'text-red-500', icon: ShieldAlert };

        if (strength <= 1) return { label: 'Very Weak', time: 'Minutes', color: 'text-orange-500', icon: ShieldAlert };
        if (strength === 2) return { label: 'Weak', time: 'Days', color: 'text-yellow-500', icon: Shield };
        if (strength === 3) return { label: 'Moderate', time: 'Months', color: 'text-blue-500', icon: Shield };
        if (strength === 4) return { label: 'Strong', time: 'Years', color: 'text-emerald-500', icon: ShieldCheck };
        return { label: 'Immense', time: 'Centuries', color: 'text-emerald-600', icon: ShieldCheck };
    }, [password]);

    const Icon = crackTime.icon;

    return (
        <div className={`flex items-center space-x-2 mt-2 ${crackTime.color} transition-colors duration-300`}>
            <Icon size={16} />
            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{crackTime.label}</span>
                <span className="text-[12px] font-extrabold">Estimated crack time: {crackTime.time}</span>
            </div>
        </div>
    );
};

export default PasswordCrackTimer;
