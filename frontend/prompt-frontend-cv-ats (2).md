# Prompt de développement — Frontend — SaaS CV × ATS

## Rôle et cadrage
Tu es un développeur frontend senior. Construis le frontend du MVP d'un SaaS de CV en ligne optimisé ATS. Avant de générer du code, propose un plan (arborescence de fichiers, découpage en phases) et attends validation — le périmètre est large (17 pages, ~72 boutons/actions distincts), ne tente pas un seul gros commit monolithique.

## 1. Contexte produit
Ce n'est pas « un éditeur de CV avec IA » : c'est un système qui comprend le profil réel du candidat ET l'offre visée avant de produire un CV adapté aux deux. Principe non négociable, visible dans toute l'UI : l'IA ne doit jamais laisser croire qu'elle invente une compétence, une expérience ou un chiffre que le candidat n'a pas fourni lui-même. Cible : public large, sans expertise CV/recrutement requise.

## 2. État actuel
Projet greenfield. Stack recommandée (à confirmer) : React (Next.js) + Tailwind CSS, TypeScript strict.

## 3. Objectif fonctionnel
Livrer les 17 pages du §6 avec, pour chacune, tous les boutons/actions listés (rôle, fonction, action backend associée), organisées en deux layouts (public / application), responsives desktop/tablette/mobile.

## 4. Contraintes techniques
- Découpage par feature (`features/cv/`, `features/qro/`, `features/job/`, `features/matching/`, `features/ats/`, `features/ai/`, `features/affiliate/`).
- Chaque bouton déclenchant un appel backend doit utiliser l'identifiant d'action listé au §6 (ex. `AUTH.login`) — ces identifiants correspondent 1:1 aux endpoints du prompt backend (son §6) : ne pas inventer d'autres noms d'action côté client.
- Un bouton sans action backend associée (indiqué « — » dans les tableaux) est un état purement local (navigation, affichage, confirmation) : ne pas créer d'appel réseau inutile pour lui.
- Contraste WCAG AA, cibles cliquables ≥ 44px sur mobile, navigation clavier complète sur tout composant interactif personnalisé.
- États vide/chargement/erreur systématiques pour toute page dépendant d'un appel réseau.
- Un palier d'accès (gratuit/payant) ne doit jamais être vérifié uniquement côté frontend : chaque bouton lié à une fonctionnalité payante doit interroger le backend, qui reste seul juge.

## 5. Composants
**Globaux** : bouton, champ de saisie, select, textarea, modal, drawer, dropdown, tooltip, badge, card, tabs, progress, skeleton, toast, alert, état vide, état de chargement.
**Métier**, par domaine : `cv/`, `qro/`, `job/`, `matching/`, `ats/`, `ai/`, `affiliate/` (nouveau, voir §6.17).

## 6. Inventaire complet — pages, états et boutons
Pour chaque bouton : rôle et fonction, puis l'action backend associée (identifiant, à faire correspondre à l'endpoint du même nom dans le prompt backend §6) ou « — » si l'action reste locale au frontend.

