<div align="center">

# 📊 `SocialPulse`
### *Application Web de Visualisation du Buzz Technologique & de Prédiction des Tendances*

<br>
</div>



<div align="center">



**Réalisé par :**  **IMESMAD Maryam** & **OUSMAAIL Douae**  
**Sous la supervision de :**  **Pr. Yann Ben Maissa** 

*Filière ASEDS · INPT · Année académique 2025/2026*</div>

---

###  Concept du Projet
> **Application Web de Visualisation du Buzz Technologique et de Prédiction des Tendances par Réseaux de Neurones Récurrents (LSTM)**

*SocialPulse est un projet de fin d'année conçu pour analyser l'effervescence des réseaux sociaux, modéliser l'impact des nouvelles technologies et prédire les futures tendances du marché grâce à la puissance des architectures de Deep Learning.*



---

##  Aperçu

SocialPulse est une plateforme full-stack qui agrège en continu des données publiques issues de **Reddit**, **Hacker News** et **GitHub**, détecte les mentions de technologies émergentes, et prédit leur dynamique à court terme grâce à deux modèles d'apprentissage automatique exécutés **entièrement en local** (régression linéaire et LSTM TensorFlow.js).

<!-- Screenshot : dashboard.png -->
Tableau de bord principal

<img width="1917" height="917" alt="dashboard" src="https://github.com/user-attachments/assets/49b6a146-0f02-4ab4-af12-b61967d68088" />


---

##  Fonctionnalités

| Fonctionnalité | Description |
|---|---|
|  Collecte automatisée | Collecteurs planifiés (node-cron) pour Reddit, HN et GitHub |
|  Extraction de mots-clés | ~130 technologies détectées via expressions régulières compilées |
|  Visualisations interactives | Classement, Radar, Heatmap, Bubble Chart, Sankey, Sparklines |
|  Prédiction IA | Baseline (régression linéaire) + LSTM (TensorFlow.js) |
|  Filtrage géographique | France, Maroc, Global — déduit du sous-reddit d'origine |
|  Cache hybride | RAM (store.js) + persistance  MongoDB Atlas |
|  Flux temps réel | Panneau LIVE rafraîchi toutes les 30 secondes |

---

##  Interface

### Tableau de bord
<!-- Screenshot : filterbar.png -->
Barre de filtres
<img width="1612" height="375" alt="filterbar" src="https://github.com/user-attachments/assets/a406225f-3cae-4384-8c0b-aa6172242df0" />


<!-- Screenshot : answercard.png -->
Carte "Le plus populaire" et Donut par domaine
<img width="1595" height="532" alt="answercard" src="https://github.com/user-attachments/assets/fa4064d5-b686-4a87-bed5-9e8000b33bc0" />


<!-- Screenshot : ranking.png -->
Classement interactif et Radar profil par source
<img width="1597" height="647" alt="ranking" src="https://github.com/user-attachments/assets/f0911111-3b4f-4f64-a489-8e0f26698967" />


<!-- Screenshot : heatmap.png -->
Heatmap d'activité et évolution comparée
<img width="1592" height="477" alt="heatmap" src="https://github.com/user-attachments/assets/71055d51-8feb-4ce4-b8df-dee5c89fa1c6" />


<!-- Screenshot : bubble.png -->
Graphe à bulles Score vs. Mentions
<img width="1602" height="780" alt="bubble" src="https://github.com/user-attachments/assets/39620e1a-d7d4-4106-80be-bdce1630dd80" />


<!-- Screenshot : sankey.png -->
Diagramme de flux des sources (Sankey)
<img width="1592" height="671" alt="sankey" src="https://github.com/user-attachments/assets/87a28a24-23f6-4fb4-a0c6-f1c30fd7a9cb" />


<!-- Screenshot : trending.png -->
Keywords en hausse et Flux temps réel
<img width="1572" height="757" alt="trending" src="https://github.com/user-attachments/assets/24cc349b-ba6b-4df7-853c-11cedbf27131" />


### Page de prédictions IA
<!-- Screenshot : predictions.png -->
Prédictions Baseline
<img width="1891" height="917" alt="predictions" src="https://github.com/user-attachments/assets/66dfb503-91f3-4e03-b41f-5e2ed146b89d" />


