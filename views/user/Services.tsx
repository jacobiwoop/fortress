import React, { useState } from 'react';
import { store } from '../../services/store';
import { FileText, Shield, Settings as SettingsIcon, AlertOctagon, Users } from 'lucide-react';

export const Services: React.FC = () => {
    const [msg, setMsg] = useState('');

    const handleRequest = (service: string) => {
        setMsg(`Request for ${service} sent successfully.`);
        setTimeout(() => setMsg(''), 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">{store.t('srv.title')}</h2>
                <p className="text-zinc-400">{store.t('srv.desc')}</p>
            </div>

            {msg && (
                <div className="p-4 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400">
                    {msg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Statements */}
                <button onClick={() => handleRequest(store.t('srv.statements'))} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700">
                        <FileText size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{store.t('srv.statements')}</h3>
                    <p className="text-sm text-zinc-500">Download monthly PDF statements</p>
                </button>

                {/* Certificates */}
                <button onClick={() => handleRequest(store.t('srv.certificates'))} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700">
                        <Shield size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{store.t('srv.certificates')}</h3>
                    <p className="text-sm text-zinc-500">Request proof of account / funds</p>
                </button>

                {/* Limits */}
                <button onClick={() => handleRequest(store.t('srv.limits'))} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700">
                        <SettingsIcon size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{store.t('srv.limits')}</h3>
                    <p className="text-sm text-zinc-500">Adjust transfer and withdrawal limits</p>
                </button>

                {/* Stop Card */}
                <button onClick={() => window.location.hash = '#/cards'} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <div className="w-12 h-12 rounded-lg bg-red-900/10 flex items-center justify-center mb-4 text-red-400 group-hover:bg-red-900/20">
                        <AlertOctagon size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{store.t('srv.stop_card')}</h3>
                    <p className="text-sm text-zinc-500">Block lost or stolen cards</p>
                </button>

                {/* Beneficiaries */}
                <button onClick={() => window.location.hash = '#/transfers'} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700">
                        <Users size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{store.t('srv.beneficiaries')}</h3>
                    <p className="text-sm text-zinc-500">Add or remove transfer contacts</p>
                </button>
            </div>
        </div>
    );
};
