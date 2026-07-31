# ResQ – AI-Assisted Emergency Request & Dispatch Management System

A backend-only emergency request and dispatch management system built with Node.js, Express, PostgreSQL, and Redis. Features AI-powered emergency classification via Groq API with automatic rule-based fallback.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (pg) |
| Cache / Queue | Redis |
| AI Provider | Groq API (configurable) |
| Validation | Joi |
| Logging | Winston |
| Architecture | MVC + Service Layer + Repository Pattern + EventEmitter |

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # DB and Redis connection setup
│   ├── controllers/     # HTTP request/response handlers
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic layer
│   ├── repositories/    # Database access layer (Repository Pattern)
│   ├── models/          # Plain object factories (schema mapping)
│   ├── middlewares/     # Validation, error handling, request logging
│   ├── validators/      # Joi schemas
│   ├── events/          # EventEmitter singleton + event name constants
│   ├── listeners/       # Event listener registrations
│   ├── utils/           # Logger, AppError, AI classifier, rule classifier, Redis queue
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point – connects DB/Redis then starts server
├── migrations/
│   ├── 001_initial_schema.sql
│   └── migrate.js
├── seeders/
│   └── seed.js
├── logs/
├── package.json
├── .env.example
└── README.md
```

---

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14 (running locally or remote)
- Redis >= 7 (running locally or remote)
- A Groq API key (free at https://console.groq.com) — optional, falls back to rule engine

---

## Setup Instructions

### 1. Clone / Download the project

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your PostgreSQL credentials, Redis connection, and optionally your Groq API key:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=resq_db
DB_USER=postgres
DB_PASSWORD=yourpassword

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-8b-8192
AI_FALLBACK=true
```

> Set `AI_PROVIDER=none` to skip AI entirely and always use the rule engine.

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE resq_db;
```

### 5. Run migrations

```bash
npm run migrate
```

### 6. Seed sample data

```bash
npm run seed
```

### 7. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## API Reference

### Health Check
```
GET /health
```

---

### Emergencies

#### Create Emergency Request
```
POST /api/emergencies
Content-Type: application/json

{
  "user_id": 1,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "description": "Person collapsed on the street, not breathing."
}
```

#### Get Pending Emergencies (sorted by priority from Redis)
```
GET /api/emergencies/pending
```

#### Get Active Emergencies (from PostgreSQL)
```
GET /api/emergencies/active
```

#### Update Emergency Status
```
PATCH /api/emergencies/:id/status
Content-Type: application/json

{
  "status": "in_progress",
  "changed_by": 3
}
```
Valid statuses: `pending`, `assigned`, `in_progress`, `resolved`, `cancelled`

---

### Responders

#### Get All Responders
```
GET /api/responders
```

#### Assign Responder to Emergency
```
POST /api/responders/assign
Content-Type: application/json

{
  "request_id": 1,
  "responder_id": 1
}
```

---

### Dispatch

#### Send Dispatch Notification (simulated)
```
POST /api/dispatch/notify
Content-Type: application/json

{
  "request_id": 1
}
```

---

### AI Classification

#### Classify Emergency Description
```
POST /api/ai/classify
Content-Type: application/json

{
  "description": "There is a fire in the kitchen and smoke is filling the house."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "category": "Fire",
    "priority": "high",
    "recommended_responder": "Firefighter",
    "source": "ai"
  }
}
```

---

## Event System

| Event | Trigger | Listener Action |
|---|---|---|
| `emergency:created` | New emergency saved | Logs creation details |
| `responder:assigned` | Responder assigned | Logs assignment details |
| `status:updated` | Status changed | Logs change; re-emits `emergency:resolved` if resolved |
| `emergency:resolved` | Status → resolved | Logs resolution |
| `dispatch:notified` | Dispatch notify called | Logs simulated notification |

---

## AI Classification

- Default provider: **Groq** (`llama3-8b-8192`)
- Configurable via `AI_PROVIDER` env var (`groq` | `none`)
- On any AI failure, automatically falls back to the **rule-based classifier** (keyword matching)
- `classification_source` field in DB records whether result came from `ai` or `rule_engine`

### Emergency Categories
| Category | Priority | Responder |
|---|---|---|
| Medical | high / critical | Paramedic |
| Fire | high | Firefighter |
| Police | medium | Police Officer |

---

## Redis Usage

| Purpose | Key / Structure |
|---|---|
| Priority Queue | `resq:emergency:queue` (Sorted Set, score = priority × timestamp) |
| Temporary Cache | `setEx` with 5-minute TTL |

PostgreSQL is always the source of truth. Redis is used for fast queue reads only.

---

## Database Schema

- `users` – Citizens, dispatchers, admins
- `responders` – Emergency responders with type and availability status
- `emergency_requests` – Core emergency records with AI classification data
- `assignments` – Links emergencies to responders
- `status_history` – Full audit trail of status changes
- `system_logs` – Event-driven log entries (JSONB payload)

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |
| `npm run migrate` | Run SQL migrations |
| `npm run seed` | Insert sample data |
