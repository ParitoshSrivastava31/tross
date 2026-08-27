# LinkedIn Profile API: implementation plan

## Important product and compliance boundary

The stated requirement conflicts with LinkedIn's published rules. Their User Agreement prohibits scraping profiles and automated access, and their API terms prohibit reverse engineering. A backend that uses a personal LinkedIn cookie or account credentials to collect arbitrary profiles is not a production-safe product.

- [LinkedIn User Agreement](https://www.linkedin.com/legal/user-agreement)
- [LinkedIn API Terms](https://www.linkedin.com/legal/l/api-terms-of-use)

Build this as a consent-based API, with an adapter for any LinkedIn-approved partner access the company later obtains. That gives you a real service, a clean public deployment, and an honest README. The supplied PhantomBuster example is not a reliable target schema: it says its basic scraper omits profile images, skills, and full work history.

- [Supplied LinkedIn Profile Scraper example](https://phantombuster.com/automations/linkedin/5589386912058181/linkedin-profile-scraper)

The intended production design is:

1. A customer creates an API key.
2. The profile owner signs in with LinkedIn through OAuth 2.0 and grants the permitted scopes.
3. The customer submits that owner's LinkedIn URL.
4. The API validates that the URL belongs to the authenticated connection, fetches only fields allowed by the configured official provider, and returns normalized JSON.
5. Fields the provider does not permit are explicitly marked `unavailable`, never guessed or scraped.

LinkedIn's standard open access is limited. The documented Profile API is restricted, and the standard member-auth flow provides only the authenticated member's name, headline, and photo. Access to another member's profile requires restricted access and is subject to privacy controls.

- [LinkedIn API access](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)
- [LinkedIn Profile API](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api?view=li-lms-2025-04)

If the challenge assessor insists on arbitrary public-profile extraction, ask for written authorization and a sanctioned data source. Do not conceal a scraper behind words like "provider" or store `li_at` cookies.

## Product contract

Support this flow:

1. A customer creates an API key.
2. The profile owner signs in with LinkedIn through OAuth 2.0 and grants the permitted scopes.
3. The customer submits that owner's LinkedIn URL.
4. The API validates that the URL belongs to the authenticated connection, fetches only fields allowed by the configured official provider, and returns normalized JSON.
5. Fields the provider does not permit are explicitly `unavailable`, never guessed or scraped.

## Architecture

Use a deliberately boring stack:

- TypeScript, Node.js 22, Fastify, Zod, Prisma.
- PostgreSQL for customers, encrypted OAuth connections, request records, consent receipts, and short-lived response cache.
- Cloud Run for HTTPS hosting, Cloud SQL Postgres, Secret Manager, and Cloud Logging.
- Cloud Tasks or a Postgres-backed worker for provider calls that may exceed the synchronous request budget.
- OpenAPI 3.1 generated from Zod schemas and served at `/docs`.
- GitHub Actions for typecheck, tests, security scan, container build, and deployment.

Keep provider code behind an interface:

```ts
interface ProfileProvider {
  getCapabilities(connection: Connection): Promise<Capabilities>;
  fetchSelfProfile(connection: Connection): Promise<ProviderProfile>;
  fetchPartnerProfile?(input: PartnerProfileInput): Promise<ProviderProfile>;
}
```

Implement `OfficialLinkedInProvider` first. Add `ApprovedPartnerProvider` only after the required contract and credentials exist. This avoids rewriting the API when access expands.

## API design

Use versioned endpoints:

- `POST /v1/oauth/linkedin/start`
- `GET /v1/oauth/linkedin/callback`
- `POST /v1/profile-requests`
- `GET /v1/profile-requests/{requestId}`
- `DELETE /v1/profile-requests/{requestId}`
- `GET /v1/capabilities`
- `GET /healthz`
- `GET /readyz`
- `GET /docs`

`POST /v1/profile-requests` accepts:

```json
{
  "linkedin_url": "https://www.linkedin.com/in/jane-doe/",
  "connection_id": "con_01J...",
  "refresh": false
}
```

Return `202 Accepted` for an asynchronous request, with a request URL. Permit `wait_seconds` from `0` to `15` for clients that prefer a synchronous result.

Use consistent error objects:

```json
{
  "error": {
    "code": "URL_NOT_OWNED_BY_CONNECTION",
    "message": "The submitted profile URL does not match this LinkedIn connection.",
    "request_id": "req_01J...",
    "retryable": false
  }
}
```

Use these status codes:

- `400` invalid input
- `401` missing or invalid API key
- `403` consent or ownership failure
- `404` missing resource
- `409` duplicate in-flight work
- `422` syntactically valid but unsupported URL
- `429` quota exceeded
- `502` or `503` provider failure

## Response schema

Every requested field must distinguish absent data from unavailable permission. This prevents downstream clients from treating “we could not access it” as “the person has none.”

```json
{
  "id": "prf_01J...",
  "source": {
    "provider": "linkedin_official",
    "profile_url": "https://www.linkedin.com/in/jane-doe/",
    "fetched_at": "2026-08-27T10:15:30Z",
    "data_freshness_seconds": 0
  },
  "person": {
    "name": {
      "given": "Jane",
      "family": "Doe",
      "full": "Jane Doe"
    },
    "headline": "Product engineer",
    "location": null,
    "about": null,
    "profile_image": {
      "url": "https://...",
      "expires_at": null
    },
    "experience": [],
    "education": [],
    "skills": [],
    "certifications": [],
    "languages": []
  },
  "field_status": {
    "location": "unavailable",
    "about": "unavailable",
    "experience": "unavailable",
    "education": "unavailable",
    "skills": "unavailable",
    "certifications": "unavailable",
    "languages": "unavailable"
  },
  "consent": {
    "connection_id": "con_01J...",
    "granted_at": "2026-08-27T10:10:00Z",
    "scope": ["openid", "profile"]
  }
}
```

Use this field status enum:

- `present`
- `empty`
- `hidden_by_member`
- `unavailable`
- `not_requested`
- `provider_error`

Do not return emails, phone numbers, connection graphs, endorsements, or inferred attributes unless a specific approved integration and explicit consent allow them.

## Implementation sequence

1. Create the repository with `apps/api`, `packages/contracts`, `infra`, `docs`, and `tests`.
2. Add ESLint, Prettier, strict TypeScript, environment validation at boot, `.env.example`, `.gitignore`, secret scanning, and dependency updates.
3. Define Zod request and response contracts first. Generate OpenAPI and contract tests from them.
4. Implement API-key authentication. Store only a keyed hash of each key. Show the raw key once.
5. Implement OAuth authorization-code flow with PKCE, state validation, nonce validation, exact redirect URI allow-listing, and encrypted token storage through a cloud KMS key.
6. Implement strict LinkedIn URL canonicalization. Accept only `https`, `www.linkedin.com` or `linkedin.com`, port 443, and `/in/{slug}`. Reject IP addresses, alternate subdomains, credentials in URLs, redirects, fragments, query strings, encoded path tricks, and non-profile routes.
7. Verify that the canonical submitted URL matches the connected user's verified vanity URL. Never fetch a page to “test” ownership.
8. Implement the official provider adapter, normalizer, `field_status` generation, and capability endpoint.
9. Add the request state machine: `queued`, `running`, `succeeded`, `failed`, `expired`, `deleted`. Make requests idempotent with an `Idempotency-Key`.
10. Add a short cache keyed by connection, canonical URL, provider version, and scopes. Default to 15 minutes. Never serve one customer's data to another.
11. Add rate limits at API-key and IP level, request-body limits, CORS allow-listing, security headers, structured logs with PII redaction, and tracing IDs.
12. Deploy a staging environment first. Run migrations as a release step, then deploy production behind managed TLS on a custom domain.

## Data model

Create these tables or equivalent models:

- `api_clients`: client ID, hashed API key, name, status, quota, timestamps.
- `oauth_connections`: client ID, provider, provider member ID, encrypted access/refresh tokens, scopes, token expiry, verified profile URL, revoked timestamp.
- `profile_requests`: request ID, client ID, connection ID, canonical URL, idempotency key, status, error code, timestamps, provider version.
- `profile_snapshots`: request ID, normalized JSON, field-status JSON, fetched timestamp, expiration timestamp, deletion timestamp.
- `consent_receipts`: connection ID, scopes, consent timestamp, policy version, OAuth transaction ID.
- `audit_events`: actor, action, resource ID, request ID, outcome, timestamp, with no raw tokens or unnecessary profile content.

Encrypt OAuth tokens at the application boundary with envelope encryption. Keep the KMS key separate from the database. Do not put secrets in GitHub, Docker images, logs, URLs, or error messages.

## Edge cases that must have tests

- Trailing slash, casing, tracking query parameters, Unicode, percent encoding, and an old or changed vanity URL.
- OAuth callback replay, invalid state, expired authorization code, denied consent, revoked token, and refresh-token failure.
- A profile URL owned by a different connected user.
- Scope permits a person name but not profile image or headline.
- Missing optional values versus a provider refusing to expose the field.
- Expiring image URLs. Return the provider URL and expiration metadata. Do not proxy arbitrary image URLs.
- Duplicate requests, stale cached data, request retry after a transient provider `429`, and no retry after `401` or `403`.
- Provider schema changes, unknown enum values, malformed provider payloads, and partial successful data.
- Customer deletes a connection. Revoke tokens where supported, erase cached responses, and retain only the minimum audit receipt required by policy.
- Log redaction. Test that access tokens, API keys, and profile text cannot appear in logs, errors, traces, or test snapshots.

## Security and abuse controls

- Require API keys on all profile endpoints.
- Apply per-client and per-IP rate limits.
- Add a per-client daily quota and a maximum concurrent request count.
- Use request timeouts, bounded retries with jitter, and a circuit breaker around provider calls.
- Treat all provider payloads as untrusted input. Validate them before normalization.
- Do not follow arbitrary redirects from submitted URLs.
- Set strict CORS origins instead of `*` in production.
- Use TLS everywhere, managed certificates, secure cookies, CSRF protection for browser OAuth routes, and HSTS.
- Redact names, about text, tokens, API keys, and image URLs from logs unless a field is essential for debugging.
- Provide deletion and token-revocation workflows.
- Record data-retention policy and processor/subprocessor information.

## Reliability and observability

Track:

- request count, success rate, latency percentiles, timeout rate, and provider error rate;
- `429`, `401`, and `403` rates separately;
- queue depth and age of oldest request;
- cache hit rate;
- normalization failures and schema-version mismatches.

Every response and log event should carry a `request_id`. Alert on sustained provider failures, unusual request volume, queue backlog, failed migrations, and secret-access errors. Never use profile contents as metric labels.

## README and delivery bar

The README should include:

- A clear “what this does” and “what it deliberately does not do” section.
- OAuth app setup, environment variables, local Docker Compose instructions, migration and test commands.
- A curl example for the full OAuth-to-profile flow.
- OpenAPI URL and complete error catalogue.
- A data-retention table and deletion endpoint.
- Security model, threat model, and incident response contact.
- Known limitations: standard LinkedIn access cannot return arbitrary profile details such as experience, skills, certifications, and education without approved access.
- Deployment steps for Cloud Run and the exact GitHub Actions secrets required, without values.

## Definition of done

The submission is complete when:

- The repository is public and contains all source, migrations, infrastructure configuration, tests, and documentation.
- The API is reachable over public HTTPS with a health endpoint and generated OpenAPI documentation.
- OAuth works in staging and production with exact redirect URIs.
- A consented authenticated member can retrieve the fields the configured provider permits.
- Unsupported fields return explicit status values instead of fabricated values.
- No credentials or tokens appear in Git history, images, logs, or documentation.
- Unit, integration, contract, security, and end-to-end tests pass in CI.
- The README documents the compliance boundary and known limitations.

The strongest submission is candid: it delivers a working public HTTPS API, shows senior-grade boundaries around consent and secrets, and explains precisely why the requested “reverse-engineer arbitrary profiles using my credentials” feature is not enabled.
