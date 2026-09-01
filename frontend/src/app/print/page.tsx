"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TEMPLATES, getTemplateComponent } from '@/components/templates';
import { CVData } from '@/types/cv';

function PrintContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') || 'modern';
  
  const [cvData, setCvData] = useState<CVData | null>(null);

  useEffect(() => {
    // Dans un cas réel de prod, on ferait un fetch(`/api/v1/cvs/${cvId}`)
    // Pour l'instant, le backend nous passera peut-être la donnée via un store
    // ou la page lira le sessionStorage si c'est exécuté côté client.
    
    // Si c'est Playwright qui ouvre la page, il peut injecter les données dans `window.cvData`
    const win = window as any;
    if (win.cvData) {
      setCvData(win.cvData);
    } else {
      // Fallback au local (pour tester l'aperçu dans son navigateur localement)
      const mockData: CVData = {
        header: { name: 'Jean Dupont', title: 'Directeur Marketing', location: 'Paris, France', email: 'jean@email.com', phone: '+33612345678' },
        experience: [],
        education: [],
        skills: []
      };
      setCvData(mockData);
    }
  }, []);

  if (!cvData) return <div>Chargement du CV...</div>;

  return (
    <div className="w-full h-full bg-white text-black p-0 m-0">
       {/* Inject global styles for print hiding if needed, though this page is specifically FOR print */}
       <style dangerouslySetInnerHTML={{__html: `
          body { margin: 0; padding: 0; background: white; }
          @page { size: A4; margin: 0; }
       `}} />
       {React.createElement(getTemplateComponent(templateId), { data: cvData })}
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PrintContent />
    </Suspense>
  );
}
