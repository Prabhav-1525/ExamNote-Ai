# ⚡ ExamNote AI

> Transform your study notes into intelligent flashcards, audio scripts, and video ideas — powered by Groq AI.

[![Live Demo](https://img.shields.io/badge/Live-Demo-7C6CF5?style=for-the-badge)](https://exam-note-ai.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-10B981?style=for-the-badge)](https://examnote-ai.onrender.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge)](https://cloud.mongodb.com)

---

## 🎯 What is ExamNote AI?

ExamNote AI takes your messy PDF or Word study notes and instantly converts them into **4 types of interactive study materials** using AI — so you can study smarter, not harder.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 **Auth System** | JWT-based login & register with bcrypt password hashing |
| 📤 **File Upload** | Drag & drop PDF / Word files up to 10MB |
| 🤖 **AI Processing** | Groq LLaMA extracts and generates study cards automatically |
| 🃏 **Flashcards** | Flip animation with SM-2 spaced repetition tracking |
| 📝 **Quick Notes** | Collapsible bullet points with copy-to-clipboard |
| 🔊 **Audio Cards** | Text-to-speech playback using Web Speech API |
| 🎬 **Video Cards** | 30-sec explainer scripts + YouTube search links |
| 🧠 **Study Mode** | Quiz & review modes with progress tracking |
| 📊 **Analytics** | Cards created, study time, files processed |
| 🌙 **Dark Mode** | Persisted per-user preference |
| 📤 **Export** | Download cards as CSV or Anki format |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with React Router v6
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Dropzone** for file uploads
- **Web Speech API** for text-to-speech

### Backend
- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file handling
- **pdf-parse** for PDF text extraction
- **mammoth.js** for Word text extraction
- **Groq SDK** (LLaMA 3.3 70B) for AI card generation

### Deployment
- **Vercel** — Frontend
- **Render** — Backend
- **MongoDB Atlas** — Database
- **Groq** — AI (free tier)

---

## 📁 Project Structure

```
examNote-ai/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Login / Register
│   │   ├── cardsController.js      # CRUD, review, export
│   │   └── uploadController.js     # File upload + AI processing
│   ├── middleware/
│   │   └── auth.js                 # JWT protection
│   ├── models/
│   │   ├── User.js                 # User schema + bcrypt
│   │   └── CardSet.js              # All 4 card types schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cards.js
│   │   ├── upload.js
│   │   └── user.js
│   ├── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx       # Card gallery + stats
        │   ├── Upload.jsx          # Drag & drop + polling
        │   ├── CardSetView.jsx     # All 4 card types
        │   └── StudyMode.jsx       # Quiz & review
        ├── contexts/
        │   └── AuthContext.jsx     # Global auth + dark mode
        ├── components/
        │   └── layout/Navbar.jsx
        └── utils/
            └── api.js              # Axios + auth interceptor
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/examNote-ai.git
cd examNote-ai
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # Runs on http://localhost:5000
```

Fill in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/examnote
JWT_SECRET=your_random_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_your_groq_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Frontend
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm install
npm start          # Opens http://localhost:3000
```

---

## ☁️ Deployment

| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render | Free |
| Database | MongoDB Atlas M0 | Free |
| AI | Groq LLaMA | Free |

### Backend → Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo, set root to `backend/`
4. Build: `npm install` · Start: `npm start`
5. Add environment variables (same as `.env` above but with `NODE_ENV=production`)

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect repo, set root to `frontend/`
3. Add env variable: `REACT_APP_API_URL=https://your-render-url.onrender.com/api`
4. Deploy!

### Final Step
Go back to Render → Environment → update `FRONTEND_URL` to your Vercel URL.

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/upload` | ✅ | Upload & process file |
| GET | `/api/upload/status/:id` | ✅ | Poll processing status |
| GET | `/api/cards` | ✅ | List all card sets |
| GET | `/api/cards/:id` | ✅ | Get single card set |
| DELETE | `/api/cards/:id` | ✅ | Delete card set |
| POST | `/api/cards/:id/review` | ✅ | SM-2 spaced repetition |
| POST | `/api/cards/:id/quiz` | ✅ | Save quiz attempt |
| GET | `/api/cards/:id/export` | ✅ | Export CSV or Anki |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- All routes protected by **JWT middleware**
- **Helmet.js** HTTP security headers
- **CORS** restricted to frontend URL only
- **Rate limiting** on auth (10 req/15min)
- File type validation — PDF and DOCX only
- 10MB file size limit enforced by Multer
- Input sanitization with **express-validator**

---

## 🧠 AI Prompt

The following system prompt is sent to Groq LLaMA 3.3 70B:

```
Convert these study notes into structured study materials.
Generate flashcards (Q&A with difficulty rating), quick notes
(topic-grouped bullet points), audio card scripts (natural spoken
explanations), and video card concepts (30-sec explainer scripts
with visual ideas). Return as JSON only.
```

---

## 📄 License

Developed and maintained by Prabhav Saxena.
