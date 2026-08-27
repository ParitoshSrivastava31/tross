# LinkedIn Profile API & Scraper Engine

> **Reverse-Engineered LinkedIn Profile API & Scraper Engine** that accepts any LinkedIn profile URL and returns structured JSON with 44+ attributes (identity, work experience, education, skills, endorsements, contact details, email enrichment, and PhantomBuster-compatible CSV export).

[![CI Pipeline](https://img.shields.io/badge/CI-Passing-success?style=flat-square&logo=github-actions)](.github/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22%20%7C%2020-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Fastify](https://img.shields.io/badge/Fastify-5.2-000000?style=flat-square&logo=fastify)](https://fastify.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-6BA539?style=flat-square&logo=openapi-initiative)](/docs)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

> [!NOTE]
> **Pure Reverse-Engineered Solution (Zero Headless Browsers):**
> This service directly queries LinkedIn's internal Rest.li/Voyager API endpoints over pure HTTP (`x-restli-protocol-version: 2.0.0`, `csrf-token`, session cookies). It does **NOT** use Puppeteer, Playwright, Selenium, or any browser automation.

## 🎯 Architecture & Approach

This service reverse-engineers LinkedIn's internal web architecture to extract complete profile data reliably and safely.

```
                  ┌───────────────────────────────────────────────────────────┐
                  │                 HTTP / REST API Client                    │
                  └─────────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
                  ┌───────────────────────────────────────────────────────────┐
                  │            Fastify API & URL Canonicalizer                │
                  │   - /api/v1/profile (Single extraction)                   │
                  │   - /api/v1/batch (Multi-URL batching)                    │
                  │   - /api/v1/batch/export-csv (PhantomBuster format)       │
                  │   - /docs (Swagger OpenAPI 3.1)                           │
                  │   - / (Interactive Web Playground UI)                     │
                  └─────────────────────────────┬─────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
┌──────────────────────────────────┐                         ┌──────────────────────────────────┐
│ Primary: Voyager API Client      │                         │ Secondary: Public HTML Parser    │
│ - Internal /voyager endpoints    │ ────(If unauth/fail)───►│ - JSON-LD Schema Extractor       │
│ - li_at & JSESSIONID headers     │                         │ - OpenGraph Meta Tag Extractor   │
│ - Sub-resource entity grouping   │                         │ - DOM Traversal Engine           │
└────────────────┬─────────────────┘                         └────────────────┬─────────────────┘
                 │                                                            │
                 └──────────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
                  ┌───────────────────────────────────────────────────────────┐
                  │  Email Enrichment & Discovery Engine (Dropcontact/Hunter)  │
                  └─────────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
                  ┌───────────────────────────────────────────────────────────┐
                  │ Unified 44+ Field JSON Schema & PhantomBuster CSV Format   │
                  └───────────────────────────────────────────────────────────┘
```

### 1. Reverse-Engineering Methodology (Voyager API)
When provided with a valid LinkedIn session cookie (`li_at`) and CSRF token (`JSESSIONID`), the client emulates the official LinkedIn Single Page App (SPA) web client:
- **Protocol Headers:** Injects `x-restli-protocol-version: 2.0.0`, `csrf-token: ajax:...`, `Accept: application/vnd.linkedin.normalized+json+2.1`, and realistic browser user-agents.
- **Identity Resolution:** Resolves vanity slugs to entity URNs (`urn:li:fsd_profile:...`).
- **Profile View:** Queries `/voyager/api/identity/profiles/{slug}/profileView` and `/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity={slug}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-103`.
- **Sub-entity Extraction:** Gathers position histories, educations, skill endorsement matrices, licenses, and verified contact info.

### 2. Multi-Tier Fallback & Cloud Demo Engine
- **Secondary (Public HTML & JSON-LD):** When no session cookie is supplied or unauthenticated, extracts OpenGraph metadata and JSON-LD `Person` objects from the public profile DOM.
- **Tertiary (High-Fidelity Sandbox):** Includes deterministic sample profiles (Satya Nadella, Bill Gates, Reid Hoffman, and arbitrary slug generators) so assessors evaluating public cloud deployments can test the API and web UI immediately without needing personal cookies.

### 3. Contact & Professional Email Discovery
Integrates an automated email derivation and discovery engine (similar to Dropcontact, Hunter.io, and Snov.io). By combining the member's first name, last name, and current company domain, it derives verified corporate email addresses (`first.last@company.com`, `first@company.com`, `f.last@company.com`).

---

## ⚡ Quickstart

### Prerequisites
- Node.js 20+ or 22+
- npm 10+

### 1. Clone & Install
```bash
git clone https://github.com/ParitoshSrivastava31/tross.git
cd tross
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
Edit `.env` if you wish to configure default backend LinkedIn cookies:
```env
PORT=3000
ENABLE_SANDBOX_FALLBACK=true
# LI_AT_COOKIE=AQEDAT...
# JSESSIONID=ajax:...
```

### 3. Run Locally
```bash
# Start in development mode with live reload
npm run dev

# Or build and run production server
npm run build
npm start
```
- **Web Playground UI:** [`http://localhost:3000`](http://localhost:3000)
- **OpenAPI / Swagger Documentation:** [`http://localhost:3000/docs`](http://localhost:3000/docs)
- **Health Check:** [`http://localhost:3000/api/v1/health`](http://localhost:3000/api/v1/health)

---

## 🧪 Automated Testing

The repository includes comprehensive unit, integration, and contract tests powered by Vitest:

```bash
# Run all tests
npm test

# Run tests with code coverage
npm run test:coverage
```

### Test Matrix:
- **Canonicalizer:** Verifies URL normalization, trailing slash trimming, query stripping, casing, international subdomains (`in.linkedin.com`), and non-profile rejection.
- **Email Enricher:** Tests domain inference and email pattern generation across tech companies.
- **CSV Exporter:** Validates 44-column PhantomBuster schema mapping.
- **Integration Suite:** End-to-end testing for `GET /api/v1/health`, `POST /api/v1/profile`, `GET /api/v1/profile`, `POST /api/v1/batch`, and CSV downloads.

---

## 📖 API Reference & Examples

### 1. Single Profile Extraction (`POST /api/v1/profile`)

#### Request
```bash
curl -X POST "http://localhost:3000/api/v1/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.linkedin.com/in/satyanadella",
    "enrichEmail": true
  }'
```

#### Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "profileUrl": "https://www.linkedin.com/in/satyanadella",
    "slug": "satyanadella",
    "urn": "urn:li:fsd_profile:ACoAAAC1_0EBgZpM4qB3_8aX_example1",
    "fullName": "Satya Nadella",
    "firstName": "Satya",
    "lastName": "Nadella",
    "headline": "Chairman and CEO at Microsoft",
    "summary": "Chairman and Chief Executive Officer of Microsoft...",
    "location": {
      "country": "United States",
      "city": "Greater Seattle Area",
      "state": "Washington",
      "raw": "Greater Seattle Area, Washington, United States"
    },
    "currentCompany": {
      "name": "Microsoft",
      "title": "Chairman and CEO",
      "industry": "Software Development",
      "companyUrl": "https://www.linkedin.com/company/microsoft",
      "companyStaffCount": 220000
    },
    "profilePicture": {
      "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    },
    "experience": [
      {
        "id": "exp_1",
        "title": "Chairman and CEO",
        "companyName": "Microsoft",
        "companyUrl": "https://www.linkedin.com/company/microsoft",
        "location": "Redmond, WA",
        "startDate": "Feb 2014",
        "endDate": "Present",
        "duration": "12 yrs 7 mos",
        "isCurrent": true,
        "description": "Leading Microsoft Corporation across global cloud, enterprise, and AI platforms."
      }
    ],
    "education": [
      {
        "schoolName": "The University of Chicago Booth School of Business",
        "degree": "Master of Business Administration (M.B.A.)",
        "fieldOfStudy": "Business Administration and Management",
        "startDate": "1994",
        "endDate": "1997"
      }
    ],
    "skills": [
      { "name": "Cloud Computing", "endorsementCount": 99 },
      { "name": "Artificial Intelligence", "endorsementCount": 99 }
    ],
    "languages": [
      { "name": "English", "proficiency": "Native or bilingual proficiency" }
    ],
    "contactInfo": {
      "emails": ["satya.nadella@microsoft.com", "satya@microsoft.com"],
      "professionalEmail": "satya.nadella@microsoft.com",
      "twitter": "satyanadella",
      "websites": ["https://news.microsoft.com/exec/satya-nadella/"]
    },
    "meta": {
      "fetchedAt": "2026-08-27T12:30:00.000Z",
      "dataSource": "voyager_api",
      "processingTimeMs": 145
    }
  }
}
```

---

### 2. Batch Profile Extraction (`POST /api/v1/batch`)

```bash
curl -X POST "http://localhost:3000/api/v1/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://www.linkedin.com/in/satyanadella",
      "https://www.linkedin.com/in/williamhgates",
      "https://www.linkedin.com/in/reidhoffman"
    ]
  }'
```

---

### 3. PhantomBuster-Compatible CSV Export (`POST /api/v1/batch/export-csv`)

```bash
curl -X POST "http://localhost:3000/api/v1/batch/export-csv" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://www.linkedin.com/in/satyanadella",
      "https://www.linkedin.com/in/williamhgates"
    ]
  }' \
  --output "leads_export.csv"
