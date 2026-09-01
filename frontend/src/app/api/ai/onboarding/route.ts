import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Deepseek manquante.' }, { status: 500 });
    }

    const systemPrompt = `Tu es un assistant de personnalisation pour un outil de création de CV professionnel.
Tu dois poser des questions courtes et pertinentes pour mieux comprendre le profil de l'utilisateur et personnaliser son CV.

L'utilisateur a déjà répondu à ${answers.length} question(s). Les réponses précédentes sont :
${answers.map((a: any, i: number) => `Q${i+1}: "${a.question}" → Réponse: "${a.answer}"`).join('\n')}

Si tu as déjà collecté 3 réponses ou suffisamment d'informations (objectif, secteur, niveau), retourne { "done": true }.

Sinon, génère la prochaine question la plus pertinente pour personnaliser le CV. 
Retourne UNIQUEMENT un objet JSON avec ce format :
{
  "done": false,
  "question": "La question à poser (courte, directe)",
  "type": "radio" ou "text",
  "options": ["option1", "option2", "option3", "option4"] (si type = radio, sinon null),
  "placeholder": "Texte d'exemple si type = text" (sinon null)
}

Exemples de questions utiles (à adapter selon les réponses précédentes) :
- Quel est votre secteur d'activité ?
- Quel niveau d'expérience avez-vous ? (Junior / Confirmé / Senior / Expert)
- Avez-vous des compétences techniques spécifiques à mettre en avant ?
- Dans quel type d'entreprise souhaitez-vous travailler ?`;

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
          { role: 'user', content: 'Génère la prochaine question.' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Deepseek error:', err);
      return NextResponse.json({ error: 'Erreur Deepseek.' }, { status: response.status });
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Onboarding AI error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
