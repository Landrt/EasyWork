import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Deepseek manquante.' }, { status: 500 });
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Format de réponses invalide.' }, { status: 400 });
    }

    // Plafond de sécurité : après 4 questions ouvertes, on valide le profil pour ne pas bloquer l'utilisateur
    if (answers.length >= 4) {
      return NextResponse.json({ done: true, comprehensionScore: 100 });
    }

    const sanitizedAnswers = answers.map((a: any) => ({
      question: String(a.question || '').slice(0, 200),
      answer: String(a.answer || '').slice(0, 500)
    }));

    const systemPrompt = `Tu es un assistant recruteur expert en création de CV professionnel (format QRO - Question à Réponse Ouverte).
Ton but est de comprendre le profil du candidat pour pouvoir générer son CV complet.

Pour bâtir un CV complet et percutant, tu as besoin de 4 piliers d'information :
1. Titre du poste visé ou secteur / objectif
2. Au moins une expérience professionnelle concrète (entreprise, poste, missions principales ou réalisations)
3. Compétences ou technologies clés
4. Formation / diplôme principal

ANALYSE DES RÉPONSES FOURNIES JUSQU'ICI :
${sanitizedAnswers.map((a: any, i: number) => `Q${i+1}: ${a.question}\nR: ${a.answer}`).join('\n\n')}

CONSIGNES :
- Évalue si tu as assez d'informations pour générer un CV de qualité professionnelle.
- Si le candidat a déjà donné suffisamment de détails (ou si toutes les dimensions clés sont identifiées), retourne "done": true avec un "comprehensionScore" de 90 à 100.
- Si une information cruciale manque (par exemple ses expériences concrètes, ses outils/compétences ou ses diplômes), pose UNE SEULE question ouverte, bienveillante et ciblée pour compléter le profil.
- PAS DE QCM, PAS DE CHOIX MULTIPLES. La question doit appeler une réponse textuelle libre du candidat.
- Fournis un "placeholder" concret pour inspirer sa réponse.

Format JSON strict :
{
  "done": false,
  "question": "Question ouverte courte et percutante",
  "placeholder": "Exemple : J'ai travaillé 2 ans chez X sur le projet Y...",
  "comprehensionScore": 65
}`;

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
          { role: 'user', content: 'Analyse les réponses et donne la suite (nouvelle question ou done: true si profil suffisant).' }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Deepseek error:', err);
      return NextResponse.json({ error: 'Erreur Deepseek.' }, { status: response.status });
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
        result = { done: true, comprehensionScore: 90 };
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Onboarding AI error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
