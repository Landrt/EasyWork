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

    if (jobDescription.length > 15000) {
      return NextResponse.json({ error: 'Description de poste trop longue (max 15 000 caractères).' }, { status: 400 });
    }

    const sanitizedJobDesc = jobDescription.slice(0, 15000).trim();
    const sanitizedCvData = cvData ? JSON.stringify(cvData).slice(0, 20000) : null;

    const systemPrompt = `Tu es un expert en recrutement ATS (Applicant Tracking System).
Analyse l'offre d'emploi et le profil CV fournis, puis retourne UNIQUEMENT un objet JSON avec ce format exact :
{
  "jobTitle": "Titre du poste extrait de l'offre",
  "score": 68,
  "scoreLabel": "Score modéré. Des optimisations ciblées sont nécessaires.",
  "strengths": [
    { "skill": "Nom de la compétence", "detail": "Explication de pourquoi c'est un point fort" }
  ],
  "gaps": [
    { "skill": "Compétence manquante", "detail": "Pourquoi c'est important pour ce poste" }
  ],
  "keywords": ["mot-clé 1", "mot-clé 2"]
}
Le score doit être un nombre entre 0 et 100.
Retourne au maximum 4 points forts et 4 manques.`;

    const userPrompt = `OFFRE D'EMPLOI:
${sanitizedJobDesc}

PROFIL DU CANDIDAT:
${sanitizedCvData || 'Profil non disponible - analyser uniquement l\'offre.'}

Génère l'analyse de compatibilité.`;

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
        temperature: 0.5,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Deepseek API Error:', err);
      return NextResponse.json({ error: 'Erreur lors de la communication avec Deepseek.' }, { status: response.status });
    }

    const data = await response.json();
    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      return NextResponse.json({ error: 'Format de réponse invalide de l\'IA.' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Job analysis error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
