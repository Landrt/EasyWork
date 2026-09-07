# EasyWork - Plateforme SaaS de CVs ATS & Candidatures Assistées par IA

EasyWork est une solution SaaS moderne conçue pour permettre aux candidats de concevoir, optimiser et cibler des CVs sur-mesure afin de franchir avec succès tous les systèmes de filtrage ATS (Applicant Tracking Systems) et de décrocher des entretiens.

---

## 🚀 Fonctionnalités Clés

### 1. Gestion & Création de CVs Ciblés
- **CVs Socles (Base Resumes)** : Créez et gérez vos profils professionnels de référence.
- **CVs Ciblés (Tailored Resumes)** : Personnalisez et adaptez automatiquement chaque CV à une offre d'emploi précise grâce à l'IA.
- **Générateur de Lettres de Motivation** : Rédaction dynamique et percutante adaptée à l'offre.
- **Score ATS & Diagnostic IA** : Évaluation détaillée de la performance de vos candidatures.
- **Export PDF Professionnel** : Rendu fidèle et mise en page éditoriale prête pour les recruteurs.

### 2. Programme Partenaires Récurrent (Affiliation à Vie)
- Commission de 30 % récurrente à vie sur chaque abonnement généré.
- Gestion des liens de tracking partenaires (`/p/[code]`) avec cookies 60 jours.
- Période de grâce de 14 jours avant libération des fonds pour protection contre les remboursements/chargebacks.
- Demande de retraits (payouts) avec seuil minimal, suivi du statut et des transactions.

### 3. Tableau de Bord Super-Admin
- Monitoring en direct du MRR, ARR, volume de paiements et abonnements actifs.
- Gestion des candidats, forfaits et rôles.
- Validation des demandes de retraits partenaires avec traçabilité d'audit.
- Configuration dynamique des prix et plafonds.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Frontend** : React 19, TypeScript, Tailwind CSS, Radix UI / Shadcn UI
- **Base de Données & Auth** : [Supabase](https://supabase.com/) (PostgreSQL 15+, Row-Level Security, Supabase Auth)
- **Paiements** : [Flutterwave](https://flutterwave.com/) (Checkout hébergé, webhooks signés `verif-hash`, devise USD)
- **Rate Limiting** : [Upstash Redis](https://upstash.com/)
- **Moteurs d'IA** : DeepSeek, Claude (Anthropic), OpenAI, Gemini (Google)

---

## ⚙️ Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration de base
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Flutterwave (USD)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
FLUTTERWAVE_SECRET_HASH=your_webhook_secret_hash

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Clés IA (selon fournisseurs configurés)
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
DEEPSEEK_API_KEY=...
```

---

## 📦 Installation & Démarrage

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm run dev
```

3. Compiler pour la production :
```bash
npm run build
```

4. Démarrer en production :
```bash
npm run start
```

---

## 🔒 Sécurité & Bonnes Pratiques

- **Contrôle d'accès strict** : Routes d'administration et Server Actions protégées par vérification systématique de l'identité et du rôle super-admin.
- **Webhooks durcis** : Vérification cryptographique obligatoire de l'en-tête `verif-hash` de Flutterwave.
- **En-têtes HTTP de sécurité** : Protection contre le détournement de clics (`X-Frame-Options: DENY`), le reniflage de type MIME (`X-Content-Type-Options: nosniff`) et politique stricte des référents.
- **Row-Level Security (RLS)** : Cloisonnement strict des données utilisateur au niveau PostgreSQL.

---

© EasyWork. Tous droits réservés.
