import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { experience } = await request.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Deepseek manquante dans la configuration.' }, { status: 500 });
    }

    if (!experience || !Array.isArray(experience)) {
      return NextResponse.json({ error: 'Expériences invalides.' }, { status: 400 });
    }

    const systemPrompt = `Tu es un expert en recrutement et optimisation de CV pour les systèmes ATS.
Ton rôle est d'analyser les expériences fournies par l'utilisateur et de suggérer des améliorations concrètes pour chaque point de l'expérience (impact quantifiable, verbe d'action, mots-clés ATS).
Renvoie UNIQUEMENT un objet JSON avec une clé "suggestions" contenant une liste d'objets. 
Chaque objet suggestion DOIT avoir ce format exact :
{
  "id": "un identifiant unique (string)",
  "expId": "l'ID de l'expérience concernée (number)",
  "pointIndex": "l'index du point (highlight) concerné dans le tableau de l'expérience (number)",
  "icon": "un nom d'icône Material Symbols, par exemple: format_quote, spellcheck, insights",
  "title": "Titre court de la suggestion",
  "description": "Pourquoi faire ce changement (ex: 'Verbe faible')",
  "suggestion": "La nouvelle phrase améliorée complète à utiliser",
  "accepted": false,
  "dismissed": false
}`;

    const userPrompt = `Voici mes expériences actuelles :\n\n${JSON.stringify(experience, null, 2)}\n\nGénère 2 à 4 suggestions d'amélioration pertinentes sur certains points précis.`;

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
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Deepseek API Error:", err);
      return NextResponse.json({ error: 'Erreur lors de la communication avec Deepseek.' }, { status: response.status });
    }

    const data = await response.json();
    let parsedContent;
    try {
      parsedContent = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse Deepseek response:", data.choices[0].message.content);
      return NextResponse.json({ error: 'Format de réponse invalide de la part de l\'IA.' }, { status: 500 });
    }

    return NextResponse.json({ suggestions: parsedContent.suggestions || [] });
  } catch (error: any) {
    console.error('AI Suggestion error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
