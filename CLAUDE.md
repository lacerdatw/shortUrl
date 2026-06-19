# URL Shortener — Project Guide

Study project showcasing TypeScript, Node.js, React, and AWS (Lambda + DynamoDB).

## Project Structure

```
shortUrl/
├── backend/    TypeScript Lambda functions + Serverless Framework
├── frontend/   React + Vite + DaisyUI (TypeScript)
└── docs/
    └── iam-security.md    Hands-on IAM guide
```

---

## Tech Stack

| Layer     | Tech                                               |
|-----------|----------------------------------------------------|
| Backend   | TypeScript, AWS Lambda, API Gateway, DynamoDB      |
| Deploy    | Serverless Framework + serverless-esbuild          |
| Auth      | JWT (stateless), bcryptjs                          |
| Testing   | Jest + ts-jest (TDD)                               |
| Frontend  | React 18, Vite, DaisyUI + Tailwind, React Router  |

---

## AWS Setup

Only **DynamoDB** is used (always-free tier: 25 WCU, 25 RCU, 25 GB).
Tables are created automatically by `serverless deploy`.

### Tables

**`shorturl-urls-{stage}`**
| Attribute   | Type | Role                             |
|-------------|------|----------------------------------|
| code        | S    | Partition key                    |
| userId      | S    | GSI partition key (userId-index) |
| originalUrl | S    |                                  |
| createdAt   | S    |                                  |
| clicks      | N    | starts at 0                      |

**`shorturl-users-{stage}`**
| Attribute    | Type | Role          |
|--------------|------|---------------|
| email        | S    | Partition key |
| passwordHash | S    |               |
| createdAt    | S    |               |

---

## Backend

### Running Locally

```bash
cd backend
cp .env.example .env    # fill in real AWS credentials
npm install
npm run dev             # starts serverless offline on http://localhost:3000
```

### Testing (TDD)

```bash
npm test          # watch mode
npm run test:ci   # single run + coverage
npm run typecheck # tsc --noEmit
```

### Deploying to AWS

```bash
npm run deploy         # deploys to dev stage
npm run deploy:prod    # deploys to prod stage
```

### API Endpoints

| Method | Path            | Auth   | Description                                         |
|--------|-----------------|--------|-----------------------------------------------------|
| POST   | /auth/register  | none   | `{email, password}` → `{token}`                    |
| POST   | /auth/login     | none   | `{email, password}` → `{token}`                    |
| POST   | /urls           | Bearer | `{originalUrl}` → `{code, shortUrl, originalUrl}` |
| GET    | /urls           | Bearer | Returns only the logged-in user's URLs              |
| GET    | /:code          | none   | 301 redirect → `Location: originalUrl`             |

### Business Rules
- `originalUrl` must start with `http://` or `https://`
- `code` = 6 random alphanumeric chars (crypto.randomInt)
- Uniqueness check before save — re-generate on collision
- `clicks` starts at 0; each redirect increments via `UpdateItem`
- Passwords hashed with bcrypt (saltRounds: 10)
- Auth errors return generic messages — never distinguishes "user not found" from "wrong password"

### Code Architecture

```
backend/src/
├── config/dynamodb.ts          DynamoDB DocumentClient singleton
├── functions/
│   ├── auth/register.ts|test   POST /auth/register handler
│   ├── auth/login.ts|test      POST /auth/login handler
│   └── urls/
│       ├── create.ts|test      POST /urls handler
│       ├── list.ts|test        GET /urls handler
│       └── redirect.ts|test    GET /:code handler
├── services/
│   ├── urlService.ts|test      URL business logic + DynamoDB ops
│   └── userService.ts|test     User business logic + DynamoDB ops
└── utils/
    ├── codeGenerator.ts|test   6-char random code (crypto.randomInt)
    ├── jwt.ts|test             signToken / verifyToken
    ├── response.ts             HTTP response helpers
    └── urlValidator.ts|test    isValidUrl
```

### IAM Security
See `docs/iam-security.md` for a full hands-on guide on:
- What the execution role is and how Serverless Framework creates it
- Why specific actions and resource ARNs matter
- How to verify permissions in the AWS Console and CLI
- Per-function roles and Parameter Store for production

---

## Frontend

**Stack:** React 18, Vite, DaisyUI + Tailwind, React Router v6, Axios, TypeScript

### UX Flow

**Home (`/`):**
- URL input + "Shorten" button always visible
- Unauthenticated click → animated dropdown slides from upper-right: "To shorten your link, register or log in"
- Authenticated click → URL shortened immediately, result shown with copy button
- User's URL list shown below the form

**Navbar (upper-right):**
- Logged out: "Login" + "Register" buttons
- Logged in: user email + "Logout"

### Frontend Structure

```
frontend/src/
├── context/AuthContext.tsx       JWT state, login/logout/register
├── services/api.ts               Axios instance with auth interceptor
├── pages/
│   ├── HomePage.tsx              Shortener form + URL list + auth dropdown
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── components/
│   ├── Navbar.tsx
│   ├── UrlForm.tsx               Triggers dropdown if not authed
│   ├── AuthDropdown.tsx          Animated slide-down panel
│   └── UrlTable.tsx              User's URLs + copy + clicks
└── App.tsx
```

### Running the Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

---

## Quick API Test (curl)

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create URL
curl -X POST http://localhost:3000/urls \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://github.com"}'

# List my URLs
curl http://localhost:3000/urls \
  -H "Authorization: Bearer <token>"

# Redirect (check 301 + Location header)
curl -v http://localhost:3000/<code>
```
