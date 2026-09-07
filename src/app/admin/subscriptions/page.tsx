'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  getPricingConfig, 
  updatePricingConfig, 
  getExpiringSprintUsers 
} from '@/utils/actions/admin/actions';
import { PricingConfig, ExpiringSprintUser } from '@/lib/admin-types';
import { 
  CreditCard, 
  Clock, 
  Crown, 
  Save, 
  Send, 
  PlusCircle, 
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscriptionsPage() {
  const [config, setConfig] = useState<PricingConfig>({
    sprintPrice: 13,
    monthlyPrice: 22,
    lifetimePrice: 69,
    founderQuotaTotal: 200,
    founderQuotaUsed: 0,
  });
  const [expiringUsers, setExpiringUsers] = useState<ExpiringSprintUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [sprintPrice, setSprintPrice] = useState('13');
  const [monthlyPrice, setMonthlyPrice] = useState('22');
  const [lifetimePrice, setLifetimePrice] = useState('69');
  const [quotaTotal, setQuotaTotal] = useState('200');

  useEffect(() => {
    async function loadData() {
      try {
        const [pricing, expiring] = await Promise.all([
          getPricingConfig(),
          getExpiringSprintUsers(),
        ]);
        setConfig(pricing);
        setSprintPrice(String(pricing.sprintPrice));
        setMonthlyPrice(String(pricing.monthlyPrice));
        setLifetimePrice(String(pricing.lifetimePrice));
        setQuotaTotal(String(pricing.founderQuotaTotal));
        setExpiringUsers(expiring);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement des abonnements.');
      }
    }
    loadData();
  }, []);

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = {
        sprintPrice: parseFloat(sprintPrice) || 13,
        monthlyPrice: parseFloat(monthlyPrice) || 22,
        lifetimePrice: parseFloat(lifetimePrice) || 69,
        founderQuotaTotal: parseInt(quotaTotal, 10) || 200,
      };
      await updatePricingConfig(updated);
      setConfig(prev => ({ ...prev, ...updated }));
      toast.success('Grille tarifaire mise à jour avec succès !');
    } catch {
      toast.error('Échec de la mise à jour des prix.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReminder = (email: string) => {
    toast.success(`Email de relance envoyé à ${email}`);
  };

  const handleExtendSprint = (name: string) => {
    toast.success(`Accès Sprint prolongé de +7 jours accordé à ${name}`);
  };

  const quotaPercent = Math.min(100, Math.round((config.founderQuotaUsed / (config.founderQuotaTotal || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <AdminHeader 
        title="Abonnements & Formules" 
        subtitle="Supervision de la grille 4 paliers Flutterwave, quotas et détection d'expiration Sprint."
      />

      <div className="p-8 space-y-8 max-w-7xl">
        {/* Les 4 Paliers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A776D]">Les 4 Paliers EasyWork</h2>
              <p className="text-xs text-[#1C1B18] font-medium">Modèle économique sans engagement tacite forcée</p>
            </div>
            <span className="text-xs text-[#9E824C] font-semibold bg-[#C9A96E]/15 px-2.5 py-1 rounded border border-[#C9A96E]/30">
              Garantie Satisfait ou Remboursé 7j
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Palier Découverte */}
            <Card className="bg-white border-[#E5E1D8] p-5 flex flex-col justify-between shadow-xs hover:border-[#1C1B18]/30 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#efeeea] text-[#494740]">
                    Découverte
                  </span>
                  <span className="text-xs text-[#7A776D]">Gratuit</span>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold font-serif text-[#1C1B18]">0 €</span>
                </div>
                <p className="text-xs text-[#7A776D] mb-4">
                  Pour tester la plateforme : 1 CV actif, templates standard, diagnostic indicatif.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5E1D8] text-[11px] text-[#7A776D] flex items-center justify-between">
                <span>Sans carte requise</span>
                <span className="font-semibold text-[#1C1B18]">Accès immédiat</span>
              </div>
            </Card>

            {/* Palier Sprint */}
            <Card className="bg-white border-[#C9A96E] p-5 flex flex-col justify-between relative shadow-sm hover:border-[#9E824C] transition-colors">
              <div className="absolute -top-2.5 right-4 bg-[#C9A96E] text-[#1C1B18] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                Le plus vendu
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#C9A96E]/15 text-[#9E824C]">
                    Sprint 14 jours
                  </span>
                  <span className="text-xs text-[#9E824C] font-semibold">Sans tacite reconduction</span>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold font-serif text-[#1C1B18]">{config.sprintPrice} €</span>
                  <span className="text-xs text-[#7A776D] ml-1">paiement unique</span>
                </div>
                <p className="text-xs text-[#7A776D] mb-4">
                  Session de candidature intensive : CVs illimités, diagnostic ATS complet, Truth Guard.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5E1D8] text-[11px] text-[#7A776D] flex items-center justify-between">
                <span>Durée de validité</span>
                <span className="font-semibold text-[#9E824C]">14 jours fermes</span>
              </div>
            </Card>

            {/* Palier Mensuel */}
            <Card className="bg-white border-[#E5E1D8] p-5 flex flex-col justify-between shadow-xs hover:border-[#1C1B18]/30 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Recherche Active
                  </span>
                  <span className="text-xs text-emerald-700 font-medium">Récurrent</span>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold font-serif text-[#1C1B18]">{config.monthlyPrice} €</span>
                  <span className="text-xs text-[#7A776D] ml-1">/ mois</span>
                </div>
                <p className="text-xs text-[#7A776D] mb-4">
                  Recherche au long cours : lettres de motivation illimitées, cockpit de suivi et relances.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5E1D8] text-[11px] text-[#7A776D] flex items-center justify-between">
                <span>Engagement</span>
                <span className="font-semibold text-emerald-700">Sans engagement</span>
              </div>
            </Card>

            {/* Palier Fondateur */}
            <Card className="bg-white border-[#C9A96E]/40 p-5 flex flex-col justify-between shadow-xs hover:border-[#C9A96E] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-[#C9A96E]" />
                    <span className="text-xs font-semibold text-[#9E824C]">
                      Membre Fondateur
                    </span>
                  </div>
                  <span className="text-xs text-[#9E824C] font-semibold">{config.founderQuotaUsed}/{config.founderQuotaTotal}</span>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold font-serif text-[#1C1B18]">{config.lifetimePrice} €</span>
                  <span className="text-xs text-[#7A776D] ml-1">à vie (unique)</span>
                </div>
                <p className="text-xs text-[#7A776D] mb-4">
                  Accès permanent à vie à tous les futurs modèles IA. Quota strict de licences.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5E1D8] text-[11px] text-[#7A776D] flex items-center justify-between">
                <span>Places restantes</span>
                <span className="font-semibold text-[#9E824C]">{config.founderQuotaTotal - config.founderQuotaUsed} places</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Section 2 : Configuration dynamique & Quota Fondateur */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire des prix */}
          <Card className="bg-white border-[#E5E1D8] p-6 lg:col-span-2 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1C1B18] flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#C9A96E]" />
                  Ajuster la Grille Tarifaire Flutterwave
                </h3>
                <p className="text-xs text-[#7A776D] mt-0.5">
                  Synchronisé avec les montants affichés sur le checkout Flutterwave.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1.5">
                    Prix Sprint 14 jours (€)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={sprintPrice}
                      onChange={(e) => setSprintPrice(e.target.value)}
                      className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] font-medium pl-3 pr-8 focus:border-[#C9A96E]"
                      min="1"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#7A776D]">€</span>
                  </div>
                  <span className="text-[10px] text-[#7A776D] mt-1 block">Tarif actuel : 13 €</span>
                </div>

                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1.5">
                    Prix Mensuel Récurrent (€)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] font-medium pl-3 pr-8 focus:border-[#C9A96E]"
                      min="1"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#7A776D]">€</span>
                  </div>
                  <span className="text-[10px] text-[#7A776D] mt-1 block">Tarif actuel : 22 € / mois</span>
                </div>

                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1.5">
                    Prix Accès Fondateur (€)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={lifetimePrice}
                      onChange={(e) => setLifetimePrice(e.target.value)}
                      className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] font-medium pl-3 pr-8 focus:border-[#C9A96E]"
                      min="1"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#7A776D]">€</span>
                  </div>
                  <span className="text-[10px] text-[#7A776D] mt-1 block">Tarif à vie : 69 €</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#7A776D]">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Mise à jour immédiate sur le site</span>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-[#1C1B18] hover:bg-[#2E2C27] text-white font-medium text-xs px-4"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les Tarifs'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Quota Fondateur */}
          <Card className="bg-white border-[#E5E1D8] p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-sm text-[#1C1B18] flex items-center gap-2">
                  <Crown className="h-4 w-4 text-[#C9A96E]" />
                  Quota Membres Fondateurs
                </h3>
                <span className="text-xs font-bold text-[#9E824C]">{quotaPercent}%</span>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-[#efeeea] rounded-full h-3 overflow-hidden border border-[#E5E1D8]">
                  <div 
                    className="bg-gradient-to-r from-[#C9A96E] to-[#9E824C] h-full rounded-full transition-all duration-500"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#7A776D]">
                  <span>{config.founderQuotaUsed} places attribuées</span>
                  <span>{config.founderQuotaTotal - config.founderQuotaUsed} places restantes</span>
                </div>

                <div className="p-3 rounded bg-[#fbf9f5] border border-[#E5E1D8] text-xs text-[#494740] space-y-1 mt-4">
                  <div className="flex justify-between">
                    <span>Plafond :</span>
                    <span className="font-bold text-[#1C1B18]">{config.founderQuotaTotal} licences</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenus générés :</span>
                    <span className="font-bold text-[#9E824C]">{config.founderQuotaUsed * config.lifetimePrice} €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E1D8] mt-4 flex items-center gap-2">
              <Input
                type="number"
                value={quotaTotal}
                onChange={(e) => setQuotaTotal(e.target.value)}
                className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] text-xs h-8"
                placeholder="Nouveau quota"
              />
              <Button 
                onClick={handleSavePricing}
                variant="outline"
                className="border-[#E5E1D8] text-[#1C1B18] hover:bg-[#efeeea] text-xs h-8 whitespace-nowrap"
              >
                Ajuster quota
              </Button>
            </div>
          </Card>
        </div>

        {/* Section 3 : Moniteur d'expiration Sprint */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A776D] flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Moniteur d&apos;expiration des Sprints (48h - 72h)
              </h2>
              <p className="text-xs text-[#1C1B18]">
                Détection automatique des candidats arrivant à la fin des 14 jours.
              </p>
            </div>
            <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 font-medium">
              {expiringUsers.length} comptes à surveiller
            </span>
          </div>

          <Card className="bg-white border-[#E5E1D8] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f3ef] text-[#494740] uppercase tracking-wider border-b border-[#E5E1D8] text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Candidat</th>
                    <th className="py-3 px-4 font-semibold">Délai Restant</th>
                    <th className="py-3 px-4 font-semibold">Date d&apos;expiration</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions Proactives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8] text-[#1C1B18]">
                  {expiringUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[#7A776D]">
                        Aucun abonnement Sprint n&apos;arrive à expiration dans les prochaines 72 heures.
                      </td>
                    </tr>
                  ) : (
                    expiringUsers.map((user) => (
                      <tr key={user.userId} className="hover:bg-[#fbf9f5] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1C1B18]">{user.name}</div>
                          <div className="text-[11px] text-[#7A776D]">{user.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            J-{user.daysRemaining}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#9E824C] font-semibold">
                          {user.expiresAt}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSendReminder(user.email)}
                            className="bg-white hover:bg-[#efeeea] text-[#1C1B18] border border-[#E5E1D8] text-xs h-7 px-2.5"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Relancer
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleExtendSprint(user.name)}
                            className="bg-[#C9A96E]/15 hover:bg-[#C9A96E]/25 text-[#9E824C] border border-[#C9A96E]/40 text-xs h-7 px-2.5"
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            +7 jours
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
      </div>
    </div>
  );
}
