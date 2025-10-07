# Notes Backend (Express)

A simple Express backend for a personal notes organizer. Provides REST endpoints for authentication, user profile, and notes CRUD with search, filtering, and pagination.

## Features
- Auth: Register and Login with JWT
- Users: Get current user profile
- Notes: Create, Read, Update, Delete
- Search/filter: q, tag, pinned, archived
- Pagination: page, limit with metadata
- CORS: allows requests from http://localhost:3000
- In-memory/file-based data store (JSON on disk, best-effort)
- Swagger docs available at /docs

## Requirements
- Node.js 18+ recommended

## Getting Started

1. Install dependencies:
   - npm install

2. Create a .env file (optional):
   - See .env.example for available variables
   - If JWT_SECRET is not set, a development default is used (warning is logged)

3. Run in development:
   - npm run dev

4. Run in production:
   - npm start

The server listens on port 3001 by default.

## Environment Variables
- JWT_SECRET: Secret key used to sign JWTs (optional for local dev)

## Endpoints Overview

Base URL: http://localhost:3001

- Health
  - GET / : returns service status

- Auth
  - POST /auth/register : { email, password, name? } -> { token, user }
  - POST /auth/login : { email, password } -> { token, user }

- Users
  - GET /users/me : returns current user (requires Authorization: Bearer <token>)

- Notes (all require Authorization: Bearer <token>)
  - GET /notes
    - Query params: q, tag, pinned, archived, page=1, limit=10
    - Returns: { data: Note[], meta: { page, limit, total, totalPages, hasNextPage, hasPrevPage } }
  - POST /notes
    - Body: { title: string, content?: string, tags?: string[], pinned?: boolean, archived?: boolean }
  - GET /notes/:id
  - PUT /notes/:id
    - Body: Partial of { title, content, tags, pinned, archived }
  - DELETE /notes/:id

## Data Model

Note:
- id: string (uuid)
- userId: string
- title: string
- content: string
- tags: string[]
- createdAt: ISO string
- updatedAt: ISO string
- pinned: boolean
- archived: boolean

User:
- id: string (uuid)
- email: string
- passwordHash: string
- name: string
- createdAt: ISO string

## Swagger/OpenAPI
API docs are generated using swagger-jsdoc and served at:
- http://localhost:3001/docs

## Development Notes
- Data persistence is best-effort: data is stored in data/store.json when the environment allows writing to disk. If writing is not possible (e.g., read-only filesystem), the app runs purely in-memory for that process.
- JWT secret fallback is for development only. For production, set JWT_SECRET in environment.

## License
MIT