### 6.1 Landing `/` — 3 boutons
*(contenu de la landing non détaillé pendant l'idéation ; ensemble minimal proposé, à enrichir librement)*

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Créer mon CV gratuitement (répété haut et bas de page) | Point d'entrée principal | → `/signup` |
| Voir les tarifs | Accès à la grille tarifaire | → `/pricing` |
| Connexion (lien header) | Accès utilisateur existant | → `/login` |

### 6.2 Pricing `/pricing` — 4 boutons

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Commencer gratuitement | Inscription au palier Découverte | → `/signup` |
| Choisir Sprint Candidature | Paiement unique 9€ / 14 jours | `SUBSCRIPTION.checkout` (tier=sprint) |
| Choisir Recherche Active | Abonnement mensuel 15€ | `SUBSCRIPTION.checkout` (tier=monthly) |
| Choisir Accès Fondateur | Paiement unique 59€ à vie ; bouton désactivé si quota atteint | `SUBSCRIPTION.checkout` (tier=founder) |

### 6.3 Login `/login` — 3 boutons

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Se connecter (submit) | Authentifie l'utilisateur | `AUTH.login` |
| Mot de passe oublié ? | Accès à la récupération | → `/forgot-password` |
| Créer un compte | Accès à l'inscription | → `/signup` |

### 6.4 Signup `/signup` — 2 boutons

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Créer mon compte (submit) | Crée le compte | `AUTH.register` |
| Déjà un compte ? Se connecter | Bascule vers la connexion | → `/login` |

### 6.5 Forgot Password `/forgot-password` — 2 boutons

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Envoyer le lien de réinitialisation (submit) | Déclenche l'email | `AUTH.forgotPassword` |
| Retour à la connexion | Annule | → `/login` |

### 6.6 Reset Password `/reset-password` — 1 bouton

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Réinitialiser le mot de passe (submit) | Valide le nouveau mot de passe via le token reçu | `AUTH.resetPassword` |

### 6.7 Dashboard `/dashboard` — 4 boutons globaux + 2 par CV récent affiché
Accueil orienté intention, pas dashboard technique.

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Créer un nouveau CV | Démarre depuis zéro | → `/cv/new` |
| Importer mon CV | Démarre depuis un fichier | → `/cv/import` |
| Adapter mon CV à une offre | Sélectionne un CV existant puis l'associe à une nouvelle offre (accès payant requis) | → sélecteur puis `/job/new` |
| Voir tous mes CV | Accès à la liste complète | → `/cvs` |
| *(par carte CV récent)* Modifier | Ouvre l'éditeur | → `/cv/:id/edit` |
| *(par carte CV récent)* Adapter à une offre | Crée une variante liée à une nouvelle offre | → `/job/new` |

### 6.8 Start CV `/cv/new` — 2 boutons + 1 par template proposé

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Importer mon CV | Bascule vers l'import | → `/cv/import` |
| Partir d'un template | Ouvre le sélecteur (5 à 8 templates) | — |
| *(par template)* Utiliser ce template | Crée le CV avec ce template | `CV.create` |

### 6.9 Import CV `/cv/import` — 5 boutons selon l'état
États : vide → envoi en cours → traitement → relecture → succès (ou erreur).

| Bouton | Rôle et fonction | Backend | État |
|---|---|---|---|
| Parcourir / déposer un fichier | Sélectionne le fichier PDF/DOCX | `CV.import.upload` | Vide |
| Réessayer | Relance après un échec | `CV.import.upload` | Erreur |
| Choisir un autre fichier | Abandonne et recommence | `CV.import.upload` | Erreur |
| Modifier *(par section extraite)* | Corrige une donnée mal extraite | `PROFILE.update` | Relecture |
| Confirmer et continuer | Valide les données extraites | `PROFILE.confirm` | Relecture |

### 6.10 QRO `/onboarding/profile` — 3 boutons récurrents

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Continuer (soumettre une réponse) | Envoie la réponse, reçoit la question suivante ou complémentaire | `QRO.answer` |
| Précédent *(non discuté pendant l'idéation, ajout de bon sens UX)* | Revient corriger la réponse précédente | `QRO.answer` (mode correction) |
| Terminer et ajouter des informations | Sort du flux guidé pour un ajout libre en fin de parcours | `QRO.addManualInfo` puis `QRO.complete` |

### 6.11 Profile Review `/profile/review` — 3 boutons (établis explicitement pendant l'idéation)

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Modifier | Édition inline d'un élément du résumé | `PROFILE.update` |
| Ajouter des informations | Relance une saisie libre ou un complément QRO ciblé | `QRO.addManualInfo` |
| Continuer | Valide le profil, passe à l'étape suivante | `PROFILE.confirm` → `/job/new` |

### 6.12 Job Input `/job/new` — 2 boutons

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Analyser l'offre (submit du texte collé) | Lance l'analyse | `JOB.analyze` → `/match/:id` |
| Décrire le poste plutôt que coller l'offre | Bascule vers un mini-QRO orienté offre | `QRO.start` |

### 6.13 Matching Analysis `/match/:id` — 2 boutons principaux

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Optimiser mon CV | CTA principal — moment clé du produit | `AI.optimize` → `/cv/:id/edit` |
| Passer à [palier] (compte gratuit) | Ouvre le paiement pour débloquer l'optimisation | `SUBSCRIPTION.checkout` |

### 6.14 CV Editor `/cv/:id/edit` — 12 boutons/actions (page la plus dense)
Trois zones sur desktop (structure / aperçu / suggestions), disposition différente sur mobile (voir prompt UX). Pas un clone de Word.

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Ajouter une section | Insère une nouvelle section | `CV.addSection` |
| Supprimer une section (menu contextuel) | Retire une section, avec confirmation | `CV.removeSection` |
| Réordonner (glisser-déposer) | Change l'ordre des sections | `CV.reorderSections` |
| Accepter *(suggestion IA)* | Applique la suggestion | `AI.suggestion.accept` |
| Modifier *(suggestion IA)* | Édition manuelle avant application | `AI.suggestion.edit` |
| Garder l'original *(suggestion IA)* | Rejette la suggestion | `AI.suggestion.reject` |
| Pourquoi cette suggestion ? | Affiche la source et l'explication | `AI.suggestion.explain` |
| Changer de template | Ouvre l'aperçu et le changement de template | `CV.changeTemplate` |
| Masquer/afficher le panneau IA | Bascule d'affichage | — |
| Exporter | Ouvre les options d'export (PDF systématique, DOCX si payant) | `CV.export` |
| Renommer ce CV | Modifie le titre | `CV.update` |
| Retour à Mes CV | Quitte (avertissement si modifications non sauvegardées) | → `/cvs` |

### 6.15 My CVs `/cvs` — 1 bouton global + 4 par CV

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| + Nouveau CV | Démarre un nouveau CV | → `/cv/new` |
| *(par CV)* Modifier | Ouvre l'éditeur | → `/cv/:id/edit` |
| *(par CV)* Adapter à une nouvelle offre | Crée une variante liée à une nouvelle offre | → `/job/new` |
| *(par CV)* Renommer | Modifie le titre | `CV.update` |
| *(par CV)* Supprimer (avec confirmation) | Suppression définitive | `CV.delete` |

### 6.16 Settings `/settings` — 6 boutons, 3 sous-sections

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Enregistrer les modifications (profil compte) | Sauvegarde les infos de compte | `AUTH.updateProfile` |
| Changer le mot de passe | Modifie le mot de passe | `AUTH.changePassword` |
| Exporter mes données | Génère l'export structuré RGPD | `ACCOUNT.exportData` |
| Supprimer mon compte (avec confirmation) | Suppression complète et définitive | `ACCOUNT.delete` |
| Gérer mon abonnement / Passer à un palier supérieur | Ouvre le changement de palier | `SUBSCRIPTION.checkout` |
| Annuler mon abonnement | Résilie l'abonnement récurrent | `SUBSCRIPTION.cancel` |

### 6.17 Espace Affilié `/affiliate` — 2 boutons *(page ajoutée ici : le programme d'affiliation à 30 % existe côté backend mais n'avait pas d'écran défini pendant l'idéation UX — combler ce trou plutôt que le laisser sans interface)*

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Copier mon lien de parrainage | Copie le lien unique dans le presse-papier | `AFFILIATE.getLink` |
| Actualiser mes commissions | Recharge l'historique des parrainages/commissions (liste seule, sans action par ligne) | `AFFILIATE.getStats` |

### 6.18 404 — 1 bouton

| Bouton | Rôle et fonction | Backend |
|---|---|---|
| Retour à l'accueil | Redirige vers `/` (non connecté) ou `/dashboard` (connecté) | — |

### 6.19 Modals et overlays (sans route dédiée) — 14 boutons fixes + N variables

| Modal | Boutons | Backend |
|---|---|---|
| Suppression d'un CV | Confirmer la suppression / Annuler | `CV.delete` |
| Renommage d'un CV | Enregistrer / Annuler | `CV.update` |
| Passage à un palier payant | Choisir un palier → redirige vers le checkout | `SUBSCRIPTION.checkout` |
| Explication IA | Fermer | — (déjà chargé via `AI.suggestion.explain`) |
| Ajout de section | Un bouton par type de section disponible (variable) | `CV.addSection` |
| Options d'export | PDF / DOCX (si éligible) puis Télécharger | `CV.export` |
| Aperçu de template | Utiliser ce template / Fermer | `CV.changeTemplate` |
| Modifications non sauvegardées | Enregistrer et quitter / Quitter sans enregistrer / Annuler | `CV.update` (si « enregistrer ») |

**Total : 17 pages, environ 72 boutons/actions distincts** (hors répétitions par élément de liste — CV, template, section, suggestion).

## 7. Paywall
Ne jamais verrouiller l'accès dès l'inscription. Il apparaît après que l'utilisateur ait perçu la valeur potentielle (typiquement juste après l'écran de matching), en listant ce qui est verrouillé plutôt qu'un mur générique.

## 8. Navigation
Minimale : Accueil, Mes CV, Mon profil, Réglages, Espace Affilié (si l'utilisateur a activé son statut d'affilié). Ne pas exposer les moteurs internes (analyseur ATS, analyseur d'offre, QRO...) comme des entrées séparées.

## 9. Grille tarifaire (référence — détail du raisonnement dans le prompt backend §7)

| Palier | Prix | Accès |
|---|---|---|
| Découverte (gratuit) | 0€ | 1 CV actif, templates limités, QRO standard, score ATS global, export PDF |
| Sprint Candidature | 9€ / 14 jours | CV multiples, mots-clés, ATS détaillé, export DOCX, mode réflexion QRO, 1 lettre de motivation offerte |
| Recherche Active | 15€ / mois | Identique au Sprint, en continu |
| Accès Fondateur | 59€ à vie, quantité limitée | Identique à Recherche Active, à vie |

## 10. Direction artistique
Couleur secondaire fixée : `#127749` (vert profond). À réserver aux signaux positifs déjà prévus dans le produit (score ATS élevé, statut « confirmé » du matching, badge de vérification) plutôt qu'à un usage décoratif généralisé — sinon elle perd sa force de signal.

Reste de la palette (proposition à valider, seule la couleur secondaire est confirmée) :
- Primaire : encre profonde chaude, ex. `#1C1B18` — texte et actions principales, évite le bleu/violet SaaS générique.
- Fond : blanc cassé chaud, ex. `#FAF8F4`, plutôt qu'un blanc pur froid.

Typographie (choix laissé à ma discrétion, à valider) :
- Titres et marque : **Fraunces** (serif à caractère éditorial — renforce le sérieux et la confiance, évite le style SaaS générique).
- Corps de texte et interface : **IBM Plex Sans** (très lisible aux petites tailles, bon support multilingue — pertinent vu l'extension prévue à plusieurs pays au-delà du MVP).

**Anti-patterns explicites** : emoji comme icônes fonctionnelles ; gradient violet/bleu par défaut ; cartes systématiquement en ombre portée ; mur de paywall générique sans détail ; éditeur de CV qui tente de reproduire un traitement de texte complet ; police système par défaut sans intention.

## 11. Critères de « c'est fini »
- Les 17 pages (+ 404) sont navigables et responsives.
- Chaque bouton du §6 est implémenté, relié à l'identifiant d'action indiqué (ou purement local si « — »), sans en inventer d'autres.
- Chaque page dépendant d'un appel réseau gère vide/chargement/erreur/succès.
- Aucun composant interactif personnalisé n'est inaccessible au clavier.
- Aucun emoji utilisé comme icône dans l'interface livrée.

## 12. Découpage suggéré en phases
1. Layouts + composants globaux + pages publiques (landing, pricing, login, signup, mots de passe).
2. Dashboard + Start CV + Import CV.
3. QRO + Profile Review.
4. Job Input + Matching Analysis (+ paywall).
5. CV Editor + suggestions IA + traçabilité.
6. My CVs + Settings + Espace Affilié.
7. Passe finale : responsive, accessibilité, micro-interactions.

## Coordination avec le backend
Chaque identifiant d'action (`AUTH.login`, `CV.create`, etc.) référencé au §6 doit correspondre exactement à un endpoint listé au §6 du prompt backend — ne pas modifier un nom sans modifier l'autre prompt en miroir.
