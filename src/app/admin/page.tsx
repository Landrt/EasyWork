import { 
  getAdminKPIs, 
  getMRRChartData, 
  getAdminAuditLogs 
} from '@/utils/actions/admin/actions';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  Handshake, 
  ArrowUpRight, 
  ShieldAlert, 
  Activity, 
  FileText 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const kpis = await getAdminKPIs();
  const chartData = await getMRRChartData();
  const logs = await getAdminAuditLogs();

  // Calcul du SVG pour la courbe 30 jours
  const maxRev = Math.max(...chartData.map(d => d.revenue), 10);
  const minRev = Math.min(...chartData.map(d => d.revenue), 0);
  const svgWidth = 800;
  const svgHeight = 220;

  const points = chartData.map((d, index) => {
    const x = (index / (chartData.length - 1 || 1)) * (svgWidth - 60) + 30;
    const y = svgHeight - 30 - ((d.revenue - minRev) / (maxRev - minRev || 1)) * (svgHeight - 60);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${chartData.map((d, index) => {
    const x = (index / (chartData.length - 1 || 1)) * (svgWidth - 60) + 30;
    const y = svgHeight - 30 - ((d.revenue - minRev) / (maxRev - minRev || 1)) * (svgHeight - 60);
    return `${x},${y}`;
  }).join(' ')} ${svgWidth - 30},${svgHeight} 30,${svgHeight}`;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fbf9f5]">
      <AdminHeader 
        title="Vue d'ensemble de la Plateforme" 
        subtitle="Supervision en temps réel des données Supabase et de la facturation Flutterwave" 
      />

      <main className="p-8 space-y-8 max-w-7xl">
        {/* 4 KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Users */}
          <Card className="p-5 rounded border border-[#E5E1D8] bg-white text-[#1C1B18] shadow-xs">
            <div className="flex items-center justify-between text-[#7A776D] text-xs font-medium">
              <span>Base Utilisateurs</span>
              <Users className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-[#1C1B18]">{kpis.totalUsers}</span>
              <span className="text-[11px] text-emerald-600 flex items-center font-medium">
                Inscrits réels
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#7A776D] flex justify-between border-t border-[#E5E1D8] pt-2">
              <span>Gratuits : <strong className="text-[#1C1B18]">{kpis.freeUsers}</strong></span>
              <span>Payants : <strong className="text-[#9E824C]">{kpis.paidUsers}</strong></span>
            </div>
          </Card>

          {/* MRR Estimé */}
          <Card className="p-5 rounded border border-[#E5E1D8] bg-white text-[#1C1B18] shadow-xs">
            <div className="flex items-center justify-between text-[#7A776D] text-xs font-medium">
              <span>MRR Estimé (Mensuel)</span>
              <TrendingUp className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-[#1C1B18]">{kpis.estimatedMRR} €</span>
              <span className="text-[11px] text-emerald-600 flex items-center font-medium">
                Actif
              </span>
            </div>
            <p className="mt-2 text-[11px] text-[#7A776D] border-t border-[#E5E1D8] pt-2">
              Volume total encaissé ce mois : <strong className="text-[#1C1B18]">{kpis.monthlyRevenue} €</strong>
            </p>
          </Card>

          {/* Taux de Conversion */}
          <Card className="p-5 rounded border border-[#E5E1D8] bg-white text-[#1C1B18] shadow-xs">
            <div className="flex items-center justify-between text-[#7A776D] text-xs font-medium">
              <span>Taux de Conversion Payant</span>
              <CreditCard className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-[#1C1B18]">{kpis.conversionRate}%</span>
              <span className="text-[11px] text-emerald-600 flex items-center font-medium">
                {kpis.paidUsers}/{kpis.totalUsers || 1}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#7A776D] flex justify-between border-t border-[#E5E1D8] pt-2">
              <span>Sprint (13€)</span>
              <span>Mensuel (22€)</span>
              <span>Fondateur (69€)</span>
            </div>
          </Card>

          {/* Partenaires / Affiliés */}
          <Card className="p-5 rounded border border-[#E5E1D8] bg-white text-[#1C1B18] shadow-xs">
            <div className="flex items-center justify-between text-[#7A776D] text-xs font-medium">
              <span>Partenaires Affiliés</span>
              <Handshake className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-[#1C1B18]">{kpis.activeAffiliates}</span>
              <span className="text-[11px] text-[#7A776D]">codes actifs</span>
            </div>
            <p className="mt-2 text-[11px] text-[#7A776D] border-t border-[#E5E1D8] pt-2">
              Programme 30% commission Flutterwave
            </p>
          </Card>
        </div>

        {/* Graphique d'Évolution 30 jours & Métriques Produit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visualisation SVG Courbe */}
          <Card className="p-6 rounded border border-[#E5E1D8] bg-white text-[#1C1B18] shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-base font-bold text-[#1C1B18]">
                  Évolution Financière & Utilisateurs (30 derniers jours)
                </h2>
                <p className="text-xs text-[#7A776D]">Données cumulées directes calculées depuis la base Supabase</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[#9E824C] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#C9A96E]" /> Revenus (€)
                </span>
                <span className="flex items-center gap-1 text-[#494740]">
                  <span className="h-2 w-2 rounded-full bg-[#1C1B18]" /> Utilisateurs
                </span>
              </div>
            </div>

            {/* SVG Plot */}
            <div className="relative w-full h-[220px] pt-4">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#C9A96E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="30" y1="30" x2={svgWidth - 30} y2="30" stroke="#E5E1D8" strokeDasharray="3 3" />
                <line x1="30" y1={svgHeight / 2} x2={svgWidth - 30} y2={svgHeight / 2} stroke="#E5E1D8" strokeDasharray="3 3" />
                <line x1="30" y1={svgHeight - 30} x2={svgWidth - 30} y2={svgHeight - 30} stroke="#E5E1D8" />

                {/* Area Fill */}
                <polygon points={areaPoints} fill="url(#goldGradient)" />

                {/* Revenue Line */}
                <polyline 
                  fill="none" 
                  stroke="#C9A96E" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  points={points} 
                />

                {/* Min & Max Labels */}
                <text x="35" y="24" fill="#7A776D" fontSize="10" fontFamily="sans-serif">{maxRev} €</text>
                <text x="35" y={svgHeight - 36} fill="#7A776D" fontSize="10" fontFamily="sans-serif">{minRev} €</text>
              </svg>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#7A776D] mt-2 px-6 border-t border-[#E5E1D8] pt-2">
              <span>{chartData[0]?.date || 'J-30'}</span>
              <span>{chartData[14]?.date || 'J-15'}</span>
              <span>{chartData[chartData.length - 1]?.date || 'Aujourd\'hui'}</span>
            </div>
          </Card>

          {/* Quick Health & Product KPIs */}
          <div className="space-y-4">
            <Card className="p-5 rounded border border-[#E5E1D8] bg-white text-[#1C1B18] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#9E824C] mb-2">
                <FileText className="h-4 w-4" />
                <span>Production Candidatures</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#7A776D]">CVs enregistrés en base :</span>
                  <span className="font-bold text-[#1C1B18]">{kpis.totalResumes}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#7A776D]">Offres analysées (4 statuts) :</span>
                  <span className="font-bold text-[#1C1B18]">{kpis.totalJobsAnalyzed}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#7A776D]">Score ATS moyen :</span>
                  <span className="font-bold text-emerald-600">{kpis.averageAtsScore > 0 ? `${kpis.averageAtsScore}/100` : 'En attente'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 rounded border border-[#E5E1D8] bg-white text-[#1C1B18] shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1B18] mb-2">
                <Activity className="h-4 w-4 text-[#C9A96E]" />
                <span>Statut Infrastructure</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A776D]">Supabase PostgreSQL</span>
                  <span className="text-emerald-600 font-medium">Connecté</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7A776D]">Passerelle Flutterwave</span>
                  <span className="text-emerald-600 font-medium">Opérationnelle</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7A776D]">Moteur IA DeepSeek</span>
                  <span className="text-emerald-600 font-medium">Prêt</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Flux d'Audit en Direct */}
        <Card className="p-6 rounded border border-[#E5E1D8] bg-white text-[#1C1B18] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-base font-bold text-[#1C1B18]">
                Flux d&apos;Audit & Activité en Direct
              </h2>
              <p className="text-xs text-[#7A776D]">
                Actions administratives et événements de paiement enregistrés
              </p>
            </div>
            <span className="text-[11px] text-[#7A776D]">Historique sécurisé</span>
          </div>

          <div className="divide-y divide-[#E5E1D8]">
            {logs.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7A776D]">
                Aucun événement d&apos;audit récent enregistré.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-[#fbf9f5] px-2 rounded transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${
                      log.severity === 'critical' ? 'bg-red-500' :
                      log.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <span className="font-semibold text-[#1C1B18]">{log.action}</span>
                      {log.targetUserEmail && (
                        <span className="text-[#7A776D] ml-2">sur {log.targetUserEmail}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-[#7A776D] whitespace-nowrap">
                    {log.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
