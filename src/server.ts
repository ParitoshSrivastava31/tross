import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { profileRoutes } from './routes/profile.routes.js';
import { batchRoutes } from './routes/batch.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { AppError, isAppError } from './core/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    ajv: {
      customOptions: {
        strict: false,
      },
    },
    logger: env.NODE_ENV === 'test' ? false : {
      level: 'info',
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            hostname: req.hostname,
            remoteAddress: req.ip,
          };
        },
      },
    },
  });

  // 1. CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // 2. Helmet Security Headers (Relaxed CSP for Swagger and Playground)
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // 3. Rate Limiting
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: '1 minute',
  });

  // 4. Swagger / OpenAPI Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'LinkedIn Profile API & Scraper Engine',
        description:
          'Reverse-engineered LinkedIn Profile API extracting 44+ profile attributes, experiences, skills, education, contact info, email discovery, and PhantomBuster-compatible CSV export.',
        version: '1.0.0',
        contact: {
          name: 'API Support',
        },
      },
      servers: [
        {
          url: '/',
          description: 'Current Environment',
        },
      ],
      tags: [
        { name: 'Profile', description: 'Single profile extraction endpoints' },
        { name: 'Batch Scraper', description: 'Multi-profile extraction & CSV export' },
        { name: 'Health', description: 'Service health and readiness checks' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // 5. Static Assets for Web Playground
  const publicPath = path.join(__dirname, 'public');
  await app.register(fastifyStatic, {
    root: publicPath,
    prefix: '/',
    decorateReply: false,
  });

  // 6. Global Error Handler
  app.setErrorHandler((error: any, _request, reply) => {
    if (isAppError(error)) {
      return reply.status(error.statusCode).send({
        status: 'error',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          retryable: error.retryable,
        },
      });
    }

    if (error?.validation) {
      return reply.status(400).send({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.validation,
        },
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error?.message || 'Internal Server Error',
      },
    });
  });

  // 7. Register API Routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(profileRoutes, { prefix: '/api/v1' });
  await app.register(batchRoutes, { prefix: '/api/v1' });

  // Direct root healthz / readyz aliases
  app.get('/healthz', async (_req, reply) => reply.send({ status: 'ok' }));
  app.get('/readyz', async (_req, reply) => reply.send({ status: 'ready' }));

  return app;
}
