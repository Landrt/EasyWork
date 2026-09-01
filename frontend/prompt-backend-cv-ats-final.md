# Prompt de développement — Backend — SaaS CV × ATS (version finale)

## Rôle et cadrage
Tu es un développeur backend senior. Construis le backend du MVP d'un SaaS de CV en ligne optimisé ATS.

**Avant d'écrire la moindre ligne de code**, produis deux livrables et attends validation :
1. Un **plan d'implémentation** (arborescence de modules, découpage en phases — voir §11).
2. Un **modèle de données domaine par domaine** (voir §5bis) — ne saute pas cette étape pour foncer sur du SQL. Pour chaque donnée du profil candidat, tranche explicitement : quelle est sa source (import CV / QRO / manuel / IA / système), quelle est sa source de vérité, et doit-elle être une colonne relationnelle ou un champ JSON ? Justifie chaque choix en une phrase avant de créer la table correspondante.

Le périmètre est large (12 domaines fonctionnels, ~30 endpoints) : ne tente jamais un seul gros commit monolithique, avance phase par phase avec validation à chaque étape.

## 1. Contexte produit
Ce n'est pas « un éditeur de CV avec IA » : c'est un système qui comprend le profil réel du candidat ET l'offre visée avant de produire un CV adapté aux deux.

**Principe non négociable, à faire respecter techniquement** : l'IA ne doit jamais inventer une compétence, une expérience ou un chiffre que le candidat n'a pas fourni lui-même. Toute affirmation générée doit être rattachable à une donnée d'origine (CV importé, réponse QRO, ajout manuel) via le service transversal **Truth Guard** (§5.10 et §5bis.4).

## 2. État actuel et stack
Projet greenfield.

- **Framework** : Python/FastAPI
- **Base de données** : PostgreSQL — le modèle de données est fortement relationnel (utilisateurs, profils, CV versionnés en sections, offres, abonnements, parrainages), ce qui ne justifie pas une base documentaire
- **Stockage fichiers** : objet compatible S3 (PDF/DOCX importés, exports)
- **Cache / file d'attente** : Redis, pour les opérations asynchrones
- **Architecture** : monolithe modulaire, pas de microservices pour ce MVP — produit encore en validation, extraction possible plus tard si un goulot d'étranglement réel est mesuré (probablement la couche IA/traitement en premier)

## 3. Objectif fonctionnel
Livrer les 12 domaines du §5 et les endpoints du §6, avec :
- un modèle de permissions où **le backend est la seule source de vérité des droits d'accès** (jamais le frontend) ;
- un **pricing configurable**, jamais codé en dur (§7) ;
- un **modèle de données conçu domaine par domaine avant toute création de table** (§5bis).

