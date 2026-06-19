# shortUrl

A URL shortener built to showcase TypeScript, Node.js, React, and AWS. Every click goes through a real Lambda function, persists in DynamoDB, and the frontend is served globally via CloudFront.

[![Deploy Frontend](https://github.com/lacerdatw/shortUrl/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/lacerdatw/shortUrl/actions/workflows/deploy-frontend.yml)
[![Deploy Backend](https://github.com/lacerdatw/shortUrl/actions/workflows/deploy.yml/badge.svg)](https://github.com/lacerdatw/shortUrl/actions/workflows/deploy.yml)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=flat&logo=awslambda&logoColor=white)
![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=flat&logo=amazondynamodb&logoColor=white)

---

## Architecture

```
Browser
  │
  ├─► CloudFront ──► S3 (React SPA)
  │
  └─► API Gateway ──► Lambda functions
                           │
                           └─► DynamoDB
```

The frontend and backend are completely decoupled. The React app is a static build served from S3 + CloudFront. All API calls go directly to API Gateway, which routes them to individual Lambda functions. There is no server to maintain.

---

## AWS Services

| Service | Role | Free tier |
|---|---|---|
| **Lambda** | Runs each API endpoint as an isolated function | 1M requests/month — always free |
| **API Gateway (HTTP API)** | Public HTTPS entry point, routes requests to Lambda | 1M requests/month for 12 months |
| **DynamoDB** | Stores URLs and users — no SQL, no connections, no idle cost | 25 GB + 25 WCU/RCU — always free |
| **S3** | Hosts the compiled React app as static files | 5 GB + 20K GETs/month for 12 months |
| **CloudFront** | CDN in front of S3 — HTTPS, caching, global edge delivery | 1 TB transfer + 10M requests/month for 12 months |
| **CloudFormation** | Provisions all infrastructure as code via Serverless Framework | Free |

---

## How deploys work

Everything is automated through GitHub Actions. Two independent workflows run on push to `main`:

### Backend — `.github/workflows/deploy.yml`

Triggered when anything under `backend/` changes.

```
push to main
  └─► npm ci
  └─► jest (44 tests, coverage)
  └─► serverless deploy
        └─► CloudFormation creates/updates:
              • Lambda functions (one per endpoint)
              • API Gateway HTTP API
              • DynamoDB tables
              • IAM execution role (least privilege)
```

The Serverless Framework compiles TypeScript via esbuild at deploy time — no TypeScript runtime needed in Lambda.

### Frontend — `.github/workflows/deploy-frontend.yml`

Triggered when anything under `frontend/` changes, or manually via GitHub's "Run workflow" button.

```
push to main
  └─► npm install
  └─► vite build (outputs dist/)
  └─► aws s3 sync dist/ → S3 bucket
  └─► cloudfront create-invalidation (clears CDN cache)
```

CloudFront serves the cached build globally. The invalidation forces edge nodes to fetch the new version from S3.

---

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | `{ email, password }` → `{ token }` |
| POST | `/auth/login` | — | `{ email, password }` → `{ token }` |
| POST | `/urls` | Bearer | `{ originalUrl }` → `{ code, shortUrl }` |
| GET | `/urls` | Bearer | Returns the logged-in user's URLs |
| GET | `/:code` | — | 302 redirect to original URL |

Auth uses stateless JWT — no sessions, no cookies. Passwords are hashed with bcrypt.

---

## Running locally

**Backend**
```bash
cd backend
cp .env.example .env   # fill in AWS credentials + JWT_SECRET
npm install
npm run dev            # http://localhost:3000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

**Tests**
```bash
cd backend
npm test          # watch mode
npm run test:ci   # single run + coverage
```

---

## Project structure

```
shortUrl/
├── backend/
│   ├── src/
│   │   ├── config/          DynamoDB client
│   │   ├── functions/       Lambda handlers (auth + urls)
│   │   ├── services/        Business logic
│   │   └── utils/           JWT, code generator, validator
│   └── serverless.yml       Infrastructure as code
├── frontend/
│   └── src/
│       ├── context/         Auth state (JWT)
│       ├── pages/           Home, Login, Register
│       ├── components/      Navbar, UrlForm, UrlTable, AuthDropdown
│       └── services/        Axios instance
├── docs/
│   └── iam-security.md      Hands-on IAM least-privilege guide
└── .github/workflows/       CI/CD pipelines
```

---

## IAM security

The Lambda execution role follows least privilege — it can only call the exact DynamoDB actions it needs on the exact table ARNs it owns. No wildcard resources, no wildcard actions. See [`docs/iam-security.md`](docs/iam-security.md) for a full breakdown.
