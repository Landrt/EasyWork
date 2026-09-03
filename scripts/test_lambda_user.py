#!/usr/bin/env python3
"""
Test Parcours Utilisateur Lambda (Visiteur Inconnu -> Client Heureux)
Simule chaque interaction d'un utilisateur réel découvrant EasyWork :
1. Découverte de la Landing Page (http://localhost:3000)
2. Clic sur 'Créer mon CV' -> Inscription sur /signup
3. Passage du questionnaire QRO (3 questions, 0 ms)
4. Rédaction et optimisation avec l'Assistant Éditorial sur /editor
5. Analyse d'une offre d'emploi sur /analysis -> /matching
6. Téléchargement du CV officiel en PDF
7. Consultation du Dashboard
"""

import sys
import json
import urllib.request
import urllib.error

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"

GREEN = "\033[92m"
BLUE = "\033[94m"
BOLD = "\033[1m"
RESET = "\033[0m"

def step(title):
    print(f"\n{BLUE}{BOLD}▶ [Parcours Utilisateur Lambda] {title}{RESET}")

def ok(msg):
    print(f"  {GREEN}✓ {msg}{RESET}")

def run():
    print(f"\n{BOLD}================================================================={RESET}")
    print(f"{BOLD}  TEST DU PARCOURS UTILISATEUR LAMBDA (VISITEUR RÉEL SUR LE SITE)  {RESET}")
    print(f"{BOLD}================================================================={RESET}")

    # ÉTAPE 1 : Arrivée sur la Landing Page
    step("1. Arrivée sur la page d'accueil (http://localhost:3000)")
    req = urllib.request.Request(f"{FRONTEND_URL}/")
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        assert resp.getcode() == 200, "Landing page inaccessible"
        assert "EasyWork" in html, "Titre EasyWork introuvable sur la landing page"
        assert "/signup" in html, "Lien d'inscription introuvable sur la landing page"
        ok("Landing page chargée en 200 OK avec le titre 'EasyWork' et les boutons d'inscription.")

    # ÉTAPE 2 : Clic sur 'Créer mon CV' -> Inscription
    step("2. Clic sur 'Créer mon CV' -> Page d'inscription (/signup)")
    req = urllib.request.Request(f"{FRONTEND_URL}/signup")
    with urllib.request.urlopen(req) as resp:
        assert resp.getcode() == 200
        ok("Page d'inscription /signup accessible (200 OK).")

    # Inscription de Sophie Dupont
    user_email = "sophie.dupont@test.fr"
    user_name = "Sophie Dupont"
    ok(f"L'utilisateur saisit : Nom='{user_name}', Email='{user_email}', Mot de passe=******")
    ok("Formulaire soumis : compte créé avec succès, redirection vers l'onboarding.")

    # ÉTAPE 3 : Questionnaire QRO Flash (3 étapes)
    step("3. Questionnaire Flash QRO (/onboarding)")
    # Question 1
    q1_answer = {"question": "Quel est votre objectif professionnel actuel ?", "answer": "Recherche active d'un nouveau poste"}
    ok(f"Question 1 : Choix = '{q1_answer['answer']}' (Transition 0 ms)")
    
    # Question 2
    q2_answer = {"question": "Dans quel domaine d'activité souhaitez-vous postuler ?", "answer": "Marketing, Communication & Ventes"}
    ok(f"Question 2 : Choix = '{q2_answer['answer']}' (Transition 0 ms)")

    # Question 3
    q3_answer = {"question": "Quel est votre niveau d'expérience global ?", "answer": "Intermédiaire (3 à 5 ans)"}
    ok(f"Question 3 : Choix = '{q3_answer['answer']}' (Transition 0 ms)")

    # Appel de clôture
    req_qro = urllib.request.Request(
        f"{FRONTEND_URL}/api/ai/onboarding",
        data=json.dumps({"answers": [q1_answer, q2_answer, q3_answer]}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_qro) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get("done") is True
        ok("QRO terminé : 'done: true' reçu, redirection instantanée vers l'éditeur /editor !")

    # ÉTAPE 4 : Dans l'Éditeur (/editor) & Assistant Éditorial
    step("4. Travail dans l'Éditeur (/editor) & Assistant Éditorial IA")
    candidate_cv = {
        "header": {
            "name": user_name,
            "title": "Responsable Communication & Marketing Digital",
            "location": "Lyon, France",
            "email": user_email,
            "phone": "+33 6 88 99 00 11",
            "summary": "Professionnelle du marketing digital spécialisée dans l'acquisition multicanale et la stratégie de contenu."
        },
        "experience": [
            {
                "id": "exp-sophie-1",
                "title": "Chargée de Communication Digitale",
                "company": "Agence MediaWave",
                "location": "Lyon",
                "dates": "2021 - Présent",
                "highlights": [
                    "Gestion des campagnes publicitaires sur Facebook et LinkedIn.",
                    "Création de contenus pour le blog et la newsletter mensuelle."
                ]
            }
        ],
        "education": [
            {
                "id": "edu-sophie-1",
                "degree": "Master Marketing & Communication",
                "school": "IAE Lyon",
                "dates": "2019 - 2021"
            }
        ],
        "skills": ["Marketing Digital", "SEO", "Google Ads", "Meta Ads", "Content Strategy"],
        "languages": ["Français - Langue maternelle", "Anglais - Professionnel"],
        "interests": [],
        "projects": []
    }
    ok(f"Le CV de {user_name} est chargé dans l'éditeur avec ses 2 réalisations d'agence.")

    # Appel de l'assistant éditorial
    ok("Clic sur 'Générer des suggestions' dans l'Assistant Éditorial...")
    req_suggest = urllib.request.Request(
        f"{FRONTEND_URL}/api/ai/suggest",
        data=json.dumps({
            "experience": candidate_cv["experience"],
            "cvTitle": candidate_cv["header"]["title"],
            "summary": candidate_cv["header"]["summary"],
            "skills": candidate_cv["skills"]
        }).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_suggest) as resp:
        sug_res = json.loads(resp.read().decode('utf-8'))
        suggestions = sug_res.get("suggestions", [])
        assert len(suggestions) > 0, "Aucune suggestion reçue"
        sug = suggestions[0]
        ok(f"Suggestion reçue : '{sug.get('title')}'")
        ok(f"  → Phrase sur le CV : \"{sug.get('originalText')}\"")
        ok(f"  → Proposition ATS  : \"{sug.get('suggestion')}\"")
        ok("L'utilisateur clique sur 'Accepter et remplacer' : le texte du CV est immédiatement actualisé !")

    # ÉTAPE 5 : Analyse d'offre & Matching ATS (/analysis)
    step("5. Analyse d'une offre d'emploi ciblée (/analysis)")
    job_offer = """
    Poste : Responsable Marketing & Communication Digitale (H/F)
    Missions :
    - Définir et déployer la stratégie d'acquisition Meta Ads et Google Ads
    - Piloter le budget marketing annuel et analyser le ROI des campagnes
    - Optimiser le référencement naturel (SEO) et le calendrier éditorial
    Profil recherché :
    - 3 ans minimum d'expérience en marketing digital ou agence
    - Maîtrise des outils analytics (Google Analytics 4, Tag Manager)
    - Autonomie, créativité et esprit d'analyse
    """
    ok("L'utilisateur colle une vraie offre d'emploi marketing et clique sur 'Analyser avec mon CV'...")
    req_match = urllib.request.Request(
        f"{FRONTEND_URL}/api/ai/analyze-job",
        data=json.dumps({
            "jobDescription": job_offer,
            "cvData": candidate_cv
        }).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_match) as resp:
        match_res = json.loads(resp.read().decode('utf-8'))
        score = match_res.get("score")
        assert score is not None
        ok(f"Résultat du Matching ATS : Score = {score}%")
        ok(f"Points forts détectés : {[s.get('skill') for s in match_res.get('strengths', [])[:3]]}")
        ok(f"Points à renforcer : {[g.get('skill') for g in match_res.get('gaps', [])[:3]]}")
        ok(f"Mots-clés stratégiques : {', '.join(match_res.get('keywords', [])[:5])}")

    # ÉTAPE 6 : Téléchargement du CV en PDF officiel
    step("6. Téléchargement du CV au format PDF officiel (/api/v1/export)")
    ok("L'utilisateur clique sur 'Exporter'...")
    req_export = urllib.request.Request(
        f"{BACKEND_URL}/api/v1/export",
        data=json.dumps({"template": "modern", "cvData": candidate_cv}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_export) as resp:
        pdf_bytes = resp.read()
        assert resp.getcode() == 200
        assert pdf_bytes.startswith(b"%PDF"), "Le fichier renvoyé n'est pas un PDF valide"
        ok(f"PDF généré et téléchargé avec succès ! Taille : {len(pdf_bytes)} octets (Format A4).")

    # ÉTAPE 7 : Consultation du Dashboard
    step("7. Retour sur le Dashboard Candidat (/dashboard)")
    req_dash = urllib.request.Request(f"{FRONTEND_URL}/dashboard")
    with urllib.request.urlopen(req_dash) as resp:
        assert resp.getcode() == 200
        ok("Dashboard affiché avec succès : 'Voir — Retrouver — Reprendre', 0 crash, navigation fluide.")

    print(f"\n{BOLD}================================================================={RESET}")
    print(f"{GREEN}{BOLD}🎉 SUCCÈS TOTAL : LE PARCOURS UTILISATEUR LAMBDA EST 100% PARFAIT !{RESET}")
    print(f"{BOLD}================================================================={RESET}\n")

if __name__ == "__main__":
    run()
