"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface PlanItem {
  id: number;
  name: string;
  display_name: string;
  price: number;
  currency: string;
  is_recurring: boolean;
  duration_days: number | null;
  max_slots: number | null;
  slots_taken: number;
  slots_remaining: number | null;
  active_subscriptions: number;
  type: string;
}

interface ExpiringSprint {
  subscription_id: number;
  user_id: string;
  expires_at: string | null;
  days_left: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [expiringSprints, setExpiringSprints] = useState<ExpiringSprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit Plan Modal
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editDisplayName, setEditDisplayName] = useState<string>("");
  const [editMaxSlots, setEditMaxSlots] = useState<string>("");
  const [editSlotsTaken, setEditSlotsTaken] = useState<string>("");

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/subscriptions`);
      if (!res.ok) throw new Error("Erreur de chargement des abonnements");
      const json = await res.json();
      setPlans(json.plans || []);
      setExpiringSprints(json.expiring_sprints || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const openEditModal = (p: PlanItem) => {
    setEditingPlan(p);
    setEditPrice(String(p.price));
    setEditDisplayName(p.display_name);
    setEditMaxSlots(p.max_slots !== null ? String(p.max_slots) : "");
    setEditSlotsTaken(String(p.slots_taken));
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    try {
      const payload: any = {
        price: parseFloat(editPrice) || 0.0,
        display_name: editDisplayName
      };
      if (editingPlan.name === "FOUNDER") {
        if (editMaxSlots) payload.max_slots = parseInt(editMaxSlots);
        if (editSlotsTaken) payload.slots_taken = parseInt(editSlotsTaken);
      }

      const res = await fetch(`${API_BASE}/admin/subscriptions/${editingPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setActionNotice(data.message || "Plan mis à jour avec succès");
      setEditingPlan(null);
      fetchSubs();
    } catch (err: any) {
      setActionNotice(`Erreur : ${err.message}`);
    }
  };

  const founderPlan = plans.find((p) => p.name === "FOUNDER");
  const activePlan = plans.find((p) => p.name === "ACTIVE");
  const sprintPlan = plans.find((p) => p.name === "SPRINT");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline-md tracking-tight text-ink">Abonnements & Paliers Tarifaires</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Supervision et paramétrage des offres SaaS, distinction Sprint (14 jours) vs Recherche Active (récurrent), et gestion des quotas de places Fondateur.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="px-3.5 py-2 rounded-lg border border-parchment-border hover:border-ink text-ink text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>Gérer les abonnés</span>
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-lg bg-[#EBF5EF] border border-[#CDE5D6] text-success-green text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-on-surface-variant hover:text-ink">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Founder Quota Spotlight Card */}
      {founderPlan && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#181714] to-[#2B271F] text-[#E5E1D8] border border-[#3D3A34] shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-[#E8CA7C] text-[20px]">stars</span>
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#E8CA7C]">
                  Offre Spéciale Lancement — Accès Fondateur à Vie
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white font-headline-md">
                {founderPlan.slots_remaining !== null 
                  ? `${founderPlan.slots_remaining} places disponibles sur ${founderPlan.max_slots}` 
                  : "Quota illimité"}
              </h2>
              <p className="text-xs text-[#A39E93] mt-1.5">
                Places attribuées : <strong className="text-white">{founderPlan.slots_taken}</strong> | Tarif fixe unique : <strong className="text-[#E8CA7C]">{founderPlan.price} {founderPlan.currency}</strong> (aucun prélèvement récurrent)
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-3xl font-display-md font-bold text-[#E8CA7C]">
                  {founderPlan.slots_remaining ?? 0}
                </span>
                <span className="text-[11px] block text-[#A39E93] uppercase font-semibold">Places restantes</span>
              </div>
              <button
                onClick={() => openEditModal(founderPlan)}
                className="px-4 py-2 rounded-lg bg-[#3D3A34] hover:bg-[#4E4B43] text-white text-xs font-semibold transition border border-[#5A554A] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Ajuster quota</span>
              </button>
            </div>
          </div>

          {/* Quota Progress Bar */}
          {founderPlan.max_slots && (
            <div className="mt-6 pt-5 border-t border-[#3D3A34]/80">
              <div className="w-full bg-[#100F0D] rounded-full h-3.5 p-0.5 overflow-hidden border border-[#3D3A34]">
                <div
                  className="bg-gradient-to-r from-[#C9A96E] to-[#E8CA7C] h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(100, (founderPlan.slots_taken / founderPlan.max_slots) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-[#A39E93] mt-2 font-medium">
                <span>{founderPlan.slots_taken} place(s) vendue(s)</span>
                <span className="text-[#E8CA7C] font-semibold">{((founderPlan.slots_taken / founderPlan.max_slots) * 100).toFixed(1)}% du quota atteint</span>
                <span>Plafond : {founderPlan.max_slots} places</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of the 4 Tiers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-clay-accent">tune</span>
            Paliers Tarifaires & Configuration Active
          </h2>
          <span className="text-xs text-on-surface-variant">4 formules configurées</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            <div className="col-span-4 py-12 text-center text-on-surface-variant text-xs">
              <span className="material-symbols-outlined animate-spin text-xl inline-block align-middle mr-2">progress_activity</span>
              Chargement des paliers...
            </div>
          ) : (
            plans.map((p) => {
              const isSprint = p.name === "SPRINT" || p.duration_days === 14;
              const isActive = p.name === "ACTIVE" || p.is_recurring;
              const isFounder = p.name === "FOUNDER";
              const isFree = p.name === "FREE";

              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-xl bg-white border shadow-xs flex flex-col justify-between transition-all ${
                    isFounder ? "border-[#E8CA7C] hover:border-[#C9A96E]" :
                    isActive ? "border-[#CDE5D6] hover:border-success-green" :
                    isSprint ? "border-[#F0E6D2] hover:border-[#8C6D1F]" :
                    "border-parchment-border hover:border-ink"
                  }`}
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-ink block">{p.name}</span>
                        <span className="text-[11px] text-on-surface-variant">{p.display_name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isActive ? "bg-[#EBF5EF] text-success-green border border-[#CDE5D6]" :
                        isSprint ? "bg-[#FFF8E6] text-[#8C6D1F] border border-[#E8CA7C]" :
                        isFounder ? "bg-[#FBF0D9] text-[#8C6D1F] border border-[#E8CA7C]" :
                        "bg-surface-container text-on-surface-variant"
                      }`}>
                        {p.type}
                      </span>
                    </div>

                    {/* Price Display */}
                    <div className="my-4">
                      <span className="text-3xl font-bold font-display-md text-ink">{p.price.toFixed(2)} €</span>
                      <span className="text-xs text-on-surface-variant ml-1.5 font-medium">
                        {p.is_recurring ? "/ mois" : (p.duration_days ? `pour ${p.duration_days} jours` : (isFree ? "pour toujours" : "accès à vie"))}
                      </span>
                    </div>

                    {/* Badge Description */}
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      {isFree && "Accès de découverte, génération de CV de base et quotas limités."}
                      {isSprint && "Pass intensif de 14 jours non récurrent, idéal pour une candidature ciblée sans engagement."}
                      {isActive && "Formule récurrente mensuelle pour candidats en recherche active d'opportunités."}
                      {isFounder && "Offre exclusive des 200 premiers inscrits avec accès à vie et mises à jour incluses."}
                    </p>
                  </div>

                  {/* Footer Card */}
                  <div className="mt-6 pt-4 border-t border-parchment-border space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">Abonnés actifs :</span>
                      <strong className="text-ink font-bold">{p.active_subscriptions}</strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">Facturation :</span>
                      <span className="font-semibold text-ink">
                        {p.is_recurring ? "Récurrente auto" : (p.duration_days ? "Expire à 14j" : "Paiement unique")}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-parchment-border/60">
                      <Link
                        href={`/admin/users?plan=${p.name}`}
                        className="text-[11px] font-semibold text-ink hover:underline flex items-center gap-0.5"
                      >
                        <span>Voir abonnés</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-2.5 py-1 rounded border border-parchment-border hover:border-ink text-ink text-[11px] font-semibold transition"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sprints Expiring Soon Table */}
      <div className="rounded-xl bg-white border border-parchment-border shadow-xs overflow-hidden">
        <div className="p-5 border-b border-parchment-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#8C6D1F] text-[20px]">timer</span>
              <h2 className="text-base font-bold text-ink">Pass Sprint — Échéances et Expirations (14 jours)</h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Les abonnements Sprint s'arrêtent automatiquement au terme des 14 jours sans renouvellement automatique.
            </p>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-parchment-border">
            {expiringSprints.length} pass actif(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-parchment-border text-on-surface-variant font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Utilisateur</th>
                <th className="py-3.5 px-4">Date d'Expiration</th>
                <th className="py-3.5 px-4 text-center">Temps Restant</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border text-ink">
              {expiringSprints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-clay-accent text-3xl mb-1 block">hourglass_empty</span>
                    Aucun pass Sprint actif arrivant à expiration pour le moment.
                  </td>
                </tr>
              ) : (
                expiringSprints.map((s) => {
                  const isUrgent = s.days_left <= 2;
                  return (
                    <tr key={s.subscription_id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium">{s.user_id}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                        {s.expires_at 
                          ? `${new Date(s.expires_at).toLocaleDateString()} à ${new Date(s.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                          isUrgent ? "bg-[#FDF2F2] text-error border border-[#F8D7DA]" : "bg-[#FFF8E6] text-[#8C6D1F] border border-[#E8CA7C]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUrgent ? "bg-error animate-ping" : "bg-[#8C6D1F]"}`}></span>
                          {s.days_left === 0 ? "Expire aujourd'hui" : `${s.days_left} jour(s) restant(s)`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FFF8E6] text-[#8C6D1F]">
                          Pass Actif
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/users?search=${s.user_id}`}
                          className="px-2.5 py-1 rounded border border-parchment-border hover:border-ink text-ink font-semibold text-[11px] transition"
                        >
                          Voir fiche
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h3 className="text-base font-bold text-ink">Modifier le palier {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-on-surface-variant hover:text-ink">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Nom d'affichage :</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-parchment-border rounded-lg text-ink focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Tarif (€) :</label>
                <input
                  type="number"
                  step="0.5"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-parchment-border rounded-lg text-ink focus:outline-none focus:border-ink"
                />
              </div>

              {editingPlan.name === "FOUNDER" && (
                <>
                  <div>
                    <label className="font-semibold text-ink block mb-1">Plafond Maximum de places (max_slots) :</label>
                    <input
                      type="number"
                      value={editMaxSlots}
                      onChange={(e) => setEditMaxSlots(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-parchment-border rounded-lg text-ink focus:outline-none focus:border-ink"
                    />
                    <p className="text-[10px] text-on-surface-variant mt-1">Exemple : 200 places au total pour le lancement.</p>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-parchment-border">
                    <span className="text-[11px] text-on-surface-variant block">Places attribuées réelles :</span>
                    <span className="font-bold text-sm text-ink">{editingPlan.slots_taken} compte(s)</span>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Calculé automatiquement selon les abonnements réels en base de données.</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-parchment-border">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-lg border border-parchment-border text-xs font-medium text-ink hover:bg-surface-container"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-2 rounded-lg bg-ink text-white text-xs font-semibold hover:opacity-90 transition"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
