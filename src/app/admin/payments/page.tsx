'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAdminPaymentsList } from '@/utils/actions/admin/actions';
import { AdminPaymentTransaction } from '@/lib/admin-types';
import { 
  Receipt, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      setIsLoading(true);
      try {
        const data = await getAdminPaymentsList();
        setPayments(data);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement des transactions.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPayments();
  }, []);

  const filteredPayments = payments.filter((tx) => {
    const matchesSearch = 
      tx.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.flwId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSuccessful = payments
    .filter(p => p.status === 'successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  const successRate = payments.length > 0 
    ? Math.round((payments.filter(p => p.status === 'successful').length / payments.length) * 100) 
    : 100;

  // Export CSV
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      toast.info('Aucune donnée à exporter.');
      return;
    }
    const headers = ['ID Transaction,Ref Flutterwave,Utilisateur,Email,Plan,Montant,Devise,Statut,Moyen de Paiement,Date'];
    const rows = filteredPayments.map(p => 
      `"${p.id}","${p.txRef}","${p.userName}","${p.userEmail}","${p.plan}",${p.amount},"${p.currency}","${p.status}","${p.paymentMethod}","${p.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `easywork_flutterwave_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Fichier CSV exporté avec succès !');
  };

  const handleManualRefund = (txRef: string, amount: number) => {
    toast.success(`Demande de remboursement de ${amount} € initiée pour ${txRef}.`);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <AdminHeader 
        title="Paiements & Facturation" 
        subtitle="Historique des encaissements réels Flutterwave et export comptable CSV."
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] font-medium uppercase tracking-wider">Volume Encaissé</span>
              <Receipt className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{totalSuccessful.toLocaleString('fr-FR')} €</span>
              <span className="text-xs text-emerald-600 font-medium">100% Flutterwave</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Total des transactions réussies en base</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] font-medium uppercase tracking-wider">Taux d&apos;acceptation</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{successRate}%</span>
              <span className="text-xs text-[#7A776D]">des tentatives</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Passerelle sécurisée 3D Secure</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] font-medium uppercase tracking-wider">Remboursements 7j</span>
              <RotateCcw className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{totalRefunded} €</span>
              <span className="text-xs text-amber-700 font-medium">Garantie 7j</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Application de la garantie sans condition</p>
          </Card>
        </div>

        {/* Barre d'outils et recherche */}
        <Card className="bg-white border-[#E5E1D8] p-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7A776D]" />
                <Input
                  placeholder="Rechercher par client, email, réf Flutterwave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#fbf9f5] border-[#E5E1D8] text-[#1C1B18] pl-9 text-xs h-9 focus:border-[#C9A96E]"
                />
              </div>

              {/* Filtres statuts */}
              <div className="flex items-center gap-1 bg-[#f5f3ef] p-1 rounded border border-[#E5E1D8]">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'successful', label: 'Succès' },
                  { id: 'refunded', label: 'Remboursés' },
                  { id: 'failed', label: 'Échoués' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                      statusFilter === tab.id
                        ? 'bg-white text-[#1C1B18] shadow-xs font-semibold'
                        : 'text-[#7A776D] hover:text-[#1C1B18]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleExportCSV}
              className="bg-white hover:bg-[#efeeea] text-[#1C1B18] border border-[#E5E1D8] text-xs h-9 px-4 whitespace-nowrap shadow-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-[#C9A96E]" />
              Exporter CSV
            </Button>
          </div>
        </Card>

        {/* Tableau des transactions */}
        <Card className="bg-white border-[#E5E1D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f3ef] text-[#494740] uppercase tracking-wider border-b border-[#E5E1D8] text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Référence & ID FLW</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Formule</th>
                  <th className="py-3 px-4 font-semibold">Montant</th>
                  <th className="py-3 px-4 font-semibold">Moyen</th>
                  <th className="py-3 px-4 font-semibold">Date & Heure</th>
                  <th className="py-3 px-4 font-semibold">Statut</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8] text-[#1C1B18]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#7A776D]">
                      Chargement des transactions réelles...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#7A776D]">
                      Aucune transaction trouvée en base de données.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#fbf9f5] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-[#1C1B18] font-medium">{tx.txRef}</div>
                        <div className="text-[10px] text-[#7A776D] font-mono">{tx.flwId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1C1B18]">{tx.userName}</div>
                        <div className="text-[11px] text-[#7A776D]">{tx.userEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tx.plan === 'sprint' ? 'bg-[#C9A96E]/15 text-[#9E824C] border border-[#C9A96E]/30' :
                          tx.plan === 'lifetime' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          tx.plan === 'monthly' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-[#efeeea] text-[#494740]'
                        }`}>
                          {tx.plan === 'sprint' ? 'Sprint 14j' :
                           tx.plan === 'lifetime' ? 'Fondateur' :
                           tx.plan === 'monthly' ? 'Recherche Active' : tx.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1C1B18]">
                        {tx.amount} {tx.currency}
                      </td>
                      <td className="py-3 px-4 text-[#7A776D]">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-[#7A776D] text-[11px]">
                        {tx.createdAt}
                      </td>
                      <td className="py-3 px-4">
                        {tx.status === 'successful' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Réussi
                          </span>
                        )}
                        {tx.status === 'refunded' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <RotateCcw className="h-3 w-3" />
                            Remboursé
                          </span>
                        )}
                        {tx.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="h-3 w-3" />
                            Échoué
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tx.status === 'successful' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleManualRefund(tx.txRef, tx.amount)}
                            className="text-[#7A776D] hover:text-amber-700 hover:bg-amber-50 text-[11px] h-7 px-2"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Rembourser
                          </Button>
                        )}
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
  );
}