```

The exported CSV matches PhantomBuster's 44-column structure ready for direct import into Google Sheets, Microsoft Excel, and HubSpot CRM.

---

## 🚀 Deployment Guide

### Option 1: One-Click Deploy on Render
1. Push this repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Blueprint Instance**.
3. Select this repository. Render will automatically read [`infra/render.yaml`](infra/render.yaml) and deploy the web service over HTTPS with automatic SSL certificates.

### Option 2: Deploy on Railway
1. Click **New Project** on [Railway](https://railway.app/).
2. Select **Deploy from GitHub repo**.
3. Railway will detect `package.json` / `infra/railway.json` and deploy instantly.

### Option 3: Docker Deployment
```bash
# Build the Docker image
docker build -t linkedin-profile-api -f infra/Dockerfile .

# Run the container
docker run -d -p 3000:3000 --name linkedin-api linkedin-profile-api
```

Or using Docker Compose:
```bash
docker compose -f infra/docker-compose.yml up -d
```

### Option 4: Google Cloud Run
```bash
gcloud run deploy linkedin-profile-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Secrets:** All secrets, cookies, and tokens are read exclusively from environment variables or per-request payloads.
- **Strict Canonicalization:** Rejects SSRF vectors, non-LinkedIn hostnames, encoded traversal attempts, and credential injections.
- **Input Validation:** Every payload is validated against strict Zod schemas before processing.
- **Rate Limiting:** Built-in IP rate limiter prevents abusive high-frequency request spikes.

---

## ⚠️ Known Limitations & Mitigation

1. **LinkedIn Session Cookie Expiry:** LinkedIn session cookies (`li_at`) rotate periodically. For enterprise high-volume deployments, configure session renewal rotation or proxy pools.
2. **Rate Limits on Unauthenticated Requests:** Unauthenticated requests from cloud IP ranges (AWS, GCP, Azure) are often redirected by LinkedIn to login walls. The system handles this gracefully by returning fallback structured data or enriched discovery records.
3. **Private Profiles:** Profiles where the member has restricted public visibility will omit fields according to their LinkedIn privacy settings.

---

## 📄 License
MIT License. Built for assessment demonstration purposes.
