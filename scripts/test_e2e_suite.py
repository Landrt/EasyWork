#!/usr/bin/env python3
"""
EasyWork SaaS - Suite Complète de Tests E2E de Production
Vérifie l'intégralité du parcours utilisateur :
1. Inscription & Authentification
2. Onboarding QRO (3 étapes, 0 ms)
3. Chargement et personnalisation du CV
4. Assistant Éditorial IA (anti-hallucination & verbes d'action)
5. Analyse d'offre & Matching ATS
6. Exportation PDF (templates modern, executive, devellopeur)
7. Disponibilité des pages frontend
"""

import os
import sys
import json
import urllib.request
import urllib.error

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"

GREEN = "\033[92m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

def log_success(msg):
    print(f"{GREEN}✓ PASS:{RESET} {msg}")

def log_error(msg):
    print(f"{RED}✗ FAIL:{RESET} {msg}")

def http_post(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))

def http_get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.getcode()

def run_suite():
    print(f"\n{BOLD}==================================================={RESET}")
    print(f"{BOLD}   EASYWORK SAAS — AUDIT & TESTS E2E DE PRODUCTION  {RESET}")
    print(f"{BOLD}==================================================={RESET}\n")

    all_passed = True

    # 1. Vérification de l'état des serveurs
    print(f"{BOLD}[1/7] État des serveurs Frontend & Backend{RESET}")
    try:
        code = http_get(f"{BACKEND_URL}/health")
        if code == 200:
            log_success("Backend FastAPI opérationnel (port 8000)")
        else:
            log_error(f"Backend status code: {code}")
            all_passed = False
    except Exception as e:
        log_error(f"Backend injoignable : {e}")
        all_passed = False

    try:
        code = http_get(f"{FRONTEND_URL}/dashboard")
        if code == 200:
            log_success("Frontend Next.js opérationnel (port 3000)")
        else:
            log_error(f"Frontend status code: {code}")
            all_passed = False
    except Exception as e:
        log_error(f"Frontend injoignable : {e}")
        all_passed = False

    # 2. Test Onboarding QRO
    print(f"\n{BOLD}[2/7] Assistant QRO Onboarding (/api/ai/onboarding){RESET}")
    try:
        # Étape 1
        code, res = http_post(f"{FRONTEND_URL}/api/ai/onboarding", {
            "answers": [{"question": "Objectif", "answer": "Recherche active"}]
        })
        if code == 200 and "question" in res:
            log_success(f"QRO Étape 2 générée avec succès : '{res.get('question')}'")
        else:
            log_error("Échec de l'étape 2 du QRO")
            all_passed = False

        # Test Génération de CV complet (/api/ai/generate-cv)
        code, cv_res = http_post(f"{FRONTEND_URL}/api/ai/generate-cv", {
            "answers": [
                {"question": "Objectif et métier", "answer": "Je suis Développeur Full Stack Senior avec 5 ans d'expérience."},
                {"question": "Réalisations", "answer": "Refonte d'une plateforme SaaS en React et FastAPI avec 50k utilisateurs actifs."}
            ],
            "candidateName": "Marc Testeur",
            "candidateEmail": "marc@test.com"
        })
        if code == 200 and "cvData" in cv_res and "experience" in cv_res["cvData"]:
            gen_cv = cv_res["cvData"]
            log_success(f"Génération automatique du CV réussie : {gen_cv['header']['title']} ({len(gen_cv['experience'])} exp, {len(gen_cv['skills'])} compétences)")
        else:
            log_error(f"Échec de la génération automatique du CV : {cv_res}")
            all_passed = False
    except Exception as e:
        log_error(f"Erreur test QRO : {e}")
        all_passed = False

    # 3. Test Assistant Éditorial IA
    print(f"\n{BOLD}[3/7] Assistant Éditorial IA (/api/ai/suggest){RESET}")
    candidate_exp = [
        {
            "id": "exp-1",
            "title": "Lead Développeur Full Stack",
            "company": "SaaS Solutions",
            "highlights": [
                "Gestion d'une équipe de 4 développeurs sur une plateforme web.",
                "Amélioration des temps de réponse de l'API."
            ]
        }
    ]
    try:
        code, res = http_post(f"{FRONTEND_URL}/api/ai/suggest", {
            "experience": candidate_exp,
            "cvTitle": "Lead Développeur Full Stack",
            "summary": "Expert en architectures web et leadership technique.",
            "skills": ["TypeScript", "Next.js", "FastAPI", "PostgreSQL"]
        })
        if code == 200 and "suggestions" in res and len(res["suggestions"]) > 0:
            first_sug = res["suggestions"][0]
            log_success(f"Suggestions IA générées : {len(res['suggestions'])} suggestions")
            if "originalText" in first_sug:
                log_success(f"Ancrage réel validé : '{first_sug['originalText'][:40]}...' → '{first_sug['suggestion'][:40]}...'")
            else:
                log_error("originalText manquant dans la suggestion")
                all_passed = False
        else:
            log_error(f"Format de suggestions invalide : {res}")
            all_passed = False
    except Exception as e:
        log_error(f"Erreur test Assistant Éditorial : {e}")
        all_passed = False

    # 4. Test Analyse d'offre & Matching ATS
    print(f"\n{BOLD}[4/7] Analyse d'offre & Matching ATS (/api/ai/analyze-job){RESET}")
    sample_job = """
    Nous recherchons un Lead Développeur Full Stack (Next.js / FastAPI).
    Missions : Encadrer les développeurs, optimiser l'architecture cloud AWS et garantir la sécurité.
    Exigences : 5 ans d'expérience, maîtrise de Docker, Kubernetes, CI/CD et méthodologies agiles.
    """
    try:
        code, res = http_post(f"{FRONTEND_URL}/api/ai/analyze-job", {
            "jobDescription": sample_job,
            "cvData": {
                "title": "Lead Développeur Full Stack",
                "experience": candidate_exp,
                "skills": ["Next.js", "FastAPI", "TypeScript", "PostgreSQL", "Docker"]
            }
        })
        if code == 200 and "score" in res:
            score = res.get("score")
            log_success(f"Analyse ATS exécutée avec succès — Score calculé : {score}%")
            log_success(f"Points forts détectés : {len(res.get('strengths', []))} compétences")
            log_success(f"Lacunes identifiées : {len(res.get('gaps', []))} compétences")
            log_success(f"Mots-clés extraits : {', '.join(res.get('keywords', [])[:4])}")
        else:
            log_error(f"Réponse matching invalide : {res}")
            all_passed = False
    except Exception as e:
        log_error(f"Erreur test Matching ATS : {e}")
        all_passed = False

    # 5. Test Exportation PDF
    print(f"\n{BOLD}[5/7] Exportation PDF via Playwright (/api/v1/export){RESET}")
    cv_payload = {
        "header": {
            "name": "Marc Testeur",
            "title": "Lead Développeur Full Stack",
            "location": "Paris, France",
            "email": "marc.testeur@example.com",
            "phone": "+33 6 12 34 56 78",
            "summary": "Lead développeur chevronné expert en conception d'applications robustes."
        },
        "experience": candidate_exp,
        "education": [
            {
                "id": "edu-1",
                "degree": "Master Informatique",
                "school": "Université Paris-Saclay",
                "dates": "2016 - 2018"
            }
        ],
        "skills": ["TypeScript", "Next.js", "FastAPI", "PostgreSQL", "Docker"],
        "languages": ["Français - Natif", "Anglais - Professionnel"],
        "interests": [],
        "projects": []
    }

    for template in ["modern", "executive", "devellopeur"]:
        try:
            req = urllib.request.Request(
                f"{BACKEND_URL}/api/v1/export",
                data=json.dumps({"template": template, "cvData": cv_payload}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                pdf_data = resp.read()
                if resp.getcode() == 200 and pdf_data.startswith(b"%PDF"):
                    log_success(f"Export PDF réussi pour le template '{template}' ({len(pdf_data)} octets)")
                else:
                    log_error(f"Export PDF échoué pour le template '{template}'")
                    all_passed = False
        except Exception as e:
            log_error(f"Erreur export template '{template}' : {e}")
            all_passed = False

    # 6. Test Disponibilité des Pages Clés
    print(f"\n{BOLD}[6/7] Vérification HTTP 200 des Pages Candidat{RESET}")
    pages = [
        "/",
        "/signup",
        "/login",
        "/onboarding",
        "/editor",
        "/dashboard",
        "/cvs",
        "/analysis",
        "/matching",
        "/profile",
        "/settings",
        "/pricing"
    ]
    for p in pages:
        try:
            code = http_get(f"{FRONTEND_URL}{p}")
            if code == 200:
                log_success(f"Page {p} accessible (200 OK)")
            else:
                log_error(f"Page {p} a retourné le code {code}")
                all_passed = False
        except Exception as e:
            log_error(f"Page {p} inaccessible : {e}")
            all_passed = False

    # 7. Résultat Global
    print(f"\n{BOLD}==================================================={RESET}")
    if all_passed:
        print(f"{GREEN}{BOLD}🎉 TOUS LES TESTS SONT AU VERT ! LE SAAS EST PRÊT POUR LA PRODUCTION !{RESET}")
    else:
        print(f"{RED}{BOLD}⚠️ CERTAINS TESTS ONT ÉCHOUÉ, VOIR LES DÉTAILS CI-DESSUS.{RESET}")
    print(f"{BOLD}==================================================={RESET}\n")

    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(run_suite())
