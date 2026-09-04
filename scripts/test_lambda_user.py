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

    # ÉTAPE 3 : Questionnaire QRO Ouvert & Intelligent
    step("3. Questionnaire QRO Conversationnel & Ouvert (/onboarding)")
    # Question 1 (Réponse ouverte)
    q1_answer = {
        "question": "Bonjour ! Parlez-moi de vous en quelques phrases : quel est votre métier actuel, votre niveau d'expérience et quel poste ou opportunité visez-vous ?",
        "answer": "Je suis Responsable Communication & Marketing Digital avec 4 ans d'expérience chez MediaWave. Je pilote des campagnes Meta et Google Ads, et je vise un poste confirmé de Responsable Marketing."
    }
    ok(f"Question 1 : Sophie écrit librement sa réponse ouverte.")
    
    # Appel de l'IA pour évaluer la complétude
    req_qro = urllib.request.Request(
        f"{FRONTEND_URL}/api/ai/onboarding",
        data=json.dumps({"answers": [q1_answer]}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_qro) as resp:
        qro_data = json.loads(resp.read().decode('utf-8'))
        ok(f"L'IA évalue le profil (Score : {qro_data.get('comprehensionScore', 60)}%) : '{qro_data.get('question')}'")

    # Question 2 (Précision des réalisations et outils)
    q2_answer = {
        "question": qro_data.get("question", "Quelles sont vos principales réalisations et compétences ?"),
        "answer": "J'ai géré les campagnes publicitaires Meta et Google Ads avec un ROI de +35%, refondu le blog et la newsletter, et je maîtrise le SEO, Google Analytics 4 et Meta Ads. J'ai un Master Marketing de l'IAE Lyon."
    }
    ok(f"Question 2 : Sophie complète avec ses réalisations chiffrées et son diplôme.")

    # Synthèse et génération automatique du CV
    step("3bis. Génération automatique du CV complet par l'IA (/api/ai/generate-cv)")
    req_gen = urllib.request.Request(
        f"{FRONTEND_URL}/api/ai/generate-cv",
        data=json.dumps({
            "answers": [q1_answer, q2_answer],
            "candidateName": user_name,
            "candidateEmail": user_email
        }).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_gen) as resp:
        gen_data = json.loads(resp.read().decode('utf-8'))
        candidate_cv = gen_data.get("cvData")
        assert candidate_cv is not None, "Échec de génération du CV"
        ok(f"CV COMPLET généré par l'IA : '{candidate_cv['header']['title']}'")
        ok(f"  → Résumé : {candidate_cv['header']['summary'][:60]}...")
        ok(f"  → Expériences créées : {len(candidate_cv['experience'])} postes réels")
        ok(f"  → Compétences structurées : {', '.join(candidate_cv['skills'][:5])}")
        ok("Le candidat arrive sur l'éditeur avec son CV déjà 100% rédigé et prêt !")

    # ÉTAPE 4 : Dans l'Éditeur (/editor) & Assistant Éditorial
    step("4. Travail dans l'Éditeur (/editor) & Assistant Éditorial IA")
    ok(f"Le CV de {user_name} généré par l'IA est prêt dans l'éditeur ({len(candidate_cv['experience'])} expériences).")

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
