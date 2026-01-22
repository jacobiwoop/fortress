import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { FileText, Shield, Settings as SettingsIcon, AlertOctagon, Users, Building2, Wallet } from 'lucide-react';
import { User } from '../../types';

export const Services: React.FC = () => {
    const [msg, setMsg] = useState('');
    const [user, setUser] = useState<User | null>(store.getCurrentUser());
    const [selectedInstitution, setSelectedInstitution] = useState('TD Bank');
    const [showInstitutionModal, setShowInstitutionModal] = useState(false);

    useEffect(() => {
        return store.subscribe(() => {
            setUser(store.getCurrentUser());
        });
    }, []);

    const handleRequest = (service: string) => {
        setMsg(`Request for ${service} sent successfully.`);
        setTimeout(() => setMsg(''), 3000);
    };

    const handleInstitutionChange = async () => {
        if (!user) return;
        
        try {
            await store.requestInstitutionChange(user.id, selectedInstitution);
            setMsg(`Demande de changement vers ${selectedInstitution} envoyée avec succès.`);
            setShowInstitutionModal(false);
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Erreur lors de l\'envoi de la demande.');
            setTimeout(() => setMsg(''), 3000);
        }
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
                {/* Change Institution */}
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
                        <Building2 size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-1">Changer mon institution financière</h3>
                    <p className="text-sm text-zinc-500 mb-4">Institution actuelle: {user?.financialInstitution || 'TD Bank'}</p>
                    
                    {!showInstitutionModal ? (
                        <button 
                            onClick={() => setShowInstitutionModal(true)}
                            className="w-full px-4 py-2 bg-brand-yellow text-black font-medium rounded hover:bg-yellow-400 transition-colors"
                        >
                            Demander un changement
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <select
                                value={selectedInstitution}
                                onChange={(e) => setSelectedInstitution(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                            >
                                <option value="TD Bank">TD Bank</option>
                                <option value="Desjardins">Desjardins</option>
                                <option value="BNC">Banque Nationale du Canada (BNC)</option>
                                <option value="BMO">BMO (Bank of Montreal)</option>
                                <option value="Laurentienne">Banque Laurentienne</option>
                                <option value="Tangerine">Tangerine</option>
                            </select>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleInstitutionChange}
                                    className="flex-1 px-4 py-2 bg-brand-yellow text-black font-medium rounded hover:bg-yellow-400 transition-colors"
                                >
                                    Envoyer
                                </button>
                                <button 
                                    onClick={() => setShowInstitutionModal(false)}
                                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>

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

                {/* Withdrawal Methods */}
                <button onClick={() => window.location.hash = '#/profile'} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-left group">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700">
                        <Wallet size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-1">Gérer mes moyens de retrait</h3>
                    <p className="text-sm text-zinc-500">Ajouter ou supprimer des cartes et comptes crypto</p>
                </button>
            </div>
        </div>
    );
};
