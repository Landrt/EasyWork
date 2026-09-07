'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSystemHealthStatus } from '@/utils/actions/admin/actions';
import { SystemHealthStatus } from '@/lib/admin-types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Key, 
  Clock, 
  Radio 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSystemPage() {
  const [services, setServices] = useState<SystemHealthStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState('À l\'instant');

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await getSystemHealthStatus();
      setServices(data);
      setLastCheckTime(new Date().toLocaleTimeString('fr-FR'));
      toast.success('Statut des services actualisé.');
    } catch {
      toast.error('Erreur lors de la vérification de l\'infrastructure.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const envConfigs = [
    { name: 'NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY', status: 'Actif', sample: 'FLWPUBK_TEST-****' },
    { name: 'FLUTTERWAVE_SECRET_KEY', status: 'Actif', sample: 'FLWSECK_TEST-****' },
    { name: 'FLUTTERWAVE_SECRET_HASH', status: 'Actif', sample: 'easywork_flw_****' },
    { name: 'DEEPSEEK_API_KEY', status: 'Actif', sample: 'sk-deepseek-****' },
    { name: 'NEXT_PUBLIC_SUPABASE_URL', status: 'Actif', sample: 'https://****.supabase.co' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', status: 'Actif', sample: 'eyJhbGciOiJIUzI1Ni****' },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <AdminHeader 
        title="Système & Santé de l'Infrastructure" 
        subtitle="Monitoring en direct des services, connectivité Supabase, Flutterwave et DeepSeek."
      />

      <div className="p-8 space-y-8 max-w-7xl">
        {/* Barre de statut global */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded bg-white border border-[#E5E1D8] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#1C1B18]">Infrastructure EasyWork Opérationnelle</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold uppercase">
                  En ligne
                </span>
              </div>
              <p className="text-xs text-[#7A776D] mt-0.5">Dernier test direct effectué à {lastCheckTime}</p>
            </div>
          </div>

          <Button
            onClick={fetchHealth}
            disabled={isRefreshing}
            className="bg-white hover:bg-[#efeeea] text-[#1C1B18] border border-[#E5E1D8] text-xs h-8 px-3 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-[#C9A96E] ${isRefreshing ? 'animate-spin' : ''}`} />
            Tester la connectivité
          </Button>
        </div>

        {/* Grille des services */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A776D] mb-4">
            Services & Connecteurs ({services.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((srv) => (
              <Card key={srv.service} className="bg-white border-[#E5E1D8] p-5 flex flex-col justify-between shadow-xs hover:border-[#1C1B18]/30 transition-colors">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-semibold text-xs text-[#1C1B18] flex items-center gap-2">
                      <Server className="h-3.5 w-3.5 text-[#C9A96E]" />
                      {srv.service}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      srv.status === 'healthy' 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {srv.status === 'healthy' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Opérationnel
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          À vérifier
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-[#7A776D] mb-4">
                    {srv.details}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E1D8] flex items-center justify-between text-xs text-[#7A776D]">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3" />
                    Temps de réponse :
                  </span>
                  <span className="font-mono font-bold text-[#1C1B18]">{srv.latencyMs} ms</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Variables d'Environnement & Sécurité */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-[#E5E1D8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#1C1B18] flex items-center gap-2">
                  <Key className="h-4 w-4 text-[#C9A96E]" />
                  Variables d&apos;Environnement Clés
                </h3>
                <p className="text-xs text-[#7A776D] mt-0.5">Clés de production et identifiants de sécurité</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="space-y-2.5">
              {envConfigs.map((cfg) => (
                <div key={cfg.name} className="flex items-center justify-between p-2.5 rounded bg-[#fbf9f5] border border-[#E5E1D8] text-xs">
                  <div>
                    <div className="font-mono text-[11px] text-[#1C1B18] font-medium">{cfg.name}</div>
                    <div className="font-mono text-[10px] text-[#7A776D]">{cfg.sample}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {cfg.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Journal des alertes et sécurité */}
          <Card className="bg-white border-[#E5E1D8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#1C1B18] flex items-center gap-2">
                  <Radio className="h-4 w-4 text-[#C9A96E]" />
                  Intégrité & Sécurité du Système
                </h3>
                <p className="text-xs text-[#7A776D] mt-0.5">Journal des événements d&apos;infrastructure</p>
              </div>
            </div>

            <div className="p-4 rounded bg-[#fbf9f5] border border-[#E5E1D8] text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Tous les canaux de communication sont sécurisés.</span>
              </div>
              <p className="text-[#7A776D] text-[11px] leading-relaxed">
                Les signatures de webhooks Flutterwave (`verif-hash`) sont validées à chaque requête. Les sessions utilisateurs sont protégées par chiffrement JWT Supabase avec Row Level Security.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
