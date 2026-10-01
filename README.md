# Open Hiligaynon

Open Hiligaynon is an open-source Hiligaynon language-data platform for collecting translations and building reusable linguistic datasets. The project is designed for four related workloads:

- English ↔ Hiligaynon translation data
- grammar and token-level linguistic analysis
- dictionary / lexeme lookup
- machine-learning dataset preparation and export

The web application still presents a simple sentence-pair workflow, while the backend stores the corpus in a normalized language-data model.

---

## Architecture

```text
HiligaynonEngine/
├── open-hiligaynon/          # Next.js frontend
├── open-hiligaynon-api/      # Express + TypeScript + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── lib/
│       └── utils/
└── Postman/
```

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| API | Express, Node.js, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| HTTP client | Axios |

---

## Linguistic Data Model

The engine no longer treats an English/Hiligaynon pair as one flat database row.

### Corpus backbone

```text
Language
   │
   └── TextUnit
          ├── LinguisticAnnotation
          ├── TokenAnnotation ──> Lexeme ──> LexemeSense
          ├── GrammarAnnotation
          ├── TextSource ──> SourceRecord
          │
          ├── source of ──> Translation
          └── target of ──> Translation
                            ├── TranslationVote
                            ├── TranslationSource
                            └── DatasetItem ──> Dataset
```

### Core models

**Language** stores a reusable language identity such as `en` or `hil`.

**TextUnit** stores one piece of language data independently from its translation. A unit may be a word, phrase, sentence, or other future unit type. The original text and a normalized search/deduplication form are both retained.

**Translation** links a source `TextUnit` to a target `TextUnit`. Verification status, translation type, confidence, notes, votes, provenance, and dataset membership live on the translation relationship.

**LinguisticAnnotation** stores text-level NLP labels such as sentiment, intent, sarcasm, register, domain, and extensible JSON metadata.

**TokenAnnotation** stores ordered tokens and can link each occurrence to a reusable dictionary `Lexeme`. It also supports POS, morphology, dependency information, slang flags, offsets, and contextual notes.

**Lexeme / LexemeSense / LexemeTranslation** form the dictionary layer. A lexeme represents a reusable lemma, senses store definitions/glosses, and lexeme translations connect dictionary entries across languages.

**GrammarAnnotation** stores grammar structures at the text level or over a token span. The category/label/value plus JSON features allow the grammar model to grow without redesigning the database for every new annotation type.

**SourceRecord** and its link tables preserve provenance independently from the text itself. This is important before using community or reference material in a training corpus.

**Dataset / DatasetItem** explicitly define ML datasets and their `train`, `validation`, `test`, or custom splits.

---

## Compatibility Sentence API

The existing frontend can continue using the sentence endpoints. The API maps normalized `Translation + TextUnit` records back to the familiar response shape.

Base path: `/api/sentences`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/sentences` | List English → Hiligaynon translations |
| `POST` | `/api/sentences` | Create a translation pair |
| `GET` | `/api/sentences/:id` | Get one translation with token/grammar metadata |
| `PATCH` | `/api/sentences/:id` | Update a translation |
| `DELETE` | `/api/sentences/:id` | Delete a translation |
| `POST` | `/api/sentences/bulk-delete` | Delete multiple translations |
| `POST` | `/api/sentences/vote` | Upvote, downvote, switch, or remove a vote |

Supported list filters include `page`, `limit`, `search`, `sentiment`, `isSarcastic`, and `status`.

The old HTTP migration endpoint was removed. Production migrations run through the deployment process instead of being triggerable over a public API.

---

## Linguistic Engine API

Base path: `/api/engine`

### Dictionary

```http
GET /api/engine/dictionary?q=gid&language=hil
```

Returns lexemes, senses, and linked cross-language lexeme translations.

### Text analysis

Each sentence response includes `sourceTextId` and `targetTextId`. Use a text-unit ID to inspect the normalized linguistic representation:

```http
GET /api/engine/text-units/:id/analysis
```

The response may contain:

- language metadata
- semantic annotation
- ordered tokens
- linked dictionary lexemes and senses
- POS and morphological features
- dependency metadata
- grammar annotations
- provenance
- translations that use the text unit

### Training dataset export

```http
GET /api/engine/datasets/sample-dataset-v1/export
GET /api/engine/datasets/sample-dataset-v1/export?split=train
```

The export includes source/target language and text, annotations, target tokens, grammar metadata, translation metadata, dataset labels, weights, and provenance.

---

## Sample Data

A structured development seed is included.

```bash
cd open-hiligaynon-api
npm run db:seed
```

The sample seed creates:

- English and Hiligaynon language records
- 10 English → Hiligaynon translation pairs
- text-level sentiment, intent, and domain labels
- reusable Hiligaynon lexemes and senses
- token annotations linked to matching lexemes
- sample grammar annotations
- a provenance record
- a sample ML dataset with train / validation / test splits

Example translation:

```json
{
  "english": "Where are you going?",
  "hiligaynon": "Diin ka makadto?",
  "sentiment": 1,
  "intent": "location_question",
  "domain": "daily_life"
}
```

The underlying representation separates the two texts and can annotate the Hiligaynon target as:

```json
{
  "text": "Diin ka makadto?",
  "language": "hil",
  "tokens": [
    { "text": "Diin", "lemma": "diin", "pos": "interrogative" },
    { "text": "ka" },
    { "text": "makadto", "lemma": "makadto", "pos": "verb" }
  ],
  "grammar": [
    {
      "category": "sentence_type",
      "label": "interrogative",
      "value": "location_question"
    }
  ]
}
```

---

## Database Migration

The linguistic-engine migration is intentionally non-destructive.

It:

1. creates the normalized language-data tables;
2. seeds the English and Hiligaynon language identities;
3. deduplicates reusable English/Hiligaynon text units;
4. preserves existing sentence IDs as translation IDs;
5. migrates sentiment, intent, sarcasm, tokens, roots, votes, and idioms;
6. promotes legacy token roots into dictionary lexemes; and
7. leaves the legacy `Sentence`, `Token`, `Idiom`, and `Vote` tables in place as a rollback safety net.

Once production data has been validated against the new model, a later cleanup migration can remove the legacy tables.

---

## Local Development

### API prerequisites

- Node.js 22+
- PostgreSQL
- `DATABASE_URL` in `open-hiligaynon-api/.env`

### API

```bash
cd open-hiligaynon-api
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend

```bash
cd open-hiligaynon
npm install
npm run dev
```

### Production database deployment

```bash
npm run db:deploy
```

The API start command also runs `prisma migrate deploy` before starting the compiled server.

---

## Training-data guidance

A row being present in the corpus does not automatically mean it should be used for training. Prefer dataset items whose translation has been reviewed and whose source/provenance and usage rights are known. Keep train/validation/test membership explicit through `DatasetItem` instead of deriving splits ad hoc during export.

---

## Contributing

Useful contributions include translation review, dictionary entries, grammar annotations, source/provenance cleanup, dialect/register notes, and improvements to the API or UI.

---

## License

Project source code is licensed under the [MIT License](LICENSE). Dataset/source licensing should be tracked separately in `SourceRecord` and `Dataset` because contributed linguistic material may have different usage rights.