<!-- Screenshot : predictions_lstm.png -->
Prédictions LSTM
<img width="1900" height="921" alt="predictions_lstm" src="https://github.com/user-attachments/assets/d14e307c-5614-4421-b5e4-9c9cc638edb6" />


### Page de détail d'une technologie
<!-- Screenshot : keyword.png -->
Analyse détaillée d'une technologie
<img width="1917" height="920" alt="keyword" src="https://github.com/user-attachments/assets/52981c44-b827-4448-87e5-659104425e0a" />


<!-- Screenshot : keyword_cooc.png -->
Publications associées et co-occurrences
<img width="1917" height="921" alt="keyword_cooc" src="https://github.com/user-attachments/assets/b1eb01b7-5fa2-413c-82f3-9b0669a44785" />


### Pages par source
<!-- Screenshot : sourceReddit.png / sourceReddit2.png -->
Analyse Reddit

<img width="1912" height="917" alt="sourceReddit" src="https://github.com/user-attachments/assets/b028d585-cc88-4f68-a361-1ee8c1c8ed25" />


<img width="1900" height="922" alt="sourceReddit2" src="https://github.com/user-attachments/assets/6e6012fc-622d-4389-bb64-ea8d1753dcc2" />


<!-- Screenshot : sourceHN.png / sourceHN2.png -->
Analyse Hacker News

<img width="1906" height="921" alt="sourceHN" src="https://github.com/user-attachments/assets/3dc4417b-90d1-483a-8918-821d0234789b" />



<img width="1896" height="922" alt="sourceHN2" src="https://github.com/user-attachments/assets/a50b2dd5-1acf-4bc4-a2b9-008fe8eec6fe" />

<!-- Screenshot : sourceGH.png / sourceGH2.png -->
Analyse GitHub

<img width="1895" height="912" alt="sourceGH" src="https://github.com/user-attachments/assets/f4d2d583-61ed-44c7-85a2-dc7aa1171347" />


<img width="1896" height="922" alt="sourceGH2" src="https://github.com/user-attachments/assets/4ce8f86c-aeb8-4ca1-a47c-fb7daad543ea" />

---

##  Architecture
 
SocialPulse repose sur une architecture **trois tiers** :
 
```
┌─────────────────────────────────────────────────┐
│            FRONTEND (React 19 + Vite)           │
│  Dashboard · Prédictions · Détail · Sources     │
└──────────────────┬──────────────────────────────┘
                   │ HTTP (Axios)
┌──────────────────▼──────────────────────────────┐
│         BACKEND (Node.js / Express)             │
│                                                 │
│  ┌──────────┐  ┌───────────┐  ┌─────────────┐   │
│  │ Fetchers │→ │Normalizer │→ │  store.js   │   │
│  │ (cron)   │  │+ Extractor│  │  (RAM cache)│   │
│  └──────────┘  └───────────┘  └──────┬──────┘   │
│                                      │          │
│  ┌───────────────────────────────────▼──────┐   │
│  │  Prediction Module                       │   │
│  │  baseline.js (linreg) · lstm.js (tfjs)   │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  REST API → /api/keywords /api/predictions      │
│             /api/stats    /api/trends           │
└──────────────────┬──────────────────────────────┘
                   │ Mongoose
┌──────────────────▼──────────────────────────────┐
│         STOCKAGE (MongoDB Atlas)                │
│   Collection Item (publications normalisées)    │
│   Collection Snapshot (séries temporelles)      │
└─────────────────────────────────────────────────┘
```
## ⏱️ Planification des collecteurs
 
| Source | Expression Cron | Fréquence |
|---|---|---|
| Reddit | `*/5 * * * *` | Toutes les 5 min |
| Hacker News | `*/3 * * * *` | Toutes les 3 min |
| GitHub | `0 */2 * * *` | Toutes les 2 heures |
 
---
## Modèles de prédiction
 
### Baseline — Régression linéaire
- Ajustement d'une droite des moindres carrés sur la série temporelle des scores
- Vitesse relative = pente / moyenne · Confiance = R²
- Minimum requis : **3 points**
### LSTM — TensorFlow.js
- Réseau séquentiel : 1 couche LSTM (8 unités) + 1 couche Dense
- Fenêtres glissantes `lookback = 6`, entraîné sur `40 époques`
- Prévision itérative sur l'horizon choisi (+6h, +12h, +24h)
- Minimum requis : **48 points** (≈ 2 jours de collecte)
- Si insuffisant → dégradation gracieuse vers la Baseline
---

