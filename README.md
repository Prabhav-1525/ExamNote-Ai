# ⚡ ExamNote AI

> Transform study notes into intelligent flashcards, audio scripts, and video ideas using GPT-4.

![Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-18-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange)

---

## ✨ Features

- **🔐 Auth** — JWT-based email/password login with bcrypt hashing
- **📤 File Upload** — Drag & drop PDF/Word files (max 10MB) with Multer
- **🤖 AI Processing** — GPT-4o extracts and generates 4 card types
- **🃏 Flashcards** — Front/back flip animation with SM-2 spaced repetition
- **📝 Quick Notes** — Collapsible topic bullets with copy-to-clipboard
- **🔊 Audio Cards** — Text-to-speech (Web Speech API) with scripts
- **🎬 Video Cards** — 30-sec explainer scripts + YouTube search links
- **🧠 Study Mode** — Quiz/review modes with progress tracking
- **📊 Analytics** — Cards created, study time, upload stats
- **🌙 Dark Mode** — Persisted per-user setting
- **📤 Export** — CSV and Anki-format export

---

## 🏗️ Project Structure

```
examNote-ai/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Login/register
│   │   ├── cardsController.js     # CRUD + review + export
│   │   └── uploadController.js    # File upload + AI processing
│   ├── middleware/
│   │   └── auth.js                # JWT protect middleware
│   ├── models/
│   │   ├── User.js                # User + bcrypt + rate limit
│   │   └── CardSet.js             # Cards schema (all types)
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── cards.js               # /api/cards/*
│   │   ├── upload.js              # /api/upload/*
│   │   └── user.js                # /api/user/*
│   ├── uploads/                   # Temp file storage (gitignored)
│   ├── server.js                  # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── Navbar.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx    # Auth state + dark mode
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx      # Card set gallery + stats
    │   │   ├── Upload.jsx         # File upload + polling
    │   │   ├── CardSetView.jsx    # All 4 card types
    │   │   └── StudyMode.jsx      # Flip cards + quiz mode
    │   ├── utils/
    │   │   └── api.js             # Axios with auth interceptor
    │   ├── App.jsx                # Routes + auth guards
    │   └── index.css              # Tailwind + custom styles
    ├── tailwind.config.js
    ├── vercel.json
    └── package.json
```

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### 1. Clone & install

```bash
git clone <your-repo>
cd examNote-ai

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# backend/.env
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/examnote
JWT_SECRET=your-32-char-random-secret-here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# frontend/.env
echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

App runs at `http://localhost:3000`

---

## ☁️ Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set root to `backend/`
4. **Build command:** `npm install`
5. **Start command:** `npm start`
6. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `FRONTEND_URL` (your Vercel URL)
   - `NODE_ENV=production`
7. Deploy → note your Render URL (e.g. `https://examnote-api.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your repo, set root to `frontend/`
3. Add environment variable:
   - `REACT_APP_API_URL=https://examnote-api.onrender.com/api`
4. Deploy!

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/upload` | ✅ | Upload + process file |
| GET | `/api/upload/status/:id` | ✅ | Poll processing status |
| GET | `/api/cards` | ✅ | List all card sets |
| GET | `/api/cards/:id` | ✅ | Get single card set |
| DELETE | `/api/cards/:id` | ✅ | Delete card set |
| POST | `/api/cards/:id/review` | ✅ | Update card review (SM-2) |
| POST | `/api/cards/:id/quiz` | ✅ | Save quiz attempt |
| POST | `/api/cards/:id/study-time` | ✅ | Log study time |
| GET | `/api/cards/:id/export?format=csv\|anki` | ✅ | Export cards |
| PATCH | `/api/user/settings` | ✅ | Update dark mode/goals |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- Routes protected by **JWT** middleware
- **Helmet.js** for HTTP security headers
- **CORS** restricted to frontend URL
- **Rate limiting** on auth (10 req/15min) and uploads (3/hour free)
- Input validation with **express-validator**
- File type validation (PDF/DOCX only)
- File size limit (10MB)

---

## 🧠 AI System Prompt

The following prompt is sent to GPT-4o for card generation:

```
Convert these study notes into structured study materials.
Generate: flashcards (Q&A with difficulty), quick notes (topic bullets),
audio card scripts (spoken explanations), and video card concepts 
(30-sec explainer with visual ideas). Format as JSON.
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Animations | CSS transforms, Framer Motion |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| File handling | Multer |
| PDF parsing | pdf-parse |
| Word parsing | mammoth.js |
| AI | OpenAI GPT-4o |
| TTS | Web Speech API |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📄 License

MIT
