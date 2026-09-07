'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  getAffiliatesList, 
  createAffiliate, 
  payoutAffiliate,
  toggleAffiliateStatus
} from '@/utils/actions/admin/actions';
import { AffiliateItem } from '@/lib/admin-types';
import { 
  Handshake, 
  Plus, 
  Copy, 
  Check, 
  DollarSign, 
  MousePointer, 
  ShoppingBag, 
  X, 
  CreditCard, 
  Pause, 
  Play,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AffiliateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal Création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newRate, setNewRate] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Confirmation Statut
  const [partnerToToggle, setPartnerToToggle] = useState<AffiliateItem | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getAffiliatesList();
        setAffiliates(data);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement des affiliés.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalClicks = affiliates.reduce((sum, a) => sum + a.clicks, 0);
  const totalConversions = affiliates.reduce((sum, a) => sum + a.conversions, 0);
  const totalPendingPayout = affiliates.reduce((sum, a) => sum + a.pendingPayout, 0);
  const totalAvailableBalance = affiliates.reduce((sum, a) => sum + (a.availableBalance || 0), 0);
  const totalEarned = affiliates.reduce((sum, a) => sum + a.totalEarned, 0);

  const handleCopyLink = (code: string) => {
    const link = `https://easywork.com/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success(`Lien copié : ${link}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePayout = async (affiliate: AffiliateItem) => {
    if (affiliate.pendingPayout <= 0 && (affiliate.availableBalance || 0) <= 0) {
      toast.info('Aucun solde disponible pour cet affilié.');
      return;
    }
    const amountToPay = (affiliate.availableBalance || 0) > 0 ? (affiliate.availableBalance || 0) : affiliate.pendingPayout;
    try {
      await payoutAffiliate(affiliate.id, amountToPay);
      setAffiliates(prev => prev.map(a => 
        a.id === affiliate.id ? { ...a, pendingPayout: 0, availableBalance: 0 } : a
      ));
      toast.success(`Versement de ${amountToPay.toFixed(2)} $ validé pour ${affiliate.name} !`);
    } catch {
      toast.error('Échec du versement.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newCode) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setIsSubmitting(true);
    try {
      const codeClean = newCode.toLowerCase().trim();
      const rateNum = parseFloat(newRate) || 30;
      await createAffiliate({
        name: newName,
        email: newEmail,
        code: codeClean,
        commissionRate: rateNum,
      });

      const newAff: AffiliateItem = {
        id: `aff-${Date.now()}`,
        code: codeClean,
        name: newName,
        email: newEmail,
        commissionRate: rateNum,
        clicks: 0,
        signups: 0,
        conversions: 0,
        totalEarned: 0,
        pendingPayout: 0,
        availableBalance: 0,
        pendingDebt: 0,
        status: 'active',
        isActive: true,
        createdAt: 'Aujourd\'hui',
      };

      setAffiliates(prev => [newAff, ...prev]);
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewCode('');
      setNewRate('30');
      toast.success(`Partenaire affilié ${codeClean} activé avec succès !`);
    } catch {
      toast.error('Erreur lors de la création de l\'affilié.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!partnerToToggle) return;
    setIsToggling(true);
    try {
      const res = await toggleAffiliateStatus(partnerToToggle.id);
      setAffiliates(prev => prev.map(a => 
        a.id === partnerToToggle.id ? { 
          ...a, 
          isActive: res.isActive, 
          status: res.isActive ? 'active' : 'paused' 
        } : a
      ));
      toast.success(`Le partenaire ${partnerToToggle.code} est maintenant ${res.isActive ? 'Actif' : 'En pause'}.`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement de statut');
    } finally {
      setIsToggling(false);
      setPartnerToToggle(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <AdminHeader 
        title="Affiliés & Commissions" 
        subtitle="Partenaires réels enregistrés en base, suivi des conversions et validation des reversements."
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* KPI Cards Affiliation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Clics Redirigés</span>
              <MousePointer className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{totalClicks.toLocaleString('fr-FR')}</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Trafic qualifié apporté</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Ventes Converties</span>
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{totalConversions}</span>
              <span className="text-xs text-emerald-600 font-medium">
                {totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0}% conv.
              </span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Abonnements ou Sprints validés</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Commissions Versées</span>
              <DollarSign className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{totalEarned.toFixed(2)} $</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Total rémunéré</p>
          </Card>

          <Card className="bg-white border-[#C9A96E]/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9E824C] uppercase tracking-wider font-semibold">Solde Disponible</span>
              <CreditCard className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#9E824C]">
                {(totalAvailableBalance > 0 ? totalAvailableBalance : totalPendingPayout).toFixed(2)} $
              </span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Prêt pour versement</p>
          </Card>
        </div>

        {/* Bouton Nouvel Affilié */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A776D]">Liste des Partenaires ({affiliates.length})</h2>
            <p className="text-xs text-[#1C1B18] font-medium">Codes d&apos;affiliation et liens de tracking uniques</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1C1B18] hover:bg-[#2E2C27] text-white font-medium text-xs px-3.5 h-8"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nouveau Partenaire
          </Button>
        </div>

        {/* Tableau des Affiliés */}
        <Card className="bg-white border-[#E5E1D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f3ef] text-[#494740] uppercase tracking-wider border-b border-[#E5E1D8] text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Partenaire</th>
                  <th className="py-3 px-4 font-semibold">Code & Lien</th>
                  <th className="py-3 px-4 font-semibold">Taux</th>
                  <th className="py-3 px-4 font-semibold">Clics</th>
                  <th className="py-3 px-4 font-semibold">Ventes</th>
                  <th className="py-3 px-4 font-semibold">Total Gagné</th>
                  <th className="py-3 px-4 font-semibold">Solde Disponible</th>
                  <th className="py-3 px-4 font-semibold">Statut</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8] text-[#1C1B18]">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#7A776D]">
                      Chargement des partenaires...
                    </td>
                  </tr>
                ) : affiliates.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#7A776D]">
                      Aucun partenaire affilié enregistré pour l&apos;instant.
                    </td>
                  </tr>
                ) : (
                  affiliates.map((aff) => {
                    const isActive = aff.isActive !== false && aff.status === 'active';
                    const available = (aff.availableBalance !== undefined && aff.availableBalance !== null) 
                      ? aff.availableBalance 
                      : aff.pendingPayout;
                    const debt = aff.pendingDebt || 0;

                    return (
                      <tr key={aff.id} className="hover:bg-[#fbf9f5] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1C1B18]">{aff.name}</div>
                          <div className="text-[11px] text-[#7A776D]">{aff.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[#9E824C] bg-[#C9A96E]/15 px-2 py-0.5 rounded border border-[#C9A96E]/30">
                              {aff.code}
                            </span>
                            <button
                              onClick={() => handleCopyLink(aff.code)}
                              title="Copier le lien"
                              className="p-1 text-[#7A776D] hover:text-[#1C1B18] transition-colors"
                            >
                              {copiedCode === aff.code ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="text-[10px] text-[#7A776D] mt-0.5">easywork.com/?ref={aff.code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1C1B18]">{aff.commissionRate}%</span>
                          <span className="text-[10px] text-[#7A776D] ml-1">à vie</span>
                        </td>
                        <td className="py-3 px-4 text-[#1C1B18] font-medium">
                          {aff.clicks}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-emerald-600">{aff.conversions}</span>
                          <span className="text-[10px] text-[#7A776D] ml-1">
                            ({aff.clicks > 0 ? ((aff.conversions / aff.clicks) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#1C1B18] font-medium">
                          {aff.totalEarned.toFixed(2)} $
                        </td>
                        <td className="py-3 px-4">
                          <div className={`font-bold ${available > 0 ? 'text-[#9E824C]' : 'text-[#7A776D]'}`}>
                            {available.toFixed(2)} $
                          </div>
                          {debt > 0 && (
                            <div className="text-[10px] text-amber-700 font-medium">
                              Dette: -{debt.toFixed(2)} $
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setPartnerToToggle(aff)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Cliquer pour modifier le statut"
                          >
                            {isActive ? (
                              <>
                                <Play className="h-2.5 w-2.5" />
                                Actif
                              </>
                            ) : (
                              <>
                                <Pause className="h-2.5 w-2.5" />
                                En pause
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            disabled={available <= 0}
                            onClick={() => handlePayout(aff)}
                            className="bg-white hover:bg-[#efeeea] text-[#1C1B18] border border-[#E5E1D8] text-xs h-7 px-2.5 disabled:opacity-40"
                          >
                            Payer {available > 0 ? `${available.toFixed(2)} $` : ''}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Confirmation Changement de Statut */}
      {partnerToToggle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="bg-white border-[#E5E1D8] text-[#1C1B18] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-start gap-3 pb-4 border-b border-[#E5E1D8]">
              <div className={`p-2 rounded-full ${partnerToToggle.isActive !== false ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-base text-[#1C1B18]">
                  {partnerToToggle.isActive !== false ? 'Désactiver ce partenaire ?' : 'Réactiver ce partenaire ?'}
                </h3>
                <p className="text-xs text-[#7A776D] mt-1">
                  Partenaire : <span className="font-semibold text-[#1C1B18]">{partnerToToggle.name}</span> ({partnerToToggle.code})
                </p>
              </div>
              <button 
                onClick={() => setPartnerToToggle(null)}
                className="text-[#7A776D] hover:text-[#1C1B18]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-[#494740] space-y-2">
              {partnerToToggle.isActive !== false ? (
                <p>
                  En désactivant ce compte, le lien <span className="font-mono font-bold text-[#1C1B18]">easywork.com/?ref={partnerToToggle.code}</span> cessera d&apos;attribuer de nouveaux filleuls. Le webhook Flutterwave suspendra l&apos;octroi de commissions récurrentes.
                </p>
              ) : (
                <p>
                  En réactivant ce compte, le lien sera de nouveau fonctionnel et les commissions sur paiements seront créditées normalement.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPartnerToToggle(null)}
                disabled={isToggling}
                className="border-[#E5E1D8] text-[#494740] text-xs h-9"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleConfirmToggle}
                disabled={isToggling}
                className={`text-white text-xs h-9 px-4 ${
                  partnerToToggle.isActive !== false 
                    ? 'bg-amber-700 hover:bg-amber-800' 
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {isToggling ? 'Mise à jour...' : (partnerToToggle.isActive !== false ? 'Confirmer la désactivation' : 'Confirmer la réactivation')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Création d'Affilié */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="bg-white border-[#E5E1D8] text-[#1C1B18] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
              <div className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-[#C9A96E]" />
                <h3 className="font-serif font-bold text-base text-[#1C1B18]">Nouveau Partenaire Affilié</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#7A776D] hover:text-[#1C1B18]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-[#494740] font-medium mb-1">
                  Nom du Partenaire / Média
                </label>
                <Input
                  required
                  placeholder="Ex: Podcast Recrutement Tech"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] text-xs h-9 focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#494740] font-medium mb-1">
                  Email de contact
                </label>
                <Input
                  required
                  type="email"
                  placeholder="Ex: contact@podcast-recrutement.fr"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] text-xs h-9 focus:border-[#C9A96E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1">
                    Code d&apos;affiliation
                  </label>
                  <Input
                    required
                    placeholder="PODCASTTECH"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] uppercase font-mono text-xs h-9 focus:border-[#C9A96E]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1">
                    Commission (%)
                  </label>
                  <Input
                    required
                    type="number"
                    min="5"
                    max="60"
                    placeholder="30"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] text-xs h-9 focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#7A776D] bg-[#fbf9f5] p-2.5 rounded border border-[#E5E1D8]">
                Le lien généré sera <span className="text-[#9E824C] font-mono font-semibold">easywork.com/?ref={newCode || 'CODE'}</span>.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="border-[#E5E1D8] text-[#494740] hover:text-[#1C1B18] text-xs h-9"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1C1B18] hover:bg-[#2E2C27] text-white font-medium text-xs h-9 px-4"
                >
                  {isSubmitting ? 'Création...' : 'Créer et activer le lien'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
