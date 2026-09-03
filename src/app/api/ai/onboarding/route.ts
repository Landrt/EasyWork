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

    // Limite stricte à 3 questions max pour un QRO ultra-rapide et dynamique
    if (answers.length >= 3) {
      return NextResponse.json({ done: true });
    }

    const sanitizedAnswers = answers.map((a: any) => ({
      question: String(a.question || '').slice(0, 150),
      answer: String(a.answer || '').slice(0, 200)
    }));

    const systemPrompt = `Assistant QRO pour création de CV professionnel.
Pose UNE question courte avec 4 options max pour affiner le profil du candidat.
Réponses reçues (${sanitizedAnswers.length}/3) :
${sanitizedAnswers.map((a: any, i: number) => `Q${i+1}: ${a.question} -> ${a.answer}`).join('\n')}

Format JSON strict :
{
  "done": false,
  "question": "Question courte et percutante",
  "type": "radio",
  "options": ["Option 1", "Option 2", "Option 3", "Autre"],
  "placeholder": null
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
          { role: 'user', content: 'Prochaine question rapide.' }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 150,
        temperature: 0.3,
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
