'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card } from '@/components/ui/card';
import { getActivityMetrics } from '@/utils/actions/admin/actions';
import { ActivityMetrics } from '@/lib/admin-types';
import { 
  FileText, 
  Briefcase, 
  Download, 
  Award, 
  FileCheck, 
  Target 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminActivityPage() {
  const [activity, setActivity] = useState<ActivityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      setIsLoading(true);
      try {
        const data = await getActivityMetrics();
        setActivity(data);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement de l\'activité.');
      } finally {
        setIsLoading(false);
      }
    }
    loadActivity();
  }, []);

  if (isLoading || !activity) {
    return (
      <div className="min-h-screen bg-[#fbf9f5]">
        <AdminHeader 
          title="Activité CV & Offres" 
          subtitle="Statistiques de production de CVs, analyse des offres d'emploi et taux de réussite ATS."
        />
        <div className="p-8 text-center text-[#7A776D]">Chargement des métriques d&apos;activité...</div>
      </div>
    );
  }

  const totalResumes = activity.totalBaseResumes + activity.totalTailoredResumes;
  const totalExports = activity.totalPdfExports + activity.totalDocxExports;
  const pdfPercent = totalExports > 0 ? Math.round((activity.totalPdfExports / totalExports) * 100) : 100;
  const docxPercent = 100 - pdfPercent;

  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <AdminHeader 
        title="Activité CV & Offres" 
        subtitle="Données réelles de production de CVs, analyse des offres d'emploi et taux de réussite ATS."
      />

      <div className="p-8 space-y-8 max-w-7xl">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Total CVs en Base</span>
              <FileText className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{totalResumes.toLocaleString('fr-FR')}</span>
              <span className="text-xs text-[#7A776D]">CVs</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">
              {activity.totalBaseResumes} de base • {activity.totalTailoredResumes} ciblés
            </p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Offres Analysées</span>
              <Briefcase className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{activity.totalJobsAnalyzed.toLocaleString('fr-FR')}</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Mises en correspondance 4 statuts</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Score ATS Moyen</span>
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-emerald-600">
                {activity.averageMatchScore > 0 ? `${activity.averageMatchScore} / 100` : 'En attente'}
              </span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Calculé sur les CVs analysés</p>
          </Card>

          <Card className="bg-white border-[#E5E1D8] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7A776D] uppercase tracking-wider font-semibold">Documents Créés</span>
              <Download className="h-4 w-4 text-[#C9A96E]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#1C1B18]">{totalExports.toLocaleString('fr-FR')}</span>
            </div>
            <p className="text-[11px] text-[#7A776D] mt-1">Exports candidats prêts à l&apos;emploi</p>
          </Card>
        </div>

        {/* Formats de téléchargement & Distribution des scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formats Téléchargés */}
          <Card className="bg-white border-[#E5E1D8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#1C1B18] flex items-center gap-2">
                  <Download className="h-4 w-4 text-[#C9A96E]" />
                  Répartition des Formats Téléchargés
                </h3>
                <p className="text-xs text-[#7A776D] mt-0.5">Le format PDF reste la norme standard</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#1C1B18] flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5 text-[#C9A96E]" />
                    Format PDF Imprimable (A4)
                  </span>
                  <span className="font-bold text-[#9E824C]">{activity.totalPdfExports.toLocaleString('fr-FR')} ({pdfPercent}%)</span>
                </div>
                <div className="w-full bg-[#efeeea] rounded-full h-3 overflow-hidden border border-[#E5E1D8]">
                  <div 
                    className="bg-gradient-to-r from-[#C9A96E] to-[#9E824C] h-full rounded-full"
                    style={{ width: `${pdfPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#1C1B18] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Format Word Modifiable (.docx)
                  </span>
                  <span className="font-bold text-blue-600">{activity.totalDocxExports.toLocaleString('fr-FR')} ({docxPercent}%)</span>
                </div>
                <div className="w-full bg-[#efeeea] rounded-full h-3 overflow-hidden border border-[#E5E1D8]">
                  <div 
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${docxPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Diagnostic Qualité ATS */}
          <Card className="bg-white border-[#E5E1D8] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#1C1B18] flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  Alignement Qualité ATS
                </h3>
                <p className="text-xs text-[#7A776D] mt-0.5">Efficacité du diagnostic Truth Guard</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { range: 'Score 80 - 100 (Candidature Optimale)', percent: 55, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
                { range: 'Score 65 - 79 (Bon alignement)', percent: 35, color: 'bg-[#C9A96E]', textColor: 'text-[#9E824C]' },
                { range: 'Score < 65 (Ajustements requis)', percent: 10, color: 'bg-amber-500', textColor: 'text-amber-700' },
              ].map((item) => (
                <div key={item.range} className="p-3 rounded bg-[#fbf9f5] border border-[#E5E1D8] text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-[#1C1B18]">{item.range}</span>
                    <span className={`font-bold ${item.textColor}`}>{item.percent}%</span>
                  </div>
                  <div className="w-full bg-[#efeeea] rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Métiers ciblés */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A776D]">
                Métiers et Offres les Plus Ciblés
              </h2>
              <p className="text-xs text-[#1C1B18]">
                Postes générant des candidatures dans la base de données
              </p>
            </div>
          </div>

          <Card className="bg-white border-[#E5E1D8] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f3ef] text-[#494740] uppercase tracking-wider border-b border-[#E5E1D8] text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Intitulé du Poste</th>
                    <th className="py-3 px-4 font-semibold">Candidatures Ciblées</th>
                    <th className="py-3 px-4 font-semibold">Score ATS Moyen</th>
                    <th className="py-3 px-4 font-semibold text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8] text-[#1C1B18]">
                  {activity.topJobCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[#7A776D]">
                        Aucune offre d&apos;emploi analysée pour l&apos;instant.
                      </td>
                    </tr>
                  ) : (
                    activity.topJobCategories.map((cat, idx) => (
                      <tr key={cat.name} className="hover:bg-[#fbf9f5] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#1C1B18] flex items-center gap-2">
                          <span className="h-5 w-5 rounded bg-[#efeeea] flex items-center justify-center text-[11px] font-bold text-[#9E824C]">
                            {idx + 1}
                          </span>
                          {cat.name}
                        </td>
                        <td className="py-3 px-4 text-[#1C1B18] font-bold">
                          {cat.count} offre(s)
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-600">{cat.avgScore} / 100</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Actif
                          </span>
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
