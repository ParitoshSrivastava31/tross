import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/server.js';

describe('API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns ok status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('ok');
    expect(json.service).toBe('linkedin-profile-api');
  });

  it('POST /api/v1/profile extracts profile data successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/profile',
      payload: {
        url: 'https://www.linkedin.com/in/satyanadella',
        enrichEmail: true,
      },
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('success');
    expect(json.data.fullName).toBe('Satya Nadella');
    expect(json.data.currentCompany.name).toBe('Microsoft');
    expect(json.data.experience.length).toBeGreaterThan(0);
    expect(Array.isArray(json.data.skills)).toBe(true);
    expect(json.data.contactInfo.professionalEmail).toBe('satya.nadella@microsoft.com');
  });

  it('POST /api/v1/profile rejects invalid LinkedIn URL', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/profile',
      payload: {
        url: 'https://notlinkedin.com/user/123',
      },
    });

    expect(res.statusCode).toBe(400);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('error');
    expect(json.error.code).toBe('INVALID_LINKEDIN_URL');
  });

  it('GET /api/v1/profile with query parameter works', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/profile?url=https://www.linkedin.com/in/williamhgates',
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('success');
    expect(json.data.fullName).toBe('Bill Gates');
  });

  it('POST /api/v1/batch extracts multiple profiles', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/batch',
      payload: {
        urls: [
          'https://www.linkedin.com/in/satyanadella',
          'https://www.linkedin.com/in/reidhoffman',
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('success');
    expect(json.total).toBe(2);
    expect(json.successful).toBe(2);
    expect(json.results.length).toBe(2);
  });

  it('POST /api/v1/batch/export-csv returns text/csv header and rows', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/batch/export-csv',
      payload: {
        urls: ['https://www.linkedin.com/in/satyanadella'],
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.body).toContain('Satya Nadella');
    expect(res.body).toContain('Microsoft');
  });

  it('GET /docs loads customized swagger documentation UI', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/docs/',
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.body).toContain('custom-swagger.css');
    expect(res.body).toContain('custom-swagger.js');
  });
});
