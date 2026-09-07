'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  getPartnerData, 
  activatePartnerAccount, 
  updatePartnerCustomCode, 
  savePayoutDetails, 
  requestPayout,
  PartnerDashboardData 
} from '@/utils/actions/partner/actions';
import { 
  Handshake, 
  DollarSign, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MousePointer, 
  Users, 
  ShoppingBag, 
  Clock, 
  CreditCard, 
  Smartphone, 
  AlertCircle, 
  Info, 
  Sparkles, 
  ArrowRight,
  Edit3,
  X,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function PartnerPage() {
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Case à cocher Conditions Générales
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Modal Personnalisation Code
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  // Formulaire Coordonnées Retrait
  const [payoutMethod, setPayoutMethod] = useState<'mobile_money' | 'bank'>('mobile_money');
  const [phoneOrAccount, setPhoneOrAccount] = useState('');
  const [networkOrBank, setNetworkOrBank] = useState('Orange Money');
  const [accountOwner, setAccountOwner] = useState('');
  const [isSavingPayout, setIsSavingPayout] = useState(false);

  // Modal Confirmation Retrait
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getPartnerData();
      setData(res);
      if (res?.partner?.payoutDetails) {
        const d = res.partner.payoutDetails;
        setPayoutMethod(res.partner.payoutMethod || 'mobile_money');
        setPhoneOrAccount(d.phone_number || d.account_number || '');
        setNetworkOrBank(d.network || d.bank_name || 'Orange Money');
        setAccountOwner(d.account_owner || res.partner.name || '');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des informations partenaires.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyLink = () => {
    if (!data?.partner?.code) return;
    const url = `https://easywork.com/?ref=${data.partner.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Lien partenaire copié dans le presse-papier !');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleActivate = () => {
    startTransition(async () => {
      try {
        const res = await activatePartnerAccount();
        toast.success(`Votre lien partenaire (${res.code}) est actif !`);
        await loadData();
      } catch (err: any) {
        toast.error(err.message || 'Impossible d\'activer votre compte partenaire.');
      }
    });
  };

  const handleSaveCustomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    const clean = customCodeInput.trim().toLowerCase();

    if (clean.length < 3 || clean.length > 30) {
      setCodeError('Le code doit comporter entre 3 et 30 caractères.');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(clean)) {
      setCodeError('Seuls les lettres minuscules, chiffres et tirets sont autorisés.');
      return;
    }

    try {
      await updatePartnerCustomCode(clean);
      toast.success(`Votre code personnalisé "${clean}" a été enregistré.`);
      setShowCodeModal(false);
      setCustomCodeInput('');
      await loadData();
    } catch (err: any) {
      setCodeError(err.message || 'Ce code n\'est pas disponible.');
    }
  };

  const handleSavePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrAccount) {
      toast.error('Veuillez renseigner un numéro ou un compte.');
      return;
    }

    setIsSavingPayout(true);
    try {
      const details: Record<string, string> = {
        account_owner: accountOwner,
      };

      if (payoutMethod === 'mobile_money') {
        details.phone_number = phoneOrAccount;
        details.network = networkOrBank;
      } else {
        details.account_number = phoneOrAccount;
        details.bank_name = networkOrBank;
      }

      await savePayoutDetails({
        payoutMethod,
        details,
      });

      toast.success('Coordonnées de paiement mises à jour avec succès !');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSavingPayout(false);
    }
  };

  const handleConfirmPayout = async () => {
    setIsWithdrawing(true);
    try {
      const res = await requestPayout();
      toast.success(`Demande de retrait de ${res.amount.toFixed(2)} $ envoyée avec succès !`);
      setShowPayoutModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Échec du retrait.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-[#C9A96E]" />
        <p className="text-sm text-[#7A776D] font-medium">Chargement de votre espace partenaire...</p>
      </div>
    );
  }

  // ==========================================
  // ÉTAT 1 : UTILISATEUR NON ENCORE PARTENAIRE
  // ==========================================
  if (!data?.isPartner) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Hero Onboarding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-xs font-semibold text-[#9E824C]">
            <Sparkles className="h-3.5 w-3.5" />
            Programme Partenaires de Communication
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1B18] tracking-tight max-w-2xl mx-auto">
            Touchez 30% chaque mois sur chaque abonné, à vie.
          </h1>
          <p className="text-sm sm:text-base text-[#494740] max-w-xl mx-auto leading-relaxed">
            Recommandez EasyWork à votre réseau, votre communauté ou vos proches en recherche d&apos;emploi. Pour chaque souscription et chaque renouvellement mensuel, encaissez 30% de revenus récurrents.
          </p>

          <div className="pt-4 max-w-xl mx-auto space-y-4">
            <Card className="p-5 bg-white border-[#E5E1D8] shadow-xs text-left space-y-3.5">
              <span className="text-[11px] font-bold text-[#7A776D] uppercase tracking-wider block">
                Règles clés du programme
              </span>

              {/* 3 puces de clarté UX */}
              <ul className="space-y-2 text-xs text-[#494740]">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-[#1C1B18]">30 % de commission</strong> sur chaque renouvellement d&apos;abonnement.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-[#1C1B18]">Auto-parrainage interdit</strong> (vous ne pouvez pas utiliser votre propre lien pour votre compte).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E] mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-[#1C1B18]">Retraits disponibles</strong> dès que le solde atteint le seuil minimal.
                  </span>
                </li>
              </ul>

              <div className="h-px bg-[#E5E1D8]" />

              {/* Case à cocher obligatoire */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#494740]">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#E5E1D8] text-[#1C1B18] focus:ring-[#C9A96E] accent-[#1C1B18] cursor-pointer"
                />
                <span>
                  J&apos;ai lu et j&apos;accepte les{' '}
                  <Link 
                    href="/legal/terms-partners" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#9E824C] underline hover:text-[#7A6437] font-medium"
                  >
                    Conditions Générales du Programme Partenaire
                  </Link>.
                </span>
              </label>

              {/* Bouton d'action */}
              <div className="pt-1">
                <Button
                  size="lg"
                  onClick={handleActivate}
                  disabled={!termsAccepted || isPending}
                  className="w-full bg-[#1C1B18] hover:bg-[#2E2C27] disabled:bg-[#1C1B18]/30 disabled:text-white/60 disabled:cursor-not-allowed text-white py-5 text-xs sm:text-sm font-semibold rounded-md shadow-md transition-all"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin text-[#C9A96E]" />
                      Activation en cours...
                    </>
                  ) : (
                    <>
                      Accepter et activer mon compte partenaire
                      <ArrowRight className="h-4 w-4 ml-2 text-[#C9A96E]" />
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-[#7A776D] text-center mt-2">
                  Gratuit, sans engagement et actif immédiatement.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* 3 Piliers du Programme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Card className="p-6 bg-white border-[#E5E1D8] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center text-[#9E824C]">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1C1B18]">30% à vie et récurrent</h3>
            <p className="text-xs text-[#494740] leading-relaxed">
              Pas une commission unique : tant que votre filleul reste abonné ou renouvelle son forfait (Sprint 13$, Mensuel 22$, Fondateur 69$), vous touchez 30% sur chaque transaction.
            </p>
          </Card>

          <Card className="p-6 bg-white border-[#E5E1D8] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1C1B18]">Gel 30 jours sécurisé</h3>
            <p className="text-xs text-[#494740] leading-relaxed">
              Vos commissions sont enregistrées instantanément sous statut temporaire puis automatiquement débloquées après 30 jours, vous protégeant contre toute contestation.
            </p>
          </Card>

          <Card className="p-6 bg-white border-[#E5E1D8] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1C1B18]">Retrait flexible dès 20$</h3>
            <p className="text-xs text-[#494740] leading-relaxed">
              Dès que vous atteignez le seuil de 20$, recevez vos fonds par virement direct sur Mobile Money (Orange, MTN, Wave) ou sur compte bancaire.
            </p>
          </Card>
        </div>

        {/* Détails cookies */}
        <div className="p-4 rounded-md bg-[#efeeea] border border-[#E5E1D8] flex items-center gap-3 text-xs text-[#494740]">
          <Info className="h-5 w-5 text-[#9E824C] flex-shrink-0" />
          <span>
            <strong>Cookie de suivi 60 jours :</strong> Si un contact clique sur votre lien et ne s&apos;inscrit que 4 semaines plus tard, il reste automatiquement et définitivement associé à votre compte partenaire.
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // ÉTAT 2 : UTILISATEUR PARTENAIRE ACTIF
  // ==========================================
  const partner = data.partner!;
  const affiliateUrl = `https://easywork.com/?ref=${partner.code}`;
  const isAvailableForPayout = partner.availableBalance >= 20;
  const missingForPayout = Math.max(0, 20 - partner.availableBalance).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Alerte si compte suspendu */}
      {!partner.isActive && (
        <div className="p-4 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0" />
          <div>
            <strong>Compte Partenaire Suspendu :</strong> Votre lien de parrainage ne collecte actuellement pas de nouveaux filleuls. Veuillez contacter le support si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
          </div>
        </div>
      )}

      {/* Header Espace Partenaire */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E1D8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B18]">
              Espace Partenaire
            </h1>
            <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
              partner.isActive 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${partner.isActive ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              {partner.isActive ? 'Actif (30% à vie)' : 'En pause'}
            </span>
          </div>
          <p className="text-xs text-[#7A776D] mt-1">
            Partenaire enregistré : <span className="font-semibold text-[#1C1B18]">{partner.name}</span> ({partner.email})
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="border-[#E5E1D8] text-[#494740] hover:text-[#1C1B18] text-xs h-8 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Actualiser
        </Button>
      </div>

      {/* Box de partage du lien */}
      <Card className="p-5 bg-white border-[#E5E1D8] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs text-[#7A776D] font-semibold uppercase tracking-wider">Votre Lien de Tracking Unique</span>
            <p className="text-xs text-[#494740] mt-0.5">
              Partagez ce lien. Les visiteurs qui s&apos;inscrivent sous 60 jours seront vos filleuls à vie.
            </p>
          </div>

          {!partner.codeModified ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomCodeInput(partner.code);
                setShowCodeModal(true);
              }}
              className="border-[#C9A96E]/50 text-[#9E824C] hover:bg-[#C9A96E]/10 text-xs h-8"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" />
              Personnaliser mon code (1 fois)
            </Button>
          ) : (
            <span className="text-[11px] text-[#7A776D] font-medium bg-[#f5f3ef] px-2.5 py-1 rounded border border-[#E5E1D8]">
              Code personnalisé : <strong className="font-mono text-[#1C1B18]">{partner.code}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 max-w-2xl">
          <div className="flex-1 bg-[#fbf9f5] border border-[#E5E1D8] rounded px-3 py-2 text-xs font-mono text-[#1C1B18] truncate select-all">
            {affiliateUrl}
          </div>
          <Button
            onClick={handleCopyLink}
            className="bg-[#1C1B18] hover:bg-[#2E2C27] text-white text-xs px-4 h-9 flex-shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5 text-[#C9A96E]" />
                Copier le lien
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* 3 Cartes Financières Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Gains Historiques */}
        <Card className="p-5 bg-white border-[#E5E1D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7A776D] font-semibold uppercase tracking-wider">Total Gagné</span>
            <DollarSign className="h-4 w-4 text-[#C9A96E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B18]">
            {partner.totalEarned.toFixed(2)} $
          </div>
          <p className="text-[11px] text-[#7A776D]">
            Commissions nettes cumulées depuis votre inscription.
          </p>
        </Card>

        {/* 2. En attente de déblocage (Gel 30 jours) */}
        <Card className="p-5 bg-white border-[#E5E1D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7A776D] font-semibold uppercase tracking-wider">Gel 30 jours (En attente)</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-900">
            {partner.pendingAmount.toFixed(2)} $
          </div>
          <div className="text-[11px] text-[#494740]">
            {partner.nextReleaseDate ? (
              <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                Prochain déblocage : {partner.nextReleaseDate}
              </span>
            ) : (
              <span className="text-[#7A776D]">Aucune commission en attente de déblocage.</span>
            )}
          </div>
        </Card>

        {/* 3. Solde Disponible au Retrait */}
        <Card className="p-5 bg-white border-[#C9A96E]/50 shadow-xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A96E]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9E824C] font-semibold uppercase tracking-wider">Solde Retirable</span>
            <CreditCard className="h-4 w-4 text-[#C9A96E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#9E824C]">
            {partner.availableBalance.toFixed(2)} $
          </div>
          <div className="text-[11px]">
            {partner.pendingDebt > 0 ? (
              <span className="text-amber-800 font-medium">
                Déficit en cours : -{partner.pendingDebt.toFixed(2)} $ (remboursement client à apurer)
              </span>
            ) : (
              <span className="text-[#7A776D]">
                {isAvailableForPayout ? 'Prêt pour un versement immédiat !' : `Encore ${missingForPayout} $ avant le seuil de 20$.`}
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Métriques Trafic & Conversions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Clics */}
        <Card className="p-4 bg-white border-[#E5E1D8] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7A776D] font-medium">Clics Redirigés</span>
            <MousePointer className="h-3.5 w-3.5 text-[#C9A96E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-serif text-[#1C1B18]">{partner.totalClicks}</span>
            {partner.clickTrend === 'up' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="h-3 w-3" />
                +{partner.clicks7d} sur 7j
              </span>
            )}
            {partner.clickTrend === 'down' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                <TrendingDown className="h-3 w-3" />
                {partner.clicks7d} sur 7j
              </span>
            )}
            {partner.clickTrend === 'stable' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#7A776D] bg-[#f5f3ef] px-1.5 py-0.5 rounded">
                <Minus className="h-3 w-3" />
                {partner.clicks7d} sur 7j
              </span>
            )}
          </div>
        </Card>

        {/* Inscriptions */}
        <Card className="p-4 bg-white border-[#E5E1D8] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7A776D] font-medium">Inscriptions Gratuites</span>
            <Users className="h-3.5 w-3.5 text-[#C9A96E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-serif text-[#1C1B18]">{partner.totalSignups}</span>
            <span className="text-[10px] text-[#7A776D]">
              ({partner.clickToSignupRate}% de conv.)
            </span>
          </div>
        </Card>

        {/* Ventes Converties */}
        <Card className="p-4 bg-white border-[#E5E1D8] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7A776D] font-medium">Ventes / Abonnements</span>
            <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-serif text-[#1C1B18]">{partner.totalConversions}</span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              ({partner.clickToPaidRate}% de conversion finale)
            </span>
          </div>
        </Card>
      </div>

      {/* Section Retrait & Coordonnées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne 1 : Demande de Retrait */}
        <Card className="p-6 bg-white border-[#E5E1D8] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-base text-[#1C1B18]">Demande de Virement</h2>
          </div>

          <p className="text-xs text-[#494740] leading-relaxed">
            Les fonds disponibles peuvent être retirés à tout moment à partir du seuil minimal de <strong>20,00 $</strong>. Le virement est traité via l&apos;API Flutterwave Transfers.
          </p>

          <div className="p-4 rounded-md bg-[#fbf9f5] border border-[#E5E1D8] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#7A776D]">Solde disponible actuel :</span>
              <strong className="text-[#1C1B18] font-mono">{partner.availableBalance.toFixed(2)} $</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#7A776D]">Seuil minimum requis :</span>
              <span className="font-mono text-[#494740]">20,00 $</span>
            </div>
            <div className="h-px bg-[#E5E1D8] my-2" />
            <div className="flex justify-between text-xs">
              <span className="text-[#7A776D]">Montant du retrait :</span>
              <strong className="text-[#9E824C] font-mono font-bold">
                {isAvailableForPayout ? `${partner.availableBalance.toFixed(2)} $` : '0,00 $'}
              </strong>
            </div>
          </div>

          {!isAvailableForPayout ? (
            <div className="space-y-2">
              <Button
                disabled
                className="w-full bg-[#1C1B18]/40 text-white cursor-not-allowed text-xs h-10 font-semibold"
              >
                Retrait indisponible ({missingForPayout} $ manquants)
              </Button>
              <p className="text-[11px] text-[#7A776D] text-center">
                Seuil minimal : 20,00 $. Continuez de partager votre lien pour débloquer votre premier versement.
              </p>
            </div>
          ) : (
            <Button
              onClick={() => setShowPayoutModal(true)}
              className="w-full bg-[#1C1B18] hover:bg-[#2E2C27] text-white text-xs h-10 font-semibold shadow-xs"
            >
              Demander le virement de {partner.availableBalance.toFixed(2)} $
            </Button>
          )}
        </Card>

        {/* Colonne 2 : Coordonnées de Paiement */}
        <Card className="p-6 bg-white border-[#E5E1D8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#C9A96E]" />
              <h2 className="font-serif font-bold text-base text-[#1C1B18]">Coordonnées de Réception</h2>
            </div>
            <div className="flex rounded border border-[#E5E1D8] p-0.5 bg-[#fbf9f5]">
              <button
                type="button"
                onClick={() => setPayoutMethod('mobile_money')}
                className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
                  payoutMethod === 'mobile_money'
                    ? 'bg-[#1C1B18] text-white'
                    : 'text-[#494740] hover:text-[#1C1B18]'
                }`}
              >
                Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setPayoutMethod('bank')}
                className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
                  payoutMethod === 'bank'
                    ? 'bg-[#1C1B18] text-white'
                    : 'text-[#494740] hover:text-[#1C1B18]'
                }`}
              >
                Compte Bancaire
              </button>
            </div>
          </div>

          <form onSubmit={handleSavePayoutDetails} className="space-y-3">
            <div>
              <label className="block text-xs text-[#494740] font-medium mb-1">
                Nom complet du titulaire
              </label>
              <Input
                required
                placeholder="Ex: Alexandre Martin"
                value={accountOwner}
                onChange={(e) => setAccountOwner(e.target.value)}
                className="bg-[#fbf9f5] border-[#E5E1D8] text-xs h-9"
              />
            </div>

            {payoutMethod === 'mobile_money' ? (
              <>
                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1">
                    Opérateur Mobile Money
                  </label>
                  <select
                    value={networkOrBank}
                    onChange={(e) => setNetworkOrBank(e.target.value)}
                    className="w-full bg-[#fbf9f5] border border-[#E5E1D8] rounded px-3 py-1.5 text-xs text-[#1C1B18] focus:border-[#C9A96E] outline-none"
                  >
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Wave">Wave</option>
                    <option value="Moov Money">Moov Money</option>
                    <option value="Airtel Money">Airtel Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1">
                    Numéro de téléphone
                  </label>
                  <Input
                    required
                    placeholder="+225 07..."
                    value={phoneOrAccount}
                    onChange={(e) => setPhoneOrAccount(e.target.value)}
                    className="bg-[#fbf9f5] border-[#E5E1D8] text-xs h-9"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1">
                    Nom de la banque
                  </label>
                  <Input
                    required
                    placeholder="Ex: BNP Paribas, Ecobank, SG..."
                    value={networkOrBank}
                    onChange={(e) => setNetworkOrBank(e.target.value)}
                    className="bg-[#fbf9f5] border-[#E5E1D8] text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#494740] font-medium mb-1">
                    Numéro de compte / IBAN
                  </label>
                  <Input
                    required
                    placeholder="FR76..."
                    value={phoneOrAccount}
                    onChange={(e) => setPhoneOrAccount(e.target.value)}
                    className="bg-[#fbf9f5] border-[#E5E1D8] text-xs h-9 font-mono"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isSavingPayout}
              className="w-full bg-[#1C1B18] hover:bg-[#2E2C27] text-white text-xs h-9 font-medium"
            >
              {isSavingPayout ? 'Enregistrement...' : 'Enregistrer les coordonnées'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Tableau 1 : Historique des Commissions */}
      <Card className="bg-white border-[#E5E1D8] overflow-hidden shadow-xs space-y-0">
        <div className="p-4 border-b border-[#E5E1D8] bg-[#fbf9f5] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#1C1B18]">Historique des Commissions</h3>
            <p className="text-[11px] text-[#7A776D]">Suivi de toutes les commissions (30% nettes) générées par vos filleuls.</p>
          </div>
          <span className="text-xs font-semibold text-[#1C1B18]">
            {partner.commissions.length} transaction{partner.commissions.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f3ef] text-[#494740] uppercase tracking-wider border-b border-[#E5E1D8] text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Vente Référence</th>
                <th className="py-2.5 px-4 font-semibold">Commission (30%)</th>
                <th className="py-2.5 px-4 font-semibold">Statut</th>
                <th className="py-2.5 px-4 font-semibold">Date Déblocage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1D8] text-[#1C1B18]">
              {partner.commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#7A776D]">
                    Aucune commission pour le moment. Partagez votre lien pour démarrer !
                  </td>
                </tr>
              ) : (
                partner.commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fbf9f5] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#494740]">{c.createdAt}</td>
                    <td className="py-3 px-4 font-mono">{c.orderAmount.toFixed(2)} {c.currency}</td>
                    <td className="py-3 px-4 font-bold text-[#9E824C] font-mono">
                      +{c.commissionAmount.toFixed(2)} {c.currency}
                    </td>
                    <td className="py-3 px-4">
                      {c.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-2.5 w-2.5" />
                          Gel 30j (En attente)
                        </span>
                      )}
                      {c.status === 'available' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Check className="h-2.5 w-2.5" />
                          Disponible au retrait
                        </span>
                      )}
                      {c.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="h-2.5 w-2.5" />
                          Versée
                        </span>
                      )}
                      {c.status === 'canceled' && (
                        <span 
                          title="Cette commission a été annulée suite à un remboursement ou un litige sur le paiement du client."
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-red-50 text-red-700 border border-red-200 cursor-help"
                        >
                          <X className="h-2.5 w-2.5" />
                          Annulée (Remboursement)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#7A776D] font-mono text-[11px]">
                      {c.releaseAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tableau 2 : Historique des Retraits */}
      <Card className="bg-white border-[#E5E1D8] overflow-hidden shadow-xs space-y-0">
        <div className="p-4 border-b border-[#E5E1D8] bg-[#fbf9f5] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#1C1B18]">Historique des Virements</h3>
            <p className="text-[11px] text-[#7A776D]">Suivi de vos demandes de virement et versements effectués.</p>
          </div>
          <span className="text-xs font-semibold text-[#1C1B18]">
            {partner.payouts.length} virement{partner.payouts.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f3ef] text-[#494740] uppercase tracking-wider border-b border-[#E5E1D8] text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Montant</th>
                <th className="py-2.5 px-4 font-semibold">Méthode</th>
                <th className="py-2.5 px-4 font-semibold">Référence</th>
                <th className="py-2.5 px-4 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1D8] text-[#1C1B18]">
              {partner.payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#7A776D]">
                    Aucun virement demandé pour le moment.
                  </td>
                </tr>
              ) : (
                partner.payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fbf9f5] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#494740]">{p.createdAt}</td>
                    <td className="py-3 px-4 font-bold font-mono text-[#1C1B18]">{p.amount.toFixed(2)} {p.currency}</td>
                    <td className="py-3 px-4 capitalize text-[#494740]">{p.payoutMethod.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#7A776D]">{p.reference}</td>
                    <td className="py-3 px-4">
                      {p.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-2.5 w-2.5" />
                          En cours de traitement
                        </span>
                      )}
                      {p.status === 'successful' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="h-2.5 w-2.5" />
                          Virement effectué
                        </span>
                      )}
                      {p.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-red-50 text-red-700 border border-red-200">
                          <X className="h-2.5 w-2.5" />
                          Échoué (Solde recrédité)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Personnalisation Code */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="bg-white border-[#E5E1D8] text-[#1C1B18] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[#C9A96E]" />
                <h3 className="font-serif font-bold text-base text-[#1C1B18]">Personnaliser votre code</h3>
              </div>
              <button 
                onClick={() => setShowCodeModal(false)}
                className="text-[#7A776D] hover:text-[#1C1B18]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomCode} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-[#494740] font-medium mb-1">
                  Nouveau code personnalisé (ex: votre prénom ou nom de média)
                </label>
                <div className="flex items-center">
                  <span className="text-xs font-mono text-[#7A776D] bg-[#f5f3ef] px-2.5 py-2 rounded-l border border-r-0 border-[#E5E1D8]">
                    easywork.com/?ref=
                  </span>
                  <Input
                    required
                    value={customCodeInput}
                    onChange={(e) => setCustomCodeInput(e.target.value.toLowerCase())}
                    placeholder="mon-nom"
                    className="rounded-l-none bg-[#fbf9f5] border-[#E5E1D8] text-xs h-9 font-mono"
                  />
                </div>
                {codeError && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">{codeError}</p>
                )}
              </div>

              <div className="p-3 bg-[#fbf9f5] border border-[#E5E1D8] rounded text-[11px] text-[#7A776D] space-y-1">
                <p>⚠️ <strong>Attention :</strong> Cette personnalisation ne peut être effectuée qu&apos;<strong>une seule fois</strong>.</p>
                <p>Format : lettres minuscules, chiffres et tirets uniquement (3 à 30 caractères).</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCodeModal(false)}
                  className="border-[#E5E1D8] text-xs h-9"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1C1B18] hover:bg-[#2E2C27] text-white text-xs h-9 px-4 font-medium"
                >
                  Confirmer mon code
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Confirmation Retrait */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="bg-white border-[#E5E1D8] text-[#1C1B18] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#C9A96E]" />
                <h3 className="font-serif font-bold text-base text-[#1C1B18]">Confirmer le Virement</h3>
              </div>
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="text-[#7A776D] hover:text-[#1C1B18]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-[#494740]">
              <div className="p-4 rounded bg-[#fbf9f5] border border-[#E5E1D8] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7A776D]">Montant viré :</span>
                  <strong className="text-base font-serif font-bold text-[#1C1B18]">
                    {partner.availableBalance.toFixed(2)} $
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A776D]">Méthode sélectionnée :</span>
                  <strong className="capitalize text-[#1C1B18]">
                    {payoutMethod === 'mobile_money' ? `${networkOrBank} (${phoneOrAccount})` : `${networkOrBank} (${phoneOrAccount})`}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A776D]">Bénéficiaire :</span>
                  <span className="text-[#1C1B18] font-medium">{accountOwner || partner.name}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#7A776D]">
                En validant, le montant sera débité de votre solde disponible et l&apos;ordre de virement sera transmis immédiatement à la passerelle Flutterwave Transfers.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutModal(false)}
                  disabled={isWithdrawing}
                  className="border-[#E5E1D8] text-xs h-9"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmPayout}
                  disabled={isWithdrawing}
                  className="bg-[#1C1B18] hover:bg-[#2E2C27] text-white text-xs h-9 px-4 font-semibold"
                >
                  {isWithdrawing ? 'Envoi en cours...' : `Confirmer et virer ${partner.availableBalance.toFixed(2)} $`}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