## Structure du projet
 
```
SocialPulse
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   │
│   ├── src/
│   │   ├── pages/                 # Dashboard, Keyword, Predictions, Source
│   │   ├── components/            # RankingChart, BubbleChart, Heatmap, ...
│   │   ├── lib/                   # api.js, domains.js, ui.jsx, series.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── eslint.config.js
│   ├── vite.config.js
│   
│
└── backend/
    ├── server.js
    │
    └── src/
        ├── config/                # sources.config.js
        │
        ├── models/                # item.model.js, snapshot.model.js
        │
        ├── routes/                # keywords, predictions, stats, trends
        │
        ├── services/
        │   ├── fetchers/          # reddit, hackernews, github
        │   │
        │   ├── predictions/
        │   │   ├── models/        # baseline.js, lstm.js
        │   │   ├── dataset.js
        │   │   └── index.js
        │   │
        │   ├── http.client.js
        │   ├── store.js
        │   ├── normalizer.js
        │   ├── keywords.extractor.js
        │   ├── ratelimit.js
        │   └── db.js
        │
        └── workers/
            └── poller.js
```
 
---

##  Stack technique

### Frontend
- **React 19** + **Vite** — SPA dynamique et modulaire
- **TailwindCSS v4** — Utility-first, entièrement responsive
- **Recharts** — Graphiques composables (aires, barres, radar, bulles)
- **lucide-react** — Iconographie

### Backend
- **Node.js** + **Express.js** — API REST asynchrone
- **node-cron** — Planification des collecteurs
- **TensorFlow.js** — Modèle LSTM entraîné in-process
- **Axios** — Client HTTP avec retry automatique (429)
- **RateLimiter** (custom) — File d'attente asynchrone

### Stockage
- **MongoDB Atlas** — NoSQL orienté documents
- **Mongoose** — ODM avec schémas `Item` et `Snapshot`

### Déploiement
- **Railway** — Backend cloud (collecte en continu)
- **MongoDB Atlas** — Base managée
- **Vite dev server** — Frontend local

---


##  Installation

### Prérequis
- Node.js ≥ 18
- Compte MongoDB Atlas 
- Cookie Reddit `loid` (pour contourner le blocage 403)

### 1. Cloner le dépôt

```bash
git clone https://github.com/Prof-Yann-BEN-MAISSA-Student-Projects/Social-Technology-Pulse-INE1.git
cd Social-Technology-Pulse-INE1
```

### 2. Configuration du backend

Créer le fichier `backend/.env` :

```env
PORT=3001

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/SocialPulse

# Reddit (cookie loid depuis l'inspecteur navigateur)
REDDIT_SUBREDDITS=programming,technology,MachineLearning,webdev,javascript,Python
REDDIT_USER_AGENT=SocialPulseINPT/0.1 (Academic project, INPT Morocco)
REDDIT_COOKIE=loid=...

# GitHub (optionnel — augmente le quota API)
GITHUB_TOPICS=web,ai,devops,cli,database
GITHUB_TOKEN=ghp_...
```

### 3. Démarrer le backend

```bash
cd backend
npm install
npm start          # production
# ou
npm run dev        # mode watch
```

Le serveur écoute sur `http://localhost:3001` et lance immédiatement les collecteurs.

### 4. Configuration du frontend

Créer le fichier `frontend/.env.local` :

```env
# Backend local
VITE_API_URL=http://localhost:3001

# ou backend Railway déployé
# VITE_API_URL=https://<nom-du-service>.up.railway.app
```

### 5. Démarrer le frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

---

## ☁️ Déploiement (Railway)

1. Connecter le dépôt GitHub à Railway
2. Sélectionner le dossier `backend/` comme racine du service
3. Renseigner toutes les variables d'environnement dans le tableau de bord Railway
4. Railway détecte Node.js, exécute `npm install` puis `npm start` automatiquement
5. Mettre à jour `VITE_API_URL` dans `frontend/.env.local` avec l'URL publique Railway

> **Important :** héberger le backend en cloud permet à la collecte de tourner en permanence et d'accumuler l'historique nécessaire à l'activation du modèle LSTM.

---
*INPT — Institut National des Postes et Télécommunications · Année académique 2025/2026*

