# Archivum — PDF Management System

A professional full-stack PDF management system with OAuth2, dual-token auth, per-page text extraction, and a polished dark UI.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Redux Toolkit + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | Passport.js (Local + Google OAuth2) + JWT dual-token |
| File Upload | Multer (memory storage) |
| PDF Processing | pdf-parse |
| DevOps | Docker + Docker Compose + Nginx |

---

## Quick Start

### 1. Clone & configure

```bash
git clone <repo>
cd pdf-manager

# Copy and fill in your secrets
cp .env.example .env
```

Required env vars:
- `JWT_SECRET` — at least 64 random characters
- `JWT_REFRESH_SECRET` — at least 64 random characters
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (optional, for Google OAuth)

### 2. Launch with Docker Compose

```bash
docker compose up --build
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api
- **PostgreSQL**: localhost:5432

### 3. Run database migrations

The backend Dockerfile runs `prisma migrate deploy` automatically on startup.

For local dev:
```bash
cd backend
cp .env.example .env        # Fill in DATABASE_URL
npm install
npx prisma migrate dev      # Run migrations
npm run dev                 # Start dev server
```

---

## Architecture

### Authentication Flow

```
User → POST /api/auth/login
     ← { accessToken } (15min, in JSON body)
     ← refreshToken cookie (7d, HttpOnly, Secure)

401 response → POST /api/auth/refresh (cookie sent automatically)
             ← { accessToken } (new, rotated)

POST /api/auth/logout → clears cookie + removes refresh token from DB
```

### PDF Processing Flow

```
1. Client uploads PDF via multipart/form-data
2. Multer stores file in memory (Buffer)
3. pdf-parse extracts text per page
4. Prisma bulk-inserts Page records (onDelete: Cascade)
5. File metadata saved with page_count
6. Client receives complete file + pages response
```

### Folder Structure

```
pdf-manager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # User, File, Page models
│   └── src/
│       ├── config/
│       │   ├── db.js              # Prisma client singleton
│       │   └── passport.js        # JWT + Local + Google strategies
│       ├── controllers/
│       │   ├── authController.js  # register/login/refresh/logout/oauth
│       │   └── fileController.js  # upload/list/detail/delete/search
│       ├── middleware/
│       │   ├── auth.js            # JWT authenticate middleware
│       │   └── upload.js          # Multer PDF filter
│       ├── routes/
│       │   ├── auth.js
│       │   └── files.js
│       ├── services/
│       │   └── pdfService.js      # pdf-parse extraction logic
│       ├── utils/
│       │   └── jwt.js             # token generation helpers
│       └── index.js               # Express app entry point
├── frontend/
│   └── src/
│       ├── features/
│       │   ├── auth/
│       │   │   ├── authSlice.js   # Redux slice + async thunks
│       │   │   ├── AuthPage.jsx   # Login/Register page
│       │   │   └── OAuthCallback.jsx
│       │   └── files/
│       │       ├── filesSlice.js  # Redux slice + async thunks
│       │       ├── Dashboard.jsx  # Main dashboard
│       │       ├── UploadZone.jsx # react-dropzone + progress bar
│       │       └── FileList.jsx   # Searchable file list
│       ├── components/
│       │   └── ProtectedRoute.jsx
│       ├── store/
│       │   └── index.js           # Redux store
│       └── utils/
│           └── api.js             # Axios + 401 interceptor
├── docker-compose.yml
└── .env.example
```

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{email, password}` | Register new user |
| POST | `/api/auth/login` | `{email, password}` | Login, returns accessToken |
| POST | `/api/auth/refresh` | — | Rotate refresh token (cookie) |
| POST | `/api/auth/logout` | — | Clear session |
| GET | `/api/auth/me` | — | Current user info |
| GET | `/api/auth/google` | — | Start Google OAuth flow |

### Files

All routes require `Authorization: Bearer <accessToken>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/files` | Upload PDF (`multipart/form-data`, field: `pdf`) |
| GET | `/api/files` | List files (`?search=&page=&limit=`) |
| GET | `/api/files/:id` | Get file + all pages |
| DELETE | `/api/files/:id` | Delete file (cascades pages) |
| GET | `/api/files/search` | Full-text search pages (`?q=`) |

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → APIs & Services → OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost/api/auth/google/callback`
4. Copy Client ID and Secret into `.env`

---

## Security Notes

- Passwords hashed with **bcrypt** (12 rounds)
- Refresh tokens stored in DB — **reuse detection** invalidates the session
- Refresh token cookie: **HttpOnly + Secure + SameSite=Strict**
- Access token is short-lived (15 min) and never stored in cookies
- File uploads restricted to **PDF only**, max **50MB**
