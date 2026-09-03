import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { jobDescription, cvData } = await request.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Deepseek manquante dans la configuration.' }, { status: 500 });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Description de poste manquante ou invalide.' }, { status: 400 });
    }

    const sanitizedJobDesc = jobDescription.slice(0, 10000).trim();
    const sanitizedCvData = cvData ? JSON.stringify(cvData).slice(0, 15000) : null;

    const systemPrompt = `Tu es un auditeur de recrutement et parseur ATS ultra-rigoureux.
Tu analyses le CV RÉEL du candidat face à une OFFRE D'EMPLOI.

CONSIGNES STRICTES D'ANTI-HALLUCINATION :
1. "strengths" (Points forts) : Ne cite QUE des compétences, technologies, diplômes ou expériences RÉELLEMENT mentionnés dans le profil du candidat ET demandés par l'offre. N'INVENTE AUCUN fait non présent dans le CV.
2. "gaps" (Compétences manquantes) : Ne cite QUE des exigences explicitement demandées dans l'offre d'emploi mais que le candidat N'A PAS dans son CV.
3. "keywords" : Les mots-clés stratégiques demandés dans l'offre d'emploi.
4. "score" : Un pourcentage réaliste (0-100) calculé objectivement selon le taux de couverture des prérequis de l'offre par le CV.

Format JSON strict à respecter :
{
  "jobTitle": "Titre du poste extrait de l'offre",
  "score": 75,
  "scoreLabel": "Évaluation synthétique (ex: Très bon profil pour ce poste)",
  "strengths": [
    { "skill": "Compétence avérée du CV", "detail": "Présente dans le CV et répondant au besoin de l'offre" }
  ],
  "gaps": [
    { "skill": "Compétence requise absente", "detail": "Exigée dans l'annonce mais absente du profil actuel" }
  ],
  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3"]
}`;

    const userPrompt = `OFFRE D'EMPLOI CIBLÉE :
${sanitizedJobDesc}

CV RÉEL DU CANDIDAT :
${sanitizedCvData || 'Profil générique de base.'}

Produis l'analyse de concordance objective sans rien inventer.`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.2,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Deepseek API Error:', err);
      return NextResponse.json({ error: 'Erreur lors de la communication avec Deepseek.' }, { status: response.status });
    }

    const data = await response.json();
    let rawContent = data.choices[0]?.message?.content || '';

    // Nettoyage markdown
    rawContent = rawContent.trim();
    if (rawContent.startsWith('```json')) {
      rawContent = rawContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let result;
    try {
      result = JSON.parse(rawContent);
    } catch (e) {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ error: 'Format de réponse invalide de l\'IA.' }, { status: 500 });
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analyze job error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
