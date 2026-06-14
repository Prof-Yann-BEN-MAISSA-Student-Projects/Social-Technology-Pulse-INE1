<div align="center">

# 📊 `SocialPulse`
### *Web Application for Tech Buzz Visualization & Trend Prediction*

<br>
</div>

<div align="center">

Developed by : **IMESMAD Maryam** & **OUSMAAIL Douae**

Under the supervision of : **Pr. Yann Ben Maissa**

*ASEDS Major · INPT · Academic Year 2025/2026*</div>

---

### Project Concept
> **Web Application for Tech Buzz Visualization and Trend Prediction using Recurrent Neural Networks (LSTM)**

*SocialPulse is a year-end project designed to analyze social media buzz, model the impact of emerging technologies, and predict future market trends using the power of Deep Learning architectures.*

---

## Credits & Contributions

* **Development & Contributions:** [Maryam IMESMAD](https://github.com/maryamimesmad05-svg) & [Douae OUSMAAIL](https://github.com/DouaeOusmaail)
* **Idea, Supervision, Technical Coaching, Administration & Maintenance:** Pr. Yann BEN MAISSA

---

## Overview

SocialPulse is a full-stack platform that continuously aggregates public data from **Reddit**, **Hacker News**, and **GitHub**, detects mentions of emerging technologies, and predicts their short-term dynamics using two machine learning models executed **entirely locally** (linear regression and TensorFlow.js LSTM).

Main Dashboard

<img width="1917" height="917" alt="dashboard" src="https://github.com/user-attachments/assets/49b6a146-0f02-4ab4-af12-b61967d68088" />

---

## Features

| Feature | Description |
|---|---|
| Automated Collection | Scheduled scrapers (`node-cron`) for Reddit, HN, and GitHub |
| Keyword Extraction | ~130 technologies detected via compiled regular expressions |
| Interactive Visualizations | Ranking, Radar, Heatmap, Bubble Chart, Sankey, Sparklines |
| AI Prediction | Baseline (Linear Regression) + LSTM (TensorFlow.js) |
| Geographic Filtering | France, Morocco, Global — inferred from the originating subreddit |
| Hybrid Caching | RAM (`store.js`) + MongoDB Atlas persistence |
| Real-time Stream | LIVE panel refreshed every 30 seconds |

---

## Interface

### Dashboard
Filter Bar
<img width="1612" height="375" alt="filterbar" src="https://github.com/user-attachments/assets/a406225f-3cae-4384-8c0b-aa6172242df0" />

"Most Popular" Card and Donut Chart by Domain
<img width="1595" height="532" alt="answercard" src="https://github.com/user-attachments/assets/fa4064d5-b686-4a87-bed5-9e8000b33bc0" />

Interactive Ranking and Source Profile Radar Chart
<img width="1597" height="647" alt="ranking" src="https://github.com/user-attachments/assets/f0911111-3b4f-4f64-a489-8e0f26698967" />

Activity Heatmap and Comparative Evolution
<img width="1592" height="477" alt="heatmap" src="https://github.com/user-attachments/assets/71055d51-8feb-4ce4-b8df-dee5c89fa1c6" />

Score vs. Mentions Bubble Chart
<img width="1602" height="780" alt="bubble" src="https://github.com/user-attachments/assets/39620e1a-d7d4-4106-80be-bdce1630dd80" />

Source Flow Diagram (Sankey)
<img width="1592" height="671" alt="sankey" src="https://github.com/user-attachments/assets/87a28a24-23f6-4fb4-a0c6-f1c30fd7a9cb" />

Rising Keywords and Real-time Stream
<img width="1572" height="757" alt="trending" src="https://github.com/user-attachments/assets/24cc349b-ba6b-4df7-853c-11cedbf27131" />

### AI Predictions Page
Baseline Predictions
<img width="1891" height="917" alt="predictions" src="https://github.com/user-attachments/assets/66dfb503-91f3-4e03-b41f-5e2ed146b89d" />

LSTM Predictions
<img width="1900" height="921" alt="predictions_lstm" src="https://github.com/user-attachments/assets/d14e307c-5614-4421-b5e4-9c9cc638edb6" />

### Technology Detail Page
Detailed Technology Analysis
<img width="1917" height="920" alt="keyword" src="https://github.com/user-attachments/assets/52981c44-b827-4448-87e5-659104425e0a" />

Associated Publications and Co-occurrences
<img width="1917" height="921" alt="keyword_cooc" src="https://github.com/user-attachments/assets/b1eb01b7-5fa2-413c-82f3-9b0669a44785" />

### Source-Specific Pages
Reddit Analysis

<img width="1912" height="917" alt="sourceReddit" src="https://github.com/user-attachments/assets/b028d585-cc88-4f68-a361-1ee8c1c8ed25" />

<img width="1900" height="922" alt="sourceReddit2" src="https://github.com/user-attachments/assets/6e6012fc-622d-4389-bb64-ea8d1753dcc2" />

Hacker News Analysis

<img width="1906" height="921" alt="sourceHN" src="https://github.com/user-attachments/assets/3dc4417b-90d1-483a-8918-821d0234789b" />

<img width="1896" height="922" alt="sourceHN2" src="https://github.com/user-attachments/assets/a50b2dd5-1acf-4bc4-a2b9-008fe8eec6fe" />

GitHub Analysis

<img width="1895" height="912" alt="sourceGH" src="https://github.com/user-attachments/assets/f4d2d583-61ed-44c7-85a2-dc7aa1171347" />

<img width="1896" height="922" alt="sourceGH2" src="https://github.com/user-attachments/assets/4ce8f86c-aeb8-4ca1-a47c-fb7daad543ea" />

---

## Architecture

SocialPulse is built on a **three-tier** architecture:

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
##  Scraper Scheduling

| Source | Cron Expression | Frequency |
|---|---|---|
| Reddit | `*/5 * * * *` | Every 5 minutes |
| Hacker News | `*/3 * * * *` | Every 3 minutes |
| GitHub | `0 */2 * * *` | Every 2 hours |

---

## Prediction Models

### Baseline — Linear Regression
- Least squares line fitting on the score time series.
- Relative Speed = slope / mean · Confidence = $R^2$.
- Minimum required: **3 data points**.

### LSTM — TensorFlow.js
- Sequential network: 1 LSTM layer (8 units) + 1 Dense layer.
- Sliding windows `lookback = 6`, trained over `40 epochs`.
- Iterative forecasting over the selected horizon (+6h, +12h, +24h).
- Minimum required: **48 data points** (≈ 2 days of data collection).
- If insufficient → graceful degradation to the Baseline.

---

## Project Structure
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
## Tech Stack

### Frontend
- **React 19** + **Vite** — Dynamic and modular SPA
- **TailwindCSS v4** — Utility-first, fully responsive
- **Recharts** — Composable charts (area, bar, radar, bubble)
- **lucide-react** — Iconography

### Backend
- **Node.js** + **Express.js** — Asynchronous REST API
- **node-cron** — Scraper scheduling
- **TensorFlow.js** — In-process trained LSTM model
- **Axios** — HTTP client with automatic retry (429)
- **RateLimiter** (custom) — Asynchronous queue

### Storage
- **MongoDB Atlas** — Document-oriented NoSQL
- **Mongoose** — ODM with `Item` and `Snapshot` schemas

### Deployment
- **Railway** — Cloud backend (continuous data collection)
- **MongoDB Atlas** — Managed database
- **Vite dev server** — Local frontend

---

## Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account 
- Reddit cookie `loid` (to bypass 403 blockages)

### 1. Clone the Repository

```bash
git clone [https://github.com/Prof-Yann-BEN-MAISSA-Student-Projects/Social-Technology-Pulse-INE1.git](https://github.com/Prof-Yann-BEN-MAISSA-Student-Projects/Social-Technology-Pulse-INE1.git)
cd Social-Technology-Pulse-INE1
```
### 2. Backend Configuration
Create the `backend/.env`  file:
```env
PORT=3001

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/SocialPulse

# Reddit (loid cookie from browser inspector)
REDDIT_SUBREDDITS=programming,technology,MachineLearning,webdev,javascript,Python
REDDIT_USER_AGENT=SocialPulseINPT/0.1 (Academic project, INPT Morocco)
REDDIT_COOKIE=loid=...

# GitHub (optional — increases API quota)
GITHUB_TOPICS=web,ai,devops,cli,database
GITHUB_TOKEN=ghp_...
```

### 3. Start the Backend
```bash
cd backend
npm install
npm start          # production
# or
npm run dev        # watch mode
```

The server listens on `http://localhost:3001` and triggers the scrapers immediately.

### 4. Frontend Configuration

Create the `frontend/.env.local` file :

```env
# Local Backend
VITE_API_URL=http://localhost:3001

# or deployed Railway backend
# VITE_API_URL=https://<service-name>.up.railway.app
```

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Deployment (Railway)

1. Connect your GitHub repository to Railway.
2. Select the `backend/` folder as the root of the service.
3. Fill in all environmental variables in the Railway dashboard.
4. Railway automatically detects Node.js, runs `npm install` and executes `npm start`.
5. Update `VITE_API_URL` in `frontend/.env.local` with your public Railway URL.

> **Important :** Hosting the backend in the cloud allows continuous data collection to run permanently, accumulating the history needed to activate the LSTM model.

---
*INPT — Institut National des Postes et Télécommunications · Année académique 2025/2026*
