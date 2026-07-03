# Open Hiligaynon

A crowdsourced, open-source platform for translating, preserving, and sharing the Hiligaynon language. Built by the community, for everyone.

---

## 🚀 Overview

**Open Hiligaynon** is a full-stack web platform that lets anyone contribute and browse English ↔ Hiligaynon sentence pairs. Each sentence is enriched with semantic annotations — sentiment, sarcasm detection, and intent tagging — to build a high-quality, NLP-ready parallel corpus for this low-resource language.

**Key features:**

- ✍️ **Contribute translations** — Submit English ↔ Hiligaynon sentence pairs
- 🔍 **Browse the database** — Search, filter, and paginate the full corpus
- ⚡ **Community voting** — Upvote/downvote translations to surface the best ones
- 🧠 **Semantic annotations** — Sentiment (positive/neutral/negative), sarcasm flag, and intent label per sentence
- 🔌 **Open REST API** — Developers can query and integrate the dataset into their own apps

---

## 📦 Repository Structure

```text
HiligaynonEngine/
├── open-hiligaynon/          # Next.js 16 frontend (React 19, TypeScript, Tailwind CSS)
│   ├── app/                  # App Router pages
│   │   ├── page.tsx          # Home / landing page
│   │   └── sentences/        # Browse, create, and view sentence pages
│   ├── hooks/                # Custom React hooks (e.g., useSentences)
│   ├── lib/                  # Shared utilities (Axios client, sentence helpers)
│   ├── services/             # Frontend API service layer (SentenceService)
│   └── types/                # TypeScript type definitions
│
├── open-hiligaynon-api/      # Express 5 REST API backend (Node.js, TypeScript, Prisma)
│   ├── src/
│   │   ├── app.ts            # Express app setup (CORS, middleware, routes)
│   │   ├── index.ts          # Server entry point
│   │   ├── controllers/      # Request/response handlers
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Business logic (normalization, voting, CRUD)
│   │   ├── lib/              # Prisma client singleton
│   │   └── utils/            # Shared utilities
│   └── prisma/
│       ├── schema.prisma     # Database schema (Sentence, Token, Idiom, Vote)
│       └── migrations/       # Prisma migration history
│
└── Postman/                  # Postman collection for API testing
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Express 5, Node.js, TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| HTTP Client | Axios |
| Dev Tools | tsx (hot-reload), ESLint, Prisma Studio |

---

## 🗄️ Database Schema

The core data model is built around four Prisma models:

- **`Sentence`** — A parallel sentence pair (`english` + `hiligaynon`) with normalized text for search, cached vote counters, verification status (`pending` / `verified` / `rejected`), and semantic fields (`sentiment`, `intent`, `isSarcastic`).
- **`Token`** — Individual word tokens linked to a sentence, storing text, normalized form, root word, POS tag, and dialect/slang flags.
- **`Idiom`** — Multi-word expressions (e.g., "igo na", "bwas damlag") with their unified meaning and type (colloquial, traditional, metaphor).
- **`Vote`** — Per-IP vote records for each sentence, enforcing one vote per network identity to prevent manipulation.

---

## 🔌 API Endpoints

Base path: `/api/sentences`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/sentences` | List sentences (supports `page`, `limit`, `search`, `sentiment`, `isSarcastic`, `status`) |
| `POST` | `/api/sentences` | Create a new sentence pair |
| `GET` | `/api/sentences/:id` | Get a single sentence with its tokens |
| `DELETE` | `/api/sentences/:id` | Delete a sentence |
| `POST` | `/api/sentences/bulk-delete` | Delete multiple sentences by ID array |
| `POST` | `/api/sentences/migrate` | Run pending Prisma migrations |
| `GET` | `/health` | Health check |

> Voting is handled via the sentence service using a thread-safe atomic transaction. A `POST` to cast a vote accepts `sentenceId`, `type` (`UP` or `DOWN`), and an optional `userId`. Duplicate votes from the same IP toggle off; switching vote direction is handled atomically.

---

## 🏃 Getting Started

### Prerequisites

- Node.js 22.x
- PostgreSQL database
- A `.env` file in `open-hiligaynon-api/` with `DATABASE_URL`

### Run the API

```bash
cd open-hiligaynon-api
npm install
npm run db:migrate     # Run database migrations
npm run dev            # Start API with hot-reload (tsx watch)
```

### Run the Frontend

```bash
cd open-hiligaynon
npm install
npm run dev            # Start Next.js dev server
```

---

## 📊 Sentence Dataset Format

### Sentence Pair (API request body)

```json
{
  "english": "I am hungry",
  "hiligaynon": "Gutom ako",
  "sentiment": 0,
  "intent": "express_hunger",
  "isSarcastic": false
}
```

### Sentence Pair (API response)

```json
{
  "id": "uuid",
  "english": "I am hungry",
  "hiligaynon": "Gutom ako",
  "normalizedEnglish": "i am hungry",
  "normalizedHiligaynon": "gutom ako",
  "status": "pending",
  "upVotes": 3,
  "downVotes": 0,
  "sentiment": 0,
  "intent": "express_hunger",
  "isSarcastic": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 🤝 Contributing

We welcome contributions from everyone — whether you're a native Hiligaynon speaker, a developer, or a language enthusiast.

**Ways to contribute:**

- Add sentence pairs via the web app or API
- Improve translation quality through community voting
- Report issues or suggest features on GitHub
- Submit books, PDFs, and references to improve the dataset

**Development workflow:**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request for review

---

## 📜 License

Licensed under the [MIT License](LICENSE).
