import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { answers, candidateName, candidateEmail } = await request.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Deepseek manquante.' }, { status: 500 });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Aucune réponse fournie pour générer le CV.' }, { status: 400 });
    }

    const conversationContext = answers.map((a: any, i: number) => `Q${i+1}: ${a.question}\nR: ${a.answer}`).join('\n\n');

    const systemPrompt = `Tu es un rédacteur d'élite de CV professionnels et expert en optimisation ATS.
À partir des réponses ouvertes fournies par le candidat, ton objectif est de générer un CV COMPLET, valorisant, prêt à l'emploi et impeccablement rédigé.

CONSIGNES DE RÉDACTION :
1. "header" :
   - name : "${candidateName || 'Mon Prénom Nom'}"
   - title : Un titre professionnel clair et percutant (ex: "Développeur Full Stack Senior" ou "Responsable Communication & Marketing")
   - location : Ville réaliste (ex: "Paris, France" ou ville mentionnée)
   - email : "${candidateEmail || 'contact@email.com'}"
   - phone : "+33 6 00 00 00 00"
   - summary : Un paragraphe d'introduction accrocheur de 2 à 3 phrases mettant en valeur ses forces et sa valeur ajoutée.

2. "experience" :
   - Rédige 1 à 3 expériences professionnelles basées sur ce que le candidat a décrit.
   - Pour chaque expérience :
     - title : Titre du poste
     - company : Nom de l'entreprise (ou entreprise représentative si non précisée)
     - location : Ville
     - dates : Période cohérente (ex: "2022 - Présent", "2020 - 2022")
     - highlights : 2 à 3 puces de réalisations majeures rédigées avec verbes d'action forts et impact mesurable.

3. "education" :
   - 1 ou 2 formations/diplômes cohérents avec le niveau mentionné.

4. "skills" :
   - 6 à 9 compétences clés techniques et méthodologiques adaptées au profil.

5. "languages" :
   - ["Français - Langue maternelle", "Anglais - Professionnel"]

Format JSON strict à respecter :
{
  "header": {
    "name": "Prénom Nom",
    "title": "Titre du Métier",
    "location": "Ville, Pays",
    "email": "email@example.com",
    "phone": "+33 6 00 00 00 00",
    "summary": "Résumé percutant..."
  },
  "experience": [
    {
      "id": "exp-1",
      "title": "Intitulé du poste",
      "company": "Nom de l'entreprise",
      "location": "Paris, France",
      "dates": "2022 - Présent",
      "highlights": [
        "Réalisation avec verbe d'action et métrique...",
        "Mission clé accomplie avec succès..."
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "degree": "Diplôme obtenu",
      "school": "École ou Université",
      "dates": "2018 - 2021"
    }
  ],
  "skills": ["Compétence 1", "Compétence 2", "Compétence 3", "Compétence 4", "Compétence 5", "Compétence 6"],
  "languages": ["Français - Natif", "Anglais - Professionnel"],
  "interests": [],
  "projects": []
}`;

    const userPrompt = `Voici les informations partagées par le candidat lors du QRO :\n\n${conversationContext}\n\nGénère le CV complet et structuré prêt à l'emploi.`;

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
        max_tokens: 1500,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Deepseek generation error:', err);
      return NextResponse.json({ error: 'Erreur lors de la génération du CV par l\'IA.' }, { status: response.status });
    }

    const data = await response.json();
    let rawContent = data.choices[0]?.message?.content || '';

    rawContent = rawContent.trim();
    if (rawContent.startsWith('```json')) {
      rawContent = rawContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let cvData;
    try {
      cvData = JSON.parse(rawContent);
    } catch (e) {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        cvData = JSON.parse(match[0]);
      } else {
        throw new Error('Format de CV généré invalide.');
      }
    }

    if (cvData && cvData.header) {
      if (candidateName && candidateName.trim()) {
        cvData.header.name = candidateName.trim();
      }
      if (candidateEmail && candidateEmail.trim()) {
        cvData.header.email = candidateEmail.trim();
      }
    }

    return NextResponse.json({ cvData });
  } catch (error: any) {
    console.error('Generate CV error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
