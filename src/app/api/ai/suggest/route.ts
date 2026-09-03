import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { experience, cvTitle, summary, skills } = await request.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Deepseek manquante dans la configuration.' }, { status: 500 });
    }

    if (!experience || !Array.isArray(experience)) {
      return NextResponse.json({ error: 'Expériences invalides.' }, { status: 400 });
    }

    // Extraire les expériences réelles avec leurs points réels
    const validExperiences = experience
      .filter((exp: any) => exp && (exp.title || exp.company || (exp.highlights && exp.highlights.length > 0)))
      .slice(0, 5)
      .map((exp: any, idx: number) => ({
        id: exp.id != null ? String(exp.id) : `exp-${idx}`,
        title: String(exp.title || 'Poste').slice(0, 100),
        company: String(exp.company || 'Entreprise').slice(0, 100),
        highlights: Array.isArray(exp.highlights)
          ? exp.highlights.map((h: any) => String(h || '').trim()).filter((h: string) => h.length > 0)
          : []
      }));

    // Trouver tous les points d'expérience réels
    const allPoints: { expId: string; pointIndex: number; text: string; role: string }[] = [];
    validExperiences.forEach((exp) => {
      exp.highlights.forEach((h: string, pIdx: number) => {
        allPoints.push({
          expId: exp.id,
          pointIndex: pIdx,
          text: h,
          role: `${exp.title} chez ${exp.company}`
        });
      });
    });

    if (allPoints.length === 0) {
      return NextResponse.json({
        suggestions: [
          {
            id: `sug-${Date.now()}`,
            expId: validExperiences[0]?.id || 'exp1',
            pointIndex: 0,
            originalText: 'Aucune description rédigée',
            icon: 'edit_note',
            title: 'Rédigez votre première réalisation',
            description: 'Ajoutez une phrase décrivant une mission ou un résultat concret dans vos expériences.',
            suggestion: 'Piloté des projets clés avec rigueur en respectant les délais et les exigences de qualité.',
            accepted: false,
            dismissed: false
          }
        ]
      });
    }

    const systemPrompt = `Tu es un assistant éditorial expert en recrutement et optimisation de CV ATS.
Tu dois analyser les PHRASES RÉELLES du candidat et proposer des améliorations fidèles.

CONTEXTE DU CANDIDAT :
- Titre / Métier : ${cvTitle || 'Professionnel'}
- Résumé : ${summary || 'Non précisé'}
- Compétences déclarées : ${Array.isArray(skills) ? skills.join(', ') : 'Générales'}

CONSIGNES STRICTES DE FIDÉLITÉ (ANTI-HALLUCINATION) :
1. Tu dois choisir exactement 2 phrases parmi les points réels fournis.
2. Pour chaque phrase choisie :
   - "originalText" DOIT reprendre EXACTEMENT le texte actuel du candidat.
   - "suggestion" DOIT être la version reformulée de CETTE MÊME phrase : commence par un verbe d'action au participe passé ou à l'infinitif, conserve le sens et le métier d'origine, et rend la formulation plus dynamique et professionnelle.
   - N'invente JAMAIS de technologie, d'entreprise ou de mission absente du texte d'origine.
   - "expId" DOIT être l'identifiant exact fourni dans les données.
   - "pointIndex" DOIT être l'index numérique exact du point.

Format JSON strict :
{
  "suggestions": [
    {
      "id": "sug-1",
      "expId": "identifiant exact",
      "pointIndex": 0,
      "originalText": "texte original exact du point",
      "icon": "insights",
      "title": "Titre court du conseil (ex: Verbe d'action plus fort)",
      "description": "Pourquoi améliorer cette formulation",
      "suggestion": "La phrase reformulée fidèle et percutante",
      "accepted": false,
      "dismissed": false
    }
  ]
}`;

    const userPrompt = `Voici les phrases réelles actuellement écrites sur mon CV :\n${JSON.stringify(allPoints, null, 2)}\n\nSélectionne 2 phrases et reformule-les de façon percutante en restant 100% fidèle à ce que j'ai fait.`;

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
      console.error("Deepseek API Error:", err);
      return NextResponse.json({ error: 'Erreur de communication avec l\'IA.' }, { status: response.status });
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

    let parsedContent: any = null;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (innerErr) {}
      }
    }

    if (parsedContent && Array.isArray(parsedContent.suggestions) && parsedContent.suggestions.length > 0) {
      // S'assurer que chaque suggestion a un originalText
      const enriched = parsedContent.suggestions.map((sug: any) => {
        if (!sug.originalText) {
          const matched = allPoints.find(p => String(p.expId) === String(sug.expId) && p.pointIndex === Number(sug.pointIndex));
          if (matched) {
            sug.originalText = matched.text;
          }
        }
        return sug;
      });
      return NextResponse.json({ suggestions: enriched });
    }

    // Fallback dynamique basé sur les VRAIS points du candidat
    const firstPoint = allPoints[0];
    return NextResponse.json({
      suggestions: [
        {
          id: `sug-${Date.now()}-1`,
          expId: firstPoint.expId,
          pointIndex: firstPoint.pointIndex,
          originalText: firstPoint.text,
          icon: 'insights',
          title: 'Renforcer la formulation',
          description: 'Remplacez la formulation passive par une action mesurable.',
          suggestion: `Optimisé : ${firstPoint.text} avec un souci constant d'efficacité et d'impact opérationnel.`,
          accepted: false,
          dismissed: false
        }
      ]
    });
  } catch (error: any) {
    console.error('AI Suggestion error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
