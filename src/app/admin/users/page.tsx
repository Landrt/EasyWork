"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface UserItem {
  user_id: string;
  headline: string | null;
  plan_name: string;
  is_suspended: boolean;
  cv_count: number;
  total_spent: number;
  created_at: string | null;
}

interface UserDetail {
  user_id: string;
  headline: string | null;
  professional_summary: string | null;
  is_suspended: boolean;
  plan_name: string;
  plan_status: string;
  plan_expires_at: string | null;
  cvs: Array<{ id: number; title: string; created_at: string | null; status: string }>;
  payments: Array<{
    id: number;
    amount: number;
    currency: string;
    provider: string;
    provider_payment_id: string;
    status: string;
    created_at: string | null;
  }>;
  ai_usage_summary: {
    total_calls: number;
    estimated_cost: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [planFilter, setPlanFilter] = useState(initialPlan);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Detail Modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Action Inputs
  const [newTier, setNewTier] = useState("FREE");
  const [refundAmount, setRefundAmount] = useState("19.00");
  const [refundReason, setRefundReason] = useState("Demande client sous 14 jours");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (planFilter !== "ALL") params.set("plan", planFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur de chargement des utilisateurs");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [planFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const openUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`);
      if (!res.ok) throw new Error("Détail utilisateur introuvable");
      const json = await res.json();
      setDetail(json);
      setNewTier(json.plan_name || "FREE");
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (!detail) return;
    const newStatus = !detail.is_suspended;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${detail.user_id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: newStatus, reason: "Action administrateur" })
      });
      const data = await res.json();
      setDetail({ ...detail, is_suspended: data.is_suspended });
      setActionMessage(data.message);
      fetchUsers();
    } catch (err: any) {
      setActionMessage(`Erreur : ${err.message}`);
    }
  };

  const handleChangeTier = async () => {
    if (!detail) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${detail.user_id}/change-tier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_tier: newTier })
      });
      const data = await res.json();
      setDetail({ ...detail, plan_name: data.plan_name });
      setActionMessage(data.message);
      fetchUsers();
    } catch (err: any) {
      setActionMessage(`Erreur : ${err.message}`);
    }
  };

  const handleRefund = async () => {
    if (!detail) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${detail.user_id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(refundAmount), reason: refundReason })
      });
      const data = await res.json();
      setActionMessage(data.message);
      openUserDetail(detail.user_id);
      fetchUsers();
    } catch (err: any) {
      setActionMessage(`Erreur : ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline-md tracking-tight text-ink">Gestion des Utilisateurs</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Consultez les fiches détaillées, modifiez manuellement les paliers, suspendez ou remboursez des comptes.
          </p>
        </div>
        <div className="text-xs text-on-surface-variant">
          Total affichés : <strong className="text-ink">{users.length}</strong>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-white border border-parchment-border shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Rechercher par ID ou intitulé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-parchment-border rounded-lg text-ink focus:outline-none focus:border-ink"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-ink text-white rounded-lg text-xs font-semibold hover:opacity-90 transition">
            Rechercher
          </button>
        </form>

        <div className="flex items-center gap-3">
          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-on-surface-variant">Palier :</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-parchment-border rounded-lg px-2.5 py-1.5 text-xs text-ink focus:outline-none"
            >
              <option value="ALL">Tous les paliers</option>
              <option value="FREE">FREE</option>
              <option value="SPRINT">SPRINT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="FOUNDER">FOUNDER</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-on-surface-variant">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-parchment-border rounded-lg px-2.5 py-1.5 text-xs text-ink focus:outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-white border border-parchment-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-parchment-border text-on-surface-variant font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Identifiant Utilisateur</th>
                <th className="py-3.5 px-4">Profil / Métier</th>
                <th className="py-3.5 px-4">Palier</th>
                <th className="py-3.5 px-4 text-center">CVs</th>
                <th className="py-3.5 px-4">Total Payé</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border text-ink">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-xl inline-block align-middle mr-2">progress_activity</span>
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    Aucun utilisateur ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-xs">
                      {u.user_id}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {u.headline || "Non renseigné"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.plan_name === "FOUNDER" ? "bg-[#FBF0D9] text-[#8C6D1F] border border-[#E8CA7C]" :
                        u.plan_name === "ACTIVE" || u.plan_name === "SPRINT" ? "bg-[#EBF5EF] text-success-green border border-[#CDE5D6]" :
                        "bg-surface-container text-on-surface-variant"
                      }`}>
                        {u.plan_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold">
                      {u.cv_count}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {u.total_spent > 0 ? `${u.total_spent.toFixed(2)} €` : "0.00 €"}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.is_suspended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-error font-semibold bg-[#FDF2F2] px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Suspendu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-success-green font-medium bg-[#EBF5EF] px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-success-green"></span> Actif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openUserDetail(u.user_id)}
                        className="px-3 py-1.5 rounded-lg border border-parchment-border hover:border-ink text-ink font-semibold text-xs transition"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Slide-Over Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-parchment-border flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Fiche Détail Utilisateur</span>
                <h2 className="text-lg font-bold font-headline-md text-ink mt-0.5 truncate max-w-sm">
                  {selectedUserId}
                </h2>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-2 rounded-lg text-on-surface-variant hover:text-ink hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail || !detail ? (
                <div className="py-20 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                  <p className="text-xs mt-2">Chargement des données du compte...</p>
                </div>
              ) : (
                <>
                  {actionMessage && (
                    <div className="p-3.5 rounded-lg bg-[#EBF5EF] border border-[#CDE5D6] text-success-green text-xs font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>{actionMessage}</span>
                    </div>
                  )}

                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    detail.is_suspended ? "bg-[#FDF2F2] border-[#F8D7DA]" : "bg-[#FAF8F5] border-parchment-border"
                  }`}>
                    <div>
                      <span className="text-xs font-semibold text-ink">
                        Statut du compte : {detail.is_suspended ? "SUSPENDU" : "ACTIF"}
                      </span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Palier actuel : <strong>{detail.plan_name}</strong> ({detail.plan_status})
                      </p>
                    </div>
                    <button
                      onClick={handleToggleSuspend}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        detail.is_suspended 
                          ? "bg-success-green text-white hover:opacity-90"
                          : "bg-error text-white hover:opacity-90"
                      }`}
                    >
                      {detail.is_suspended ? "Réactiver le compte" : "Suspendre le compte"}
                    </button>
                  </div>

                  {/* Action 1: Changer de palier manuellement */}
                  <div className="p-4 rounded-xl border border-parchment-border bg-white space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">stars</span>
                      Changer de palier manuellement
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">
                      Permet d'attribuer un accès Fondateur ou un pass Sprint pour le support client.
                    </p>
                    <div className="flex items-center gap-2">
                      <select
                        value={newTier}
                        onChange={(e) => setNewTier(e.target.value)}
                        className="flex-1 bg-[#FAF8F5] border border-parchment-border rounded-lg px-3 py-2 text-xs text-ink focus:outline-none"
                      >
                        <option value="FREE">FREE (Gratuit)</option>
                        <option value="SPRINT">SPRINT (Pass 14 jours)</option>
                        <option value="ACTIVE">ACTIVE (Recherche Active Mensuelle)</option>
                        <option value="FOUNDER">FOUNDER (Accès Fondateur à vie)</option>
                      </select>
                      <button
                        onClick={handleChangeTier}
                        className="px-4 py-2 bg-ink text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>

                  {/* Action 2: Rembourser un paiement */}
                  <div className="p-4 rounded-xl border border-parchment-border bg-white space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">undo</span>
                      Émettre un remboursement
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Montant (€)"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="bg-[#FAF8F5] border border-parchment-border rounded-lg px-3 py-2 text-xs text-ink focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Motif"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="bg-[#FAF8F5] border border-parchment-border rounded-lg px-3 py-2 text-xs text-ink focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleRefund}
                      className="w-full py-2 bg-error text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
                    >
                      Enregistrer le remboursement
                    </button>
                  </div>

                  {/* CVs List */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink">CVs de l'utilisateur ({detail.cvs.length})</h3>
                    {detail.cvs.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic">Aucun CV créé pour l'instant.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {detail.cvs.map((c) => (
                          <div key={c.id} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-parchment-border flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span className="material-symbols-outlined text-[16px] text-clay-accent">description</span>
                              <span className="font-medium text-ink truncate">{c.title || "Sans titre"}</span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant shrink-0">{c.created_at}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payments History */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Historique des Transactions ({detail.payments.length})</h3>
                    {detail.payments.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic">Aucune transaction enregistrée.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {detail.payments.map((p) => (
                          <div key={p.id} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-parchment-border flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-ink">{p.amount.toFixed(2)} {p.currency}</span>
                              <span className="text-[10px] text-on-surface-variant ml-2">via {p.provider} ({p.provider_payment_id})</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              p.status === "succeeded" ? "bg-[#EBF5EF] text-success-green" : "bg-[#FDF2F2] text-error"
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Usage */}
                  <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-parchment-border text-xs flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-ink">Consommation IA totale</span>
                      <p className="text-[11px] text-on-surface-variant">{detail.ai_usage_summary.total_calls} requêtes ATS & suggestions</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-ink">{detail.ai_usage_summary.estimated_cost} €</span>
                      <p className="text-[10px] text-on-surface-variant">Coût estimé</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-2xl mr-2">progress_activity</span>
        <span className="text-xs">Chargement de la gestion utilisateurs...</span>
      </div>
    }>
      <AdminUsersContent />
    </Suspense>
  );
}
