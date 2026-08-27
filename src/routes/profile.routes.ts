import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { canonicalizeLinkedInUrl } from '../core/canonicalizer.js';
import { LinkedInVoyagerClient } from '../engine/linkedin-client.js';
import { AppError } from '../core/errors.js';

const ProfileQuerySchema = z.object({
  url: z.string().min(1, 'LinkedIn profile URL is required'),
  enrichEmail: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  useSandboxFallback: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? true : val === 'true')),
});

const ProfileBodySchema = z.object({
  url: z.string().min(1, 'LinkedIn profile URL is required'),
  liAtCookie: z.string().optional(),
  jsessionId: z.string().optional(),
  enrichEmail: z.boolean().optional().default(true),
  useSandboxFallback: z.boolean().optional().default(true),
});

export const profileRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/profile?url=...
  fastify.get(
    '/profile',
    {
      schema: {
        description: 'Extract full profile information from a LinkedIn profile URL',
        tags: ['Profile'],
        querystring: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', description: 'LinkedIn profile URL or vanity slug' },
            enrichEmail: { type: 'string', description: 'Enable email enrichment (true/false)' },
            useSandboxFallback: { type: 'string', description: 'Enable sandbox demo fallback (true/false)' },
          },
        },
        response: {
          200: {
            description: 'Successfully extracted LinkedIn profile',
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              data: { type: 'object', additionalProperties: true },
            },
          },
          400: {
            description: 'Invalid input or URL format',
            type: 'object',
            properties: {
              status: { type: 'string', example: 'error' },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = ProfileQuerySchema.safeParse(request.query);
        if (!parsed.success) {
          return reply.status(400).send({
            status: 'error',
            error: {
              code: 'INVALID_QUERY_PARAMS',
              message: parsed.error.issues[0]?.message || 'Invalid query parameters',
            },
          });
        }

        const { url, enrichEmail, useSandboxFallback } = parsed.data;
        const { canonicalUrl, slug } = canonicalizeLinkedInUrl(url);

        const client = new LinkedInVoyagerClient();
        const profile = await client.fetchProfile(canonicalUrl, slug, {
          enrichEmail,
          useSandboxFallback,
        });

        return reply.send({
          status: 'success',
          data: profile,
        });
      } catch (err: any) {
        const statusCode = err.statusCode || 500;
        const code = err.code || 'INTERNAL_ERROR';
        return reply.status(statusCode).send({
          status: 'error',
          error: {
            code,
            message: err.message || 'Failed to extract profile',
          },
        });
      }
    }
  );

  // POST /api/v1/profile
  fastify.post(
    '/profile',
    {
      schema: {
        description: 'Extract full profile information from a LinkedIn profile URL with optional session credentials',
        tags: ['Profile'],
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', description: 'LinkedIn profile URL (e.g. https://www.linkedin.com/in/satyanadella)' },
            liAtCookie: { type: 'string', description: 'Optional LinkedIn li_at session cookie' },
            jsessionId: { type: 'string', description: 'Optional LinkedIn JSESSIONID cookie' },
            enrichEmail: { type: 'boolean', default: true, description: 'Enable email discovery and pattern enrichment' },
            useSandboxFallback: { type: 'boolean', default: true, description: 'Allow sandbox demo fallback for unauthenticated requests' },
          },
        },
        response: {
          200: {
            description: 'Successfully extracted LinkedIn profile',
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              data: { type: 'object', additionalProperties: true },
            },
          },
          400: {
            description: 'Invalid input or URL format',
            type: 'object',
            properties: {
              status: { type: 'string', example: 'error' },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = ProfileBodySchema.safeParse(request.body);
        if (!parsed.success) {
          return reply.status(400).send({
            status: 'error',
            error: {
              code: 'INVALID_REQUEST_BODY',
              message: parsed.error.issues[0]?.message || 'Invalid request body',
            },
          });
        }

        const { url, liAtCookie, jsessionId, enrichEmail, useSandboxFallback } = parsed.data;
        const { canonicalUrl, slug } = canonicalizeLinkedInUrl(url);

        const client = new LinkedInVoyagerClient({
          liAtCookie,
          jsessionId,
        });

        const profile = await client.fetchProfile(canonicalUrl, slug, {
          enrichEmail,
          useSandboxFallback,
        });

        return reply.send({
          status: 'success',
          data: profile,
        });
      } catch (err: any) {
        const statusCode = err.statusCode || 500;
        const code = err.code || 'INTERNAL_ERROR';
        return reply.status(statusCode).send({
          status: 'error',
          error: {
            code,
            message: err.message || 'Failed to extract profile',
          },
        });
      }
    }
  );
};
