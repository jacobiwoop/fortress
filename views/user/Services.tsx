import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { FileText, Shield, Settings as SettingsIcon, AlertOctagon, Users, Building2 } from 'lucide-react';
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
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-brand-navy mb-2">{store.t('srv.title')}</h2>
                <p className="text-gray-500 font-medium">{store.t('srv.desc')}</p>
            </div>

            {msg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 font-bold shadow-sm">
                    {msg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Change Institution */}
                <div className="p-8 bg-white border border-gray-100 rounded-[30px] shadow-sm hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-brand-blue">
                        <Building2 size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-brand-navy mb-2">Changer mon institution financière</h3>
                    <p className="text-sm text-gray-400 font-bold mb-6">Institution actuelle: <span className="text-brand-navy">{user?.financialInstitution || 'TD Bank'}</span></p>
                    
                    {!showInstitutionModal ? (
                        <button 
                            onClick={() => setShowInstitutionModal(true)}
                            className="w-full px-6 py-4 bg-brand-navy text-white font-bold rounded-2xl hover:bg-brand-navy/90 transition-colors shadow-lg shadow-brand-navy/20"
                        >
                            Demander un changement
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <select
                                value={selectedInstitution}
                                onChange={(e) => setSelectedInstitution(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-navy font-bold focus:border-brand-blue focus:outline-none"
                            >
                                <option value="TD Bank">TD Bank</option>
                                <option value="Desjardins">Desjardins</option>
                                <option value="BNC">Banque Nationale du Canada (BNC)</option>
                                <option value="BMO">BMO (Bank of Montreal)</option>
                                <option value="Laurentienne">Banque Laurentienne</option>
                                <option value="Tangerine">Tangerine</option>
                            </select>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleInstitutionChange}
                                    className="flex-1 px-4 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-brand-blue/30"
                                >
                                    Envoyer
                                </button>
                                <button 
                                    onClick={() => setShowInstitutionModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-brand-navy font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Statements */}
                <button onClick={() => handleRequest(store.t('srv.statements'))} className="p-8 bg-white border border-gray-100 rounded-[30px] hover:shadow-md transition-all text-left group shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-gray-400 group-hover:text-brand-blue group-hover:bg-blue-50 transition-colors">
                        <FileText size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">{store.t('srv.statements')}</h3>
                    <p className="text-sm text-gray-400 font-bold">Download monthly PDF statements</p>
                </button>

                {/* Certificates */}
                <button onClick={() => handleRequest(store.t('srv.certificates'))} className="p-8 bg-white border border-gray-100 rounded-[30px] hover:shadow-md transition-all text-left group shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-gray-400 group-hover:text-brand-blue group-hover:bg-blue-50 transition-colors">
                        <Shield size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">{store.t('srv.certificates')}</h3>
                    <p className="text-sm text-gray-400 font-bold">Request proof of account / funds</p>
                </button>

                {/* Limits */}
                <button onClick={() => handleRequest(store.t('srv.limits'))} className="p-8 bg-white border border-gray-100 rounded-[30px] hover:shadow-md transition-all text-left group shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-gray-400 group-hover:text-brand-blue group-hover:bg-blue-50 transition-colors">
                        <SettingsIcon size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">{store.t('srv.limits')}</h3>
                    <p className="text-sm text-gray-400 font-bold">Adjust transfer and withdrawal limits</p>
                </button>

                {/* Stop Card */}
                <button onClick={() => window.location.hash = '#/cards'} className="p-8 bg-white border border-gray-100 rounded-[30px] hover:shadow-md transition-all text-left group shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 text-red-400 group-hover:bg-red-100 transition-colors">
                        <AlertOctagon size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-brand-navy mb-2 group-hover:text-red-500 transition-colors">{store.t('srv.stop_card')}</h3>
                    <p className="text-sm text-gray-400 font-bold">Block lost or stolen cards</p>
                </button>

                {/* Beneficiaries */}
                <button onClick={() => window.location.hash = '#/transfers'} className="p-8 bg-white border border-gray-100 rounded-[30px] hover:shadow-md transition-all text-left group shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-gray-400 group-hover:text-brand-blue group-hover:bg-blue-50 transition-colors">
                        <Users size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">{store.t('srv.beneficiaries')}</h3>
                    <p className="text-sm text-gray-400 font-bold">Add or remove transfer contacts</p>
                </button>
            </div>
        </div>
    );
};
