# ANDOU DIINEMA

**Plateforme islamique de réveil et de transformation spirituelle.**
« Ouvre les yeux, purifie ton cœur et rapproche-toi d'Allah. »

React 18 · Vite · Tailwind CSS · React Router · Lucide · Supabase (PostgreSQL, Auth, RLS) · PWA · Vercel

---

## Design « jeu » (version 3)

- **Vert principal, blanc secondaire** : fond vert profond (#032A1D → #0B6B47), pages de lecture sur une feuille blanche arrondie.
- **Parcours en ascension** : on part du **camp de base (en bas)** et on **monte vers le sommet** ; chapitre 1 en bas, chapitre 10 en haut ; sentier doré qui se remplit, ciel étoilé, nuages, montagnes.
- **Sources lisibles sur place** : versets (arabe + traduction + sourate/numéro) et hadiths (texte, référence, authenticité, contexte dépliable) — plus aucun lien externe.
- **Animations 2D/3D et emojis** : boutons en relief avec reflet, cartes inclinées en 3D, pièces qui tournent, emojis qui jaillissent à la bonne réponse, coffres 🏆 qui pivotent.
- **Règles du jeu** (« Comment jouer ? ») affichées à la première visite du parcours.
- **Accueil** : « Ma charte de transformation » — Apprendre, Changer, Me protéger, Purifier, Construire, Suivre.

## Parcours interactif (inspiré des applications d'apprentissage gamifiées)

- **Chemin vertical** `/parcours` : 10 chapitres × 3 étapes, nœuds en zigzag, étapes faites / courante (anneau animé) / verrouillées, coffre de fin de chapitre. Le chapitre 7 (repentir) est **toujours ouvert**.
- **Étape** `/parcours/etape/:id` (plein écran) : leçon → verset → hadith → quiz → réflexion privée → mission → invocation → bilan → « Terminer cette étape ».
- **Progression** : XP, 10 niveaux, série de jours, objectif du jour réglable, « lumière du jour » (énergie qui ne fait que se remplir), 25 badges, historique, célébrations (confettis, déblocage animé). `/recompenses`.
- **Principes** : on ne perd jamais rien ; aucune pénalité pour une erreur ou une journée manquée ; le repentir et les enseignements ne sont jamais bloqués ; **mode sobre** (Profil) pour masquer XP et séries.
- L'ancien tableau de bord est devenu **Mon suivi** (`/suivi`) : prières, dhikr, objectifs, missions, bilans.
- Contenu : `src/content/parcours.js` · moteur : `src/services/gamification.js`.
- **Base déjà installée avant cette version ?** Exécuter `supabase/migrations/002_parcours.sql` (ajoute le type `lesson`).

## Contenu du site

| Rubrique | Route | Contenu |
|---|---|---|
| Accueil | `/` | Accroche, sujet du jour, dangers les plus consultés, conseils, 6 étapes, hadith du jour |
| Découvrir | `/decouvrir` | Hub de toutes les rubriques + recherche |
| Péchés banalisés | `/peches`, `/peches/:cat`, `/article/:slug` | 5 catégories, **35 articles** complets en 14 parties |
| Cœur endurci | `/coeur-endurci` | 10 causes + remèdes |
| Pièges de Shaytan | `/pieges-shaytan` | 10 pièges + moyens de protection |
| Conséquences | `/consequences` | 11 thèmes (mort, tombe, Jugement, miséricorde…) |
| Sortir des péchés | `/sortir-des-peches` | Méthode en 9 étapes + 6 guides pratiques |
| Repentir | `/repentir` | Conditions de la tawbah + 11 vertus |
| Reconstruire sa foi | `/reconstruire` | 10 habitudes quotidiennes |
| Programme 30 jours | `/programme`, `/programme/jour/:n` | 30 missions interactives, 6 phases, cycles |
| Bilan quotidien | `/bilan` | 7 questions, message bienveillant |
| Hadiths / Invocations | `/hadiths`, `/invocations` | 79 hadiths, 20 invocations, recherche et filtres |
| Mon parcours | `/parcours` | Tableau de bord : programme, prières, dhikr, objectifs, historique, bilans |
| Favoris / Profil | `/favoris`, `/profil` | Favoris, rappels, export et suppression des données |
| Comptes | `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser` | Supabase Auth |
| Administration | `/admin` | CRUD complet, validation, publication, rappels, messages, statistiques |
| Légal | `/confidentialite`, `/conditions`, `/contact`, `/a-propos` | |

Bibliothèque de sources : **95 versets** (avec lien quran.com), **79 hadiths** (référence, degré, contexte, lien sunnah.com), **20 invocations** (arabe, phonétique, traduction, source).

### Mode invité et comptes
Sans compte, tout fonctionne en **mode invité** : la progression est enregistrée dans le navigateur.
À la création du compte, ces données sont **transférées automatiquement** dans Supabase.

---

## 1. Lancer le projet en local

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs (voir §2)
npm run dev                  # http://localhost:5173
npm run build                # vérifie le contenu, génère le sitemap, compile dans dist/
```

`npm run check` vérifie qu'aucune référence (verset, hadith, invocation) n'est cassée.

---

## 2. Configurer Supabase (obligatoire pour les comptes)

1. Créer un projet sur <https://supabase.com> → **New project** (région conseillée : `eu-west-3` Paris).
   ⚠️ L'offre gratuite autorise 2 projets actifs ; au-delà, Supabase facture.
2. **SQL Editor** → coller et exécuter `supabase/migrations/schema.sql` (tables, RLS, rôles, fonctions).
3. **SQL Editor** → coller et exécuter `supabase/seed.sql` (tous les contenus, au statut « En relecture »).
   *Alternative :* après l'étape 5, bouton **Importer le contenu de base** dans `/admin`.
4. **Project Settings → API** : copier l'URL et la clé **publique** (`anon` ou `publishable`) dans `.env.local` :
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxx
   VITE_SITE_URL=https://votre-domaine.vercel.app
   VITE_CONTACT_EMAIL=contact@votre-domaine.com
   ```
   🔒 Ne **jamais** mettre la clé `service_role` dans le frontend.
5. **Authentication → URL Configuration** :
   - *Site URL* : `https://votre-domaine.vercel.app`
   - *Redirect URLs* : `https://votre-domaine.vercel.app/**` et `http://localhost:5173/**`
6. **Authentication → Providers → Email** : laisser « Confirm email » activé (recommandé).
   Pour la production, configurer un SMTP (Authentication → SMTP) : l'envoi par défaut de Supabase est limité à quelques e-mails par heure.
7. **Donner le rôle administrateur** à votre compte (après vous être inscrit sur le site) :
   ```sql
   insert into public.admin_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'votre@email.com';
   ```
   Rôles disponibles : `admin` (tout), `editor` (rédiger), `reviewer` (valider religieusement).
   Les rôles ne peuvent être attribués qu'en SQL, jamais depuis le site.

---

## 3. Validation religieuse (indispensable)

Tous les contenus sont fournis avec des références vérifiables, mais **ils doivent être relus par une personne qualifiée en sciences islamiques** avant d'être considérés comme validés.

Circuit (imposé par la base de données, impossible à contourner depuis le site) :

```
Brouillon → En relecture → Validé (rôle reviewer) → Publié (rôle admin)
```

- Tant qu'un contenu n'est pas publié en base, le site affiche la version intégrée avec le badge **« En attente de validation »**.
- Une fois publié, il affiche **« Validé par le comité »**.
- Toute modification d'un contenu validé/publié le renvoie automatiquement **en relecture**.
- « Dépublier » masque le contenu du site.

Points à faire vérifier en priorité : la numérotation des hadiths selon l'édition de référence choisie, les degrés d'authenticité des hadiths hors Bukhari/Muslim, les traductions des versets, et les passages mentionnant des divergences (tenue vestimentaire, musique, statut de l'abandon de la prière).

---

## 4. Déployer sur Vercel

1. Pousser le projet sur GitHub.
2. <https://vercel.com/new> → importer le dépôt (framework détecté : **Vite**).
3. **Environment Variables** : ajouter `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_CONTACT_EMAIL`.
4. Deploy. `vercel.json` gère les routes SPA, le cache et les en-têtes de sécurité.
5. Mettre l'URL finale dans Supabase (§2.5) et dans `VITE_SITE_URL`, puis redéployer (le sitemap utilise cette URL).

---

## 5. Sécurité

- **RLS** activée sur les 14 tables. Testée : un utilisateur ne voit que ses données ; un anonyme ne voit que les contenus publiés ; même un admin ne peut pas lire les bilans ou la progression d'un utilisateur (statistiques agrégées uniquement via `admin_stats()`).
- Écritures de contenu limitées aux rôles `editor`/`admin`, validation réservée à `reviewer`/`admin`, publication et suppression à `admin` (trigger `enforce_validation`).
- Contraintes de taille sur tous les champs saisis par les utilisateurs ; formulaire de contact avec piège anti-robots.
- Suppression de compte (`delete_my_account`) : effacement en cascade de toutes les données.
- En-têtes HTTP : `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

## 6. Mobile et PWA

- Conception mobile d'abord, barre de navigation inférieure (Accueil, Découvrir, Mon parcours, Favoris, Profil), cibles tactiles ≥ 44 px, zones sûres iPhone.
- Installable (manifest + service worker), page hors ligne, pages chargées à la demande.
- Rappels personnels (programme, dhikr, bilan) par notifications du navigateur, déclenchés à l'ouverture du site/de l'application après l'heure choisie. *Les notifications « push » envoyées quand l'application est fermée nécessiteraient un service d'envoi supplémentaire (non inclus).*

## Structure

```
public/            logo.svg, manifest.json, sw.js, icons/, images/
src/components/    Header, Footer, MobileNavigation, ArticleCard, HadithCard, VerseCard, InvocationCard, ReminderCard, ProgressCard, SearchBar…
src/pages/         Home, Peches, Article, CoeurEndurci, PiegesShaytan, Consequences, Solutions, Repentir, Reconstruction, Programme30Jours, BilanQuotidien, Hadiths, Invocations, Dashboard, Profil, Login, Register, Admin…
src/services/      supabase, auth, articles, progress, notifications
src/hooks/         useAuth, useContent, useProgress
src/content/       sources (versets, hadiths, invocations), peches, themes, programme
supabase/          migrations/schema.sql, seed.sql (généré par npm run seed)
scripts/           check-content, generate-seed, generate-sitemap
```
