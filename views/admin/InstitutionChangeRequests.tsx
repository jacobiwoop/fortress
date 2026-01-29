import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { InstitutionChangeRequest } from '../../types';
import { Building2, Check, X } from 'lucide-react';

export const InstitutionChangeRequests: React.FC = () => {
  const [requests, setRequests] = useState<InstitutionChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminReason, setAdminReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await store.getInstitutionChangeRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await store.approveInstitutionChange(requestId, adminReason);
      await fetchRequests();
      setSelectedRequest(null);
      setAdminReason('');
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await store.rejectInstitutionChange(requestId, adminReason || 'Demande refusée');
      await fetchRequests();
      setSelectedRequest(null);
      setAdminReason('');
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const processedRequests = requests.filter(r => r.status !== 'PENDING');

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Demandes de changement d'institution</h2>
        <p className="text-zinc-400">Approuver ou rejeter les demandes des utilisateurs</p>
      </div>

      {/* Pending Requests */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          En attente ({pendingRequests.length})
        </h3>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
            Aucune demande en attente
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{request.userName}</h4>
                      <p className="text-sm text-zinc-500">
                        {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400">
                    EN ATTENTE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-zinc-500">Institution actuelle</p>
                    <p className="text-white font-medium">{request.currentInstitution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Institution demandée</p>
                    <p className="text-white font-medium">{request.requestedInstitution}</p>
                  </div>
                </div>

                {selectedRequest === request.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={adminReason}
                      onChange={(e) => setAdminReason(e.target.value)}
                      placeholder="Raison (optionnel pour approbation, requis pour rejet)"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={16} />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        Rejeter
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(null);
                          setAdminReason('');
                        }}
                        className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedRequest(request.id)}
                    className="w-full px-4 py-2 bg-brand-yellow text-black font-medium rounded hover:bg-yellow-400 transition-colors"
                  >
                    Traiter la demande
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Historique ({processedRequests.length})
          </h3>
          <div className="space-y-4">
            {processedRequests.map((request) => (
              <div
                key={request.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{request.userName}</h4>
                      <p className="text-sm text-zinc-500">
                        {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'APPROVED'
                        ? 'bg-emerald-900/20 text-emerald-400'
                        : 'bg-red-900/20 text-red-400'
                    }`}
                  >
                    {request.status === 'APPROVED' ? 'APPROUVÉ' : 'REJETÉ'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">Institution actuelle</p>
                    <p className="text-white font-medium">{request.currentInstitution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Institution demandée</p>
                    <p className="text-white font-medium">{request.requestedInstitution}</p>
                  </div>
                </div>

                {request.adminReason && (
                  <div className="mt-4 p-3 bg-zinc-950 rounded border border-zinc-800">
                    <p className="text-sm text-zinc-500 mb-1">Raison</p>
                    <p className="text-white text-sm">{request.adminReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
