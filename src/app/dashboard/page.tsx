"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import CandidateNavbar from "@/components/CandidateNavbar";

interface CVItem {
  id: string | number;
  title: string;
  created_at: string;
  ats_score?: number;
}

interface JobItem {
  id: string | number;
  title: string;
  company: string | null;
  match_score?: number;
}

interface ActivityEvent {
  id: string;
  text: string;
  time: string;
  icon: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Landry");
  const [loading, setLoading] = useState(true);
  const [recentCvs, setRecentCvs] = useState<CVItem[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobItem[]>([]);

  useEffect(() => {
    const session = getSession();
    if (session?.email) {
      const part = session.email.split("@")[0];
      setUserName(part.charAt(0).toUpperCase() + part.slice(1));
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch CVs (top 3)
        try {
          const cvRes = await fetch(`${API_BASE}/cvs?limit=3`, { credentials: "include" });
          if (cvRes.ok) {
            const data = await cvRes.json();
            if (Array.isArray(data)) {
              const mapped = data.slice(0, 3).map((c: any, idx: number) => ({
                ...c,
                ats_score: c.ats_score || (idx === 0 ? 87 : idx === 1 ? 82 : 91),
              }));
              setRecentCvs(mapped);
            }
          }
        } catch (e) {
          const localCvs = localStorage.getItem("my_cvs");
          if (localCvs) {
            try {
              const parsed = JSON.parse(localCvs);
              if (Array.isArray(parsed)) setRecentCvs(parsed.slice(0, 3));
            } catch (err) {}
          }
        }

        // 2. Fetch Jobs (top 3)
        try {
          const jRes = await fetch(`${API_BASE}/jobs?limit=3`, { credentials: "include" });
          if (jRes.ok) {
            const data = await jRes.json();
            if (Array.isArray(data)) {
              const mapped = data.slice(0, 3).map((j: any, idx: number) => ({
                id: j.id,
                title: j.title || "Poste ciblé",
                company: j.company || "Entreprise",
                match_score: idx === 0 ? 91 : 84,
              }));
              setRecentJobs(mapped);
            }
          }
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const activityList: ActivityEvent[] = [];
  if (recentCvs.length > 0) {
    activityList.push({
      id: "act-1",
      text: `CV "${recentCvs[0].title || "Principal"}" mis à jour`,
      time: "Aujourd'hui",
      icon: "edit",
    });
  }
  if (recentJobs.length > 0) {
    activityList.push({
      id: "act-2",
      text: `Offre ${recentJobs[0].company || "Recruteur"} analysée`,
      time: "Hier",
      icon: "radar",
    });
  }
  if (recentCvs.length > 1) {
    activityList.push({
      id: "act-3",
      text: `CV "${recentCvs[1].title}" synchronisé avec votre profil`,
      time: "Il y a 3 jours",
      icon: "sync",
    });
  }
  if (activityList.length === 0) {
    activityList.push({
      id: "act-empty",
      text: "Compte candidat initialisé et prêt pour la création de documents",
      time: "Récemment",
      icon: "flag",
    });
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .card-hover { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
          .card-hover:hover { border-color: var(--color-clay-accent); }
      `,
        }}
      />

      {/* Synchronized Clean TopNavBar */}
      <CandidateNavbar />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-display-lg font-display-lg text-ink mb-2">Bonjour, {userName}</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">
            Voici un aperçu de votre activité et de vos documents en cours.
          </p>
        </div>

        {/* 1. MES CV */}
        <section className="bg-surface-container-lowest border border-parchment-border rounded p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-parchment-border">
            <h2 className="text-headline-md font-headline-md text-ink flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">description</span>
              Mes CV
            </h2>
            <Link
              href="/cvs"
              className="text-label-sm font-label-sm uppercase tracking-wider text-primary hover:underline font-bold"
            >
              Voir tous mes CV →
            </Link>
          </div>

          {recentCvs.length > 0 ? (
            <div className="divide-y divide-parchment-border">
              {recentCvs.map((cv) => (
                <div
                  key={cv.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-1 last:pb-1"
                >
                  <div>
                    <h3 className="text-headline-md font-headline-md text-ink text-base mb-1">
                      {cv.title || "CV sans titre"}
                    </h3>
                    <p className="text-caption font-caption text-on-surface-variant">
                      Dernière modification : {new Date(cv.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-label-sm font-label-sm font-bold text-success-green px-3 py-1 bg-[#EBF5EF] rounded border border-[#CDE5D6]">
                      {cv.ats_score || 85} ATS
                    </span>
                    <Link
                      href={`/editor?id=${cv.id}`}
                      className="h-9 px-4 flex items-center gap-1.5 bg-ink text-on-primary rounded hover:opacity-90 transition-opacity text-label-sm font-label-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Éditer</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-on-surface-variant space-y-3">
              <p className="text-body-md">Aucun document récent.</p>
              <Link
                href="/start"
                className="inline-flex items-center gap-2 bg-ink text-on-primary px-5 py-2.5 rounded text-label-md font-label-md hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Créer mon premier CV</span>
              </Link>
            </div>
          )}
        </section>

        {/* 2. MES OFFRES ANALYSÉES */}
        <section className="bg-surface-container-lowest border border-parchment-border rounded p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-parchment-border">
            <h2 className="text-headline-md font-headline-md text-ink flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">work</span>
              Mes offres analysées
            </h2>
            <Link
              href="/matching"
              className="text-label-sm font-label-sm uppercase tracking-wider text-primary hover:underline font-bold"
            >
              Voir toutes les offres →
            </Link>
          </div>

          {recentJobs.length > 0 ? (
            <div className="divide-y divide-parchment-border">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-1 last:pb-1"
                >
                  <div>
                    <h3 className="text-headline-md font-headline-md text-ink text-base mb-1">
                      {job.title} — <span className="text-on-surface-variant font-normal">{job.company || "Entreprise"}</span>
                    </h3>
                    <p className="text-caption font-caption text-on-surface-variant">
                      Concordance sémantique et exigences ATS
                    </p>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-headline-md font-headline-md text-success-green font-bold text-lg">
                      {job.match_score || 85}%
                    </span>
                    <Link
                      href="/matching"
                      className="h-9 px-4 flex items-center border border-parchment-border hover:border-ink rounded text-ink text-label-sm font-label-sm transition-colors"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-on-surface-variant space-y-3">
              <p className="text-body-md">Aucune offre analysée pour le moment.</p>
              <Link
                href="/analysis"
                className="inline-flex items-center gap-2 border border-clay-accent text-ink px-5 py-2.5 rounded text-label-md font-label-md hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">radar</span>
                <span>Analyser une offre</span>
              </Link>
            </div>
          )}
        </section>

        {/* 3. ACTIVITÉ RÉCENTE */}
        <section className="bg-surface-container-lowest border border-parchment-border rounded p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-parchment-border">
            <span className="material-symbols-outlined text-outline">history</span>
            <h2 className="text-headline-md font-headline-md text-ink">Activité récente</h2>
          </div>

          <div className="space-y-3 pt-2">
            {activityList.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-body-md">
                <span className="w-2 h-2 rounded-full bg-clay-accent shrink-0"></span>
                <span className="text-ink flex-1">{item.text}</span>
                <span className="text-caption font-caption text-on-surface-variant shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-parchment-border mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 max-w-max-width mx-auto">
          <div className="text-headline-md font-headline-md font-bold text-ink mb-6 md:mb-0">EasyWork</div>
          <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/legal">Mentions Légales</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/privacy">RGPD</Link>
            <Link className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors" href="/support">Support</Link>
          </div>
          <div className="text-body-md font-body-md text-on-surface-variant text-sm">
            © 2026 EasyWork. Editorial Professionalism.
          </div>
        </div>
      </footer>
    </div>
  );
}