## 4. Contraintes techniques
- Séparer routes / logique métier / accès aux données (pattern service layer), même sur les endpoints simples.
- Valider systématiquement les entrées en frontière d'API (schémas Pydantic) — ne jamais faire confiance à l'input du client, y compris pour le palier d'accès.
- Codes HTTP et gestion d'erreurs corrects dès le départ.
- Pagination/curseur sur toute liste pouvant grossir sans borne (CV, sessions QRO, parrainages, commissions, logs d'audit).
- Aucun secret ni clé API en dur.
- Opérations longues (parsing, appels IA, génération de PDF) via file d'attente asynchrone, jamais en bloquant la requête HTTP.

## 5. Domaines fonctionnels

1. **Auth & Users** : inscription, connexion, sessions/tokens, mot de passe oublié, palier d'accès, permissions. Compte utilisateur et profil candidat sont deux entités distinctes.
2. **Candidate Intelligence** : profil structuré (infos personnelles, résumé, expériences, compétences, formation, certifications, projets, langues, objectifs). Chaque élément référence sa provenance (import / QRO / ajout manuel).
3. **QRO Engine** : session (état, étape, historique) et boucle question → réponse → évaluation de suffisance → question complémentaire ou étape suivante, pilotée côté backend.
4. **CV Engine** : import (upload → validation → stockage → parsing → CV structuré ; PDF/DOCX) ; parser dédié avec correction possible ; modèle en sections typées et positionnées (plusieurs CV par profil) ; versioning ; 5 à 8 templates, sans marketplace.
5. **Job Intelligence** : stockage de l'offre (texte + métadonnées), pipeline texte → exigences → compétences → mots-clés → priorités → profil d'offre structuré.
6. **Matching Engine** : quatre statuts par élément (confirmé / partiel / non confirmé / manquant).
7. **ATS Engine** : score hybride (structure, mots-clés, exigences, mise en forme, pertinence) — jamais une valeur produite librement par le LLM ; présenté comme une estimation.
8. **Gap Analysis** : matching restitué en catégories lisibles.
9. **AI Optimization Engine** : suggestions portant original / proposition / raison / preuve source / confiance / statut (en attente / acceptée / rejetée / modifiée).
10. **Truth Guard** (service transversal) : avant application d'une suggestion, vérifie si l'information existe dans les preuves du candidat ; sinon bloque ou marque comme nécessitant confirmation.
11. **Subscription** : entitlements dérivés du palier ET d'une date d'expiration le cas échéant (§7).
12. **Affiliate Engine** : lien de parrainage → visiteur → attribution → inscription → abonnement → commission, taux piloté par politique (30 % uniforme au MVP, pas codé en dur).

## 5bis. Modèle de données — à concevoir domaine par domaine, dans cet ordre

Ne pas générer le schéma SQL complet en un bloc. Traiter chaque bloc ci-dessous séquentiellement, avec validation avant de passer au suivant. **Users → Candidate Profile → Experiences → Skills → Evidence est le cœur du produit et doit être conçu en premier.**

### Principe directeur : Candidate Profile = source de vérité unique
```
USER
  │
  ▼
CANDIDATE PROFILE (source de vérité)
  │
  ├── Experiences / Skills / Education / Projects / Certifications
          │
          ▼
     VERIFIED DATA
          │
    ┌─────┴──────┐
    ▼            ▼
   CV A         CV B   (représentations dérivées, pas la donnée elle-même)
```
Un CV n'est jamais la source de vérité — c'est une projection du profil, éventuellement optimisée pour une offre donnée. Un profil peut alimenter plusieurs CV distincts (ex. CV "Développeur backend" vs CV "Data Analyst").

### Bloc 1 — Users & Candidate Profile
- `users` (id, email, full_name, avatar_url, status, created_at, updated_at)
- `candidate_profiles` (id, user_id, headline, professional_summary, career_goal, target_roles, profile_status, completeness_score, created_at, updated_at) — relation 1→1 avec `users`
- Ne pas stocker les données du candidat dans une colonne JSON unique : les expériences, compétences, etc. doivent être des tables séparées (bloc 2).

### Bloc 2 — Experiences, Skills, Education, Projects (tables relationnelles, pas JSON)
- `experiences` (id, profile_id, company, position, start_date, end_date, is_current, description, achievements, created_at, updated_at)
- `skills` (id, profile_id, name, category, proficiency, source, verified) — jamais une simple colonne `skills: []`, car ces données doivent ensuite être comparées aux `job_requirements` pour le Matching Engine
- `educations`, `projects`, `certifications`, `languages` sur le même modèle relationnel

### Bloc 3 — Evidence (fondation de Truth Guard)
- `evidence` (id, profile_id, source_type [cv_import / qro / manual / user_confirmation], source_reference, raw_content, verified, created_at)
- Flux de vérification obligatoire avant toute suggestion IA :
```
AI CLAIM → Evidence Search → Evidence found ?
   YES → Allow suggestion
   NO  → Reject / Ask user for confirmation
```
- Chaque `ai_suggestion` doit référencer un ou plusieurs `evidence_ids` justifiant la proposition.

### Bloc 4 — Job Intelligence
- `jobs` (id, user_id, title, company, raw_description, status, created_at, updated_at)
- `job_requirements` (id, job_id, requirement, category, importance, mandatory, extracted_by) — un `job_requirement` type Python/Required/High/mandatory=true est l'exemple de référence
- `job_keywords`

### Bloc 5 — CV Engine
- `cvs` (id, user_id, profile_id, title, template_id, target_job_id nullable, status, created_at, updated_at)
- `cv_versions` (id, cv_id, version_number, content [JSON structuré — seul endroit où le JSON est justifié, car un CV est un document dont la forme varie], created_by [user/ai/system], created_at)
- `templates` (id, name, description, preview_url, configuration [JSON], is_active, created_at)

### Bloc 6 — Matching & ATS (séparés, liés à CV Version + Job)
- `match_analyses` (id, profile_id, cv_version_id, job_id, overall_score, skills_score, experience_score, keyword_score, education_score, strengths/gaps/recommendations [JSON au départ, normalisable plus tard], created_at)
- `ats_analyses` (id, cv_version_id, job_id, overall_score, formatting_score, keyword_score, readability_score, parsing_score, created_at)
- `ats_issues` (id, analysis_id, category, severity, message, recommendation)

### Bloc 7 — AI Suggestions
- `ai_suggestions` (id, cv_version_id, target_section, original_text, suggested_text, reason, evidence_ids, status [pending/accepted/rejected/edited], created_at)
- L'IA ne modifie jamais un CV directement : elle produit uniquement une proposition dans cette table, soumise à Truth Guard puis à l'action explicite du candidat.

### Bloc 8 — QRO
- `qro_sessions` (id, user_id, profile_id, status, current_step, progress, started_at, completed_at, updated_at)
- `qro_messages` (id, session_id, role [assistant/user], content, created_at)

### Bloc 9 — Subscription & Entitlements
- `plans`, `subscriptions` (id, user_id, plan_id, status, started_at, expires_at, provider_reference)
- Prévoir une couche `entitlements` pour ne jamais coder `if plan === "PRO"` en dur dans la logique métier, mais exposer des vérifications type `user.can("advanced_ats")`.

### Bloc 10 — Affiliate
- `affiliates` (id, user_id, affiliate_code, commission_rate, status, created_at) — `commission_rate` stocké en base (pas en dur), pour permettre plus tard des taux différenciés (partenaire spécial à 40% par ex.) sans changer l'architecture
- `affiliate_links`, `affiliate_clicks`, `affiliate_conversions`, `commissions`, `payouts`

### Grille de décision à appliquer à toute nouvelle donnée
| Question | Exemple |
|---|---|
| Quelle est sa source ? | user input / cv import / QRO / IA / système |
| Quelle est sa source de vérité ? | "Je connais Python" → Candidate Profile fait autorité ; une reformulation IA → ai_suggestion, jamais source de vérité |
| Relationnel ou JSON ? | Experiences/Skills/Education → table. CV content, résultats d'analyse IA, configuration de template → JSON justifié par la variabilité de forme |

## 6. Inventaire des endpoints (synchronisé avec les boutons du prompt frontend, son §6)
Chaque identifiant ci-dessous correspond exactement à un bouton du prompt frontend. Ne pas renommer un identifiant sans mettre à jour les deux prompts en miroir.

### AUTH
| Identifiant | Méthode / route indicative | Description |
|---|---|---|
| `AUTH.register` | POST /auth/register | Crée un compte utilisateur |
| `AUTH.login` | POST /auth/login | Authentifie, retourne un token de session |
| `AUTH.forgotPassword` | POST /auth/forgot-password | Envoie un email de réinitialisation |
| `AUTH.resetPassword` | POST /auth/reset-password | Réinitialise via token |
| `AUTH.updateProfile` | PATCH /auth/me | Met à jour les infos de compte |
| `AUTH.changePassword` | POST /auth/change-password | Change le mot de passe (connecté) |

### CV
| Identifiant | Méthode / route indicative | Description |
|---|---|---|
| `CV.create` | POST /cvs | Crée un CV depuis un template |
| `CV.import.upload` | POST /cvs/import | Upload, lance le parsing asynchrone |
| `CV.list` | GET /cvs | Liste les CV (paginé) |
| `CV.get` | GET /cvs/:id | Détail d'un CV |
| `CV.update` | PATCH /cvs/:id | Modifie titre/contenu |
| `CV.delete` | DELETE /cvs/:id | Supprime un CV |
| `CV.addSection` | POST /cvs/:id/sections | Ajoute une section |
| `CV.removeSection` | DELETE /cvs/:id/sections/:sectionId | Retire une section |
| `CV.reorderSections` | PATCH /cvs/:id/sections/order | Réordonne les sections |
| `CV.changeTemplate` | PATCH /cvs/:id/template | Change de template |
| `CV.export` | POST /cvs/:id/export | Génère un export (formats selon palier) |

### PROFILE
| Identifiant | Méthode / route indicative | Description |
|---|---|---|
| `PROFILE.update` | PATCH /profile | Corrige un élément du profil candidat |
| `PROFILE.confirm` | POST /profile/confirm | Valide le profil après import/QRO |

### QRO
| Identifiant | Méthode / route indicative | Description |
|---|---|---|
| `QRO.start` | POST /qro/sessions | Démarre une session (profil ou orientée offre) |
| `QRO.answer` | POST /qro/sessions/:id/answer | Envoie une réponse, reçoit la suite |
| `QRO.addManualInfo` | POST /qro/sessions/:id/manual | Ajoute un détail libre |
| `QRO.complete` | POST /qro/sessions/:id/complete | Clôture la session |

### JOB / MATCHING / IA
| Identifiant | Méthode / route indicative | Description |
|---|---|---|
| `JOB.analyze` | POST /jobs | Analyse une offre collée ou décrite |
| `MATCH.get` | GET /matches/:id | Résultat du matching CV↔offre |
| `AI.optimize` | POST /matches/:id/optimize | Lance l'optimisation IA (passe par Truth Guard) |
| `AI.suggestion.accept` | POST /suggestions/:id/accept | Applique une suggestion |
| `AI.suggestion.reject` | POST /suggestions/:id/reject | Rejette une suggestion |
| `AI.suggestion.edit` | PATCH /suggestions/:id | Modifie une suggestion avant application |
| `AI.suggestion.explain` | GET /suggestions/:id/explanation | Source et explication de la suggestion |

### SUBSCRIPTION / ACCOUNT / AFFILIATE
| Identifiant | Méthode / route indicative | Description |
|---|---|---|
| `SUBSCRIPTION.checkout` | POST /subscription/checkout | Paramètre `tier` (sprint / monthly / founder) |
| `SUBSCRIPTION.cancel` | POST /subscription/cancel | Résilie l'abonnement récurrent |
| `ACCOUNT.exportData` | GET /account/export | Export structuré des données personnelles (RGPD) |
| `ACCOUNT.delete` | DELETE /account | Suppression complète du compte |
| `AFFILIATE.getLink` | GET /affiliate/link | Lien de parrainage de l'utilisateur |
| `AFFILIATE.getStats` | GET /affiliate/stats | Historique parrainages/commissions |

## 7. Pricing à implémenter (framework grand-slam-offer)

### Raisonnement retenu
Le levier le plus faible de l'équation de valeur pour ce produit est la certitude perçue par l'acheteur (« est-ce que ça va vraiment marcher pour MOI, sur CETTE offre ») — renforcée par une preuve visible avant paiement (score et matching gratuits) et par Truth Guard. Structure retenue : un palier gratuit qui démontre la valeur, puis deux façons d'accéder au même niveau payant — courte durée ou récurrent — plutôt qu'un abonnement obligatoire, cohérent avec un usage souvent ponctuel et intensif.

### Grille (proposition à valider — pas encore confirmée par le porteur de projet)

| Palier | Prix | Contenu |
|---|---|---|
| Découverte (gratuit) | 0€ | 1 CV actif, templates limités, QRO standard, score ATS global uniquement, export PDF, historique limité |
| Sprint Candidature | 9€ / 14 jours, paiement unique | CV multiples liés à des offres, mots-clés manquants, ATS détaillé, export DOCX, mode réflexion du QRO, 1 lettre de motivation offerte, historique complet |
| Recherche Active | 15€ / mois | Identique au Sprint, en continu |
| Accès Fondateur | 59€ à vie, quantité limitée au lancement (ex. 200 comptes, à ajuster selon la capacité de service) | Identique à Recherche Active, à vie |

Garantie proposée : remboursement sous 7 jours, sans condition — réaliste car la valeur (score, matching) est déjà visible gratuitement avant l'achat.

### Contraintes d'implémentation
- Aucun prix ni taux codé en dur : passer par une configuration/table de pricing, même principe que la politique de commission d'affiliation (§5.12).
- L'Accès Fondateur a une capacité réelle et décroissante en base de données, pas un compteur cosmétique côté frontend : offre retirée automatiquement une fois le quota atteint.
- L'entitlement se dérive du palier ET d'une date d'expiration le cas échéant (le Sprint expire après 14 jours sans annulation manuelle) — prévoir une vérification d'expiration, pas seulement un flag binaire.

## 8. Sécurité
Validation des fichiers et de leur taille, assainissement des entrées, limitation de débit, protection de l'API, isolation stricte des données par utilisateur, suppression sécurisée des fichiers, protection des clés API, journalisation, audit des actions sensibles. Règle d'or : un utilisateur ne doit jamais accéder aux données d'un autre en modifiant un identifiant dans une requête.

À couvrir explicitement (RGPD, voir `ACCOUNT.exportData` et `ACCOUNT.delete` au §6) : export structuré des données personnelles et suppression complète d'un compte (profil, CV, sessions QRO, analyses d'offre, données d'affiliation comprises).

## 9. Observabilité
Détecter et tracer : échec d'import, d'appel IA, de parsing, d'analyse ATS, d'export, de paiement, d'attribution d'affiliation — logs, métriques, erreurs, audit. Deux ajouts nécessaires : suivi du coût/usage des appels IA par utilisateur et par palier (risque budgétaire réel côté comptes gratuits) ; domaine Notifications explicite (fin de traitement d'un import, événements d'abonnement, commission d'affiliation générée).

## 10. Critères de « c'est fini »
- Les 12 domaines du §5 sont implémentés, permissions vérifiées côté backend uniquement.
- Le modèle de données (§5bis) a été conçu et validé domaine par domaine avant toute création de table.
- Chaque endpoint du §6 existe et correspond exactement à l'identifiant utilisé côté frontend.
- Aucune suggestion IA n'atteint l'utilisateur sans passer par Truth Guard.
- Pricing et taux de commission pilotés par configuration, jamais codés en dur.
- Opérations longues asynchrones avec statut consultable.
- Export et suppression complète des données d'un utilisateur fonctionnels de bout en bout.

## 11. Découpage suggéré en phases
0. Modélisation des données domaine par domaine (§5bis), validée avant tout code.
1. Auth + Users + stockage de base.
2. CV Engine (import, parser, modèle de données, templates, versioning).
3. QRO Engine + Candidate Intelligence + traçabilité (Evidence).
4. Job Intelligence + Matching Engine + Gap Analysis.
5. ATS Engine + AI Optimization Engine + Truth Guard.
6. Subscription + pricing + entitlements.
7. Affiliate Engine.
8. Renforcement transversal : sécurité, observabilité, jobs asynchrones — à auditer en fin de parcours.

## Anti-patterns explicites
- Ne jamais laisser le frontend être la seule vérification d'un palier d'accès.
- Ne jamais coder un prix ou un taux de commission en dur.
- Ne jamais laisser une suggestion IA atteindre l'utilisateur sans passer par Truth Guard.
- Ne jamais bloquer une requête HTTP sur une opération longue.
- Ne pas construire de microservices pour ce MVP.
- Ne pas renommer un identifiant d'endpoint sans répercuter le changement dans le prompt frontend.
- Ne pas stocker les données centrales du candidat (expériences, compétences, etc.) en JSON générique — seuls le contenu de CV, les résultats d'analyse IA et la configuration de template justifient le JSON (§5bis).
- Ne pas générer le schéma SQL complet d'un coup : le construire domaine par domaine avec validation à chaque étape (§5bis).

## Coordination avec le frontend
Le §6 de ce prompt est le contrat que consomme le §6 du prompt frontend, bouton par bouton. Garder aussi la grille de pricing du §7 synchronisée avec celle du prompt frontend (son §9) si l'une des deux évolue.
