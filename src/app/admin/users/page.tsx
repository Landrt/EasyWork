'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  getAdminUsersList, 
  getAdminUserDetail, 
  updateUserStatusOrPlan 
} from '@/utils/actions/admin/actions';
import { AdminUserListItem, AdminUserDetail } from '@/lib/admin-types';
import { SubscriptionPlanType } from '@/lib/types';
import { 
  Search, 
  CheckCircle2, 
  X, 
  FileText, 
  CreditCard, 
  ArrowUpRight, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal Fiche Utilisateur
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [planFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsersList({
        query: searchQuery,
        plan: planFilter,
        status: statusFilter,
      });
      setUsers(data);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors du chargement des utilisateurs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const openUserDetail = async (userId: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await getAdminUserDetail(userId);
      setSelectedUser(detail);
    } catch {
      toast.error('Impossible de charger la fiche utilisateur.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
    try {
      await updateUserStatusOrPlan(selectedUser.id, { status: newStatus });
      setSelectedUser({ ...selectedUser, status: newStatus });
      toast.success(`Compte utilisateur ${newStatus === 'suspended' ? 'suspendu' : 'réactivé'}.`);
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la mise à jour du statut.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlan = async (newPlan: SubscriptionPlanType) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await updateUserStatusOrPlan(selectedUser.id, { plan: newPlan });
      setSelectedUser({ ...selectedUser, plan: newPlan });
      toast.success(`Formule mise à jour vers [${newPlan}].`);
      fetchUsers();
    } catch {
      toast.error('Erreur lors du changement de formule.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <AdminHeader 
        title="Gestion des Utilisateurs" 
        subtitle="Données réelles des profils Supabase, plans souscrits et actions directes."
      />

      <div className="p-8 space-y-6">
        {/* Barre de Recherche et Filtres */}
        <Card className="bg-white border-[#E5E1D8] p-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7A776D]" />
                <Input
                  placeholder="Rechercher par nom, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] pl-9 text-xs h-9 focus:border-[#C9A96E]"
                />
              </div>
              <Button type="submit" className="bg-[#1C1B18] hover:bg-[#2E2C27] text-white text-xs h-9 px-4">
                Filtrer
              </Button>
            </form>

            {/* Filtres par Plan */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <div className="flex items-center gap-1 bg-[#f5f3ef] p-1 rounded border border-[#E5E1D8] text-xs">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'free', label: 'Découverte' },
                  { id: 'sprint', label: 'Sprint 14j' },
                  { id: 'monthly', label: 'Mensuel' },
                  { id: 'lifetime', label: 'Fondateur' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPlanFilter(tab.id)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap text-xs ${
                      planFilter === tab.id
                        ? 'bg-white text-[#1C1B18] shadow-xs font-semibold'
                        : 'text-[#7A776D] hover:text-[#1C1B18]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filtre Statut */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E5E1D8] text-[#1C1B18] text-xs h-9 rounded px-2.5 outline-none"
              >
                <option value="all">Tous statuts</option>
                <option value="active">Actifs</option>
                <option value="suspended">Suspendus</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Tableau des Utilisateurs */}
        <Card className="bg-white border-[#E5E1D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f3ef] text-[#494740] uppercase tracking-wider border-b border-[#E5E1D8] text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Utilisateur</th>
                  <th className="py-3 px-4 font-semibold">Formule</th>
                  <th className="py-3 px-4 font-semibold">Statut</th>
                  <th className="py-3 px-4 font-semibold">Inscription</th>
                  <th className="py-3 px-4 font-semibold">Échéance</th>
                  <th className="py-3 px-4 font-semibold">CVs</th>
                  <th className="py-3 px-4 font-semibold">Dépenses</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8] text-[#1C1B18]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#7A776D]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#C9A96E]" />
                        <span>Chargement des données en direct...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#7A776D]">
                      Aucun utilisateur trouvé en base de données.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#fbf9f5] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1C1B18]">{u.name}</div>
                        <div className="text-[11px] text-[#7A776D]">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.plan === 'sprint' ? 'bg-[#C9A96E]/15 text-[#9E824C] border border-[#C9A96E]/30' :
                          u.plan === 'lifetime' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          u.plan === 'monthly' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-[#efeeea] text-[#494740]'
                        }`}>
                          {u.plan === 'sprint' ? 'Sprint 14j' :
                           u.plan === 'lifetime' ? 'Fondateur' :
                           u.plan === 'monthly' ? 'Recherche Active' : 'Découverte (0€)'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          u.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {u.status === 'active' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#7A776D]">
                        {u.createdAt}
                      </td>
                      <td className="py-3 px-4 text-[#7A776D]">
                        {u.periodEnd || '—'}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1C1B18]">
                        {u.resumesCount}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1C1B18]">
                        {u.totalSpent} €
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => openUserDetail(u.id)}
                          className="bg-white hover:bg-[#efeeea] text-[#1C1B18] border border-[#E5E1D8] text-xs h-7 px-2.5 shadow-xs"
                        >
                          Fiche 360°
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Fiche Utilisateur 360° */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="bg-white border-[#E5E1D8] text-[#1C1B18] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E5E1D8]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-lg text-[#1C1B18]">{selectedUser.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    selectedUser.plan === 'sprint' ? 'bg-[#C9A96E]/15 text-[#9E824C]' :
                    selectedUser.plan === 'lifetime' ? 'bg-amber-100 text-amber-800' :
                    selectedUser.plan === 'monthly' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-[#efeeea] text-[#494740]'
                  }`}>
                    {selectedUser.plan.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#7A776D] mt-0.5">{selectedUser.email} • ID: {selectedUser.id}</p>
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="text-[#7A776D] hover:text-[#1C1B18] p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="py-4 space-y-6">
              {/* Informations Générales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#fbf9f5] p-3 rounded border border-[#E5E1D8]">
                  <span className="text-[10px] text-[#7A776D] uppercase font-semibold">Statut Compte</span>
                  <div className="text-xs font-bold text-[#1C1B18] mt-1 capitalize">{selectedUser.status}</div>
                </div>
                <div className="bg-[#fbf9f5] p-3 rounded border border-[#E5E1D8]">
                  <span className="text-[10px] text-[#7A776D] uppercase font-semibold">Dépenses Totales</span>
                  <div className="text-xs font-bold text-[#9E824C] mt-1">{selectedUser.totalSpent} €</div>
                </div>
                <div className="bg-[#fbf9f5] p-3 rounded border border-[#E5E1D8]">
                  <span className="text-[10px] text-[#7A776D] uppercase font-semibold">CVs en Base</span>
                  <div className="text-xs font-bold text-[#1C1B18] mt-1">{selectedUser.resumesCount} créés</div>
                </div>
                <div className="bg-[#fbf9f5] p-3 rounded border border-[#E5E1D8]">
                  <span className="text-[10px] text-[#7A776D] uppercase font-semibold">Inscription</span>
                  <div className="text-xs font-bold text-[#1C1B18] mt-1">{selectedUser.createdAt}</div>
                </div>
              </div>

              {/* CVs du Candidat */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#494740] mb-2">
                  CVs & Candidatures ({selectedUser.resumes.length})
                </h3>
                {selectedUser.resumes.length === 0 ? (
                  <p className="text-xs text-[#7A776D] italic">Aucun CV créé pour le moment.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.resumes.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2.5 rounded bg-[#fbf9f5] border border-[#E5E1D8] text-xs">
                        <div>
                          <div className="font-semibold text-[#1C1B18]">{r.title}</div>
                          <div className="text-[11px] text-[#7A776D]">{r.targetRole}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-600">
                            {r.atsScore ? `${r.atsScore}/100 ATS` : 'Non scoré'}
                          </span>
                          <div className="text-[10px] text-[#7A776D]">{r.updatedAt}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Administratives */}
              <div className="p-4 rounded bg-[#fbf9f5] border border-[#E5E1D8] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1B18]">
                  Actions Directes Super-Admin
                </h3>

                <div className="flex flex-wrap gap-2">
                  {/* Changer de formule */}
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleChangePlan(selectedUser.plan === 'sprint' ? 'free' : 'sprint')}
                    className="bg-[#C9A96E] hover:bg-[#B39358] text-[#1C1B18] text-xs h-8"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    {selectedUser.plan === 'sprint' ? 'Rétrograder Découverte' : 'Surclasser Sprint 14j'}
                  </Button>

                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleChangePlan('lifetime')}
                    className="bg-white hover:bg-[#efeeea] text-[#1C1B18] border border-[#E5E1D8] text-xs h-8"
                  >
                    Offrir Membre Fondateur
                  </Button>

                  {/* Suspendre / Réactiver */}
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={handleToggleSuspend}
                    variant="outline"
                    className={`text-xs h-8 ${
                      selectedUser.status === 'active'
                        ? 'border-red-300 text-red-600 hover:bg-red-50'
                        : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {selectedUser.status === 'active' ? 'Suspendre l\'accès' : 'Réactiver l\'accès'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-[#E5E1D8] flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="border-[#E5E1D8] text-[#494740] hover:text-[#1C1B18] text-xs h-8"
              >
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
