import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { canonicalizeLinkedInUrl } from '../core/canonicalizer.js';
import { LinkedInVoyagerClient } from '../engine/linkedin-client.js';
import { convertProfilesToPhantomBusterCsv } from '../engine/csv-exporter.js';
import { LinkedInProfile } from '../core/types.js';

const BatchBodySchema = z.object({
  urls: z.array(z.string()).min(1, 'At least one LinkedIn URL is required').max(50, 'Maximum 50 URLs per batch request'),
  liAtCookie: z.string().optional(),
  jsessionId: z.string().optional(),
  enrichEmail: z.boolean().optional().default(true),
  useSandboxFallback: z.boolean().optional().default(true),
});

export const batchRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /api/v1/batch
  fastify.post(
    '/batch',
    {
      schema: {
        description: 'Extract multiple LinkedIn profiles in a single batch request',
        tags: ['Batch Scraper'],
        body: {
          type: 'object',
          required: ['urls'],
          properties: {
            urls: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of LinkedIn profile URLs to extract',
              examples: [['https://www.linkedin.com/in/satyanadella', 'https://www.linkedin.com/in/williamhgates']],
            },
            liAtCookie: { type: 'string', description: 'Optional LinkedIn session cookie' },
            enrichEmail: { type: 'boolean', default: true, description: 'Enable email enrichment' },
            useSandboxFallback: { type: 'boolean', default: true, description: 'Allow sandbox demo fallback' },
          },
        },
        response: {
          200: {
            description: 'Batch scraping results',
            type: 'object',
            properties: {
              status: { type: 'string' },
              total: { type: 'number' },
              successful: { type: 'number' },
              failed: { type: 'number' },
              processingTimeMs: { type: 'number' },
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    success: { type: 'boolean' },
                    data: { type: 'object', additionalProperties: true },
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid batch input payload',
            type: 'object',
            properties: {
              status: { type: 'string' },
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
        const parsed = BatchBodySchema.safeParse(request.body);
        if (!parsed.success) {
          return reply.status(400).send({
            status: 'error',
            error: {
              code: 'INVALID_REQUEST_BODY',
              message: parsed.error.issues[0]?.message || 'Invalid batch payload',
            },
          });
        }

        const { urls, liAtCookie, jsessionId, enrichEmail, useSandboxFallback } = parsed.data;
        const startTime = Date.now();

        const client = new LinkedInVoyagerClient({ liAtCookie, jsessionId });

        const results = await Promise.all(
          urls.map(async (rawUrl) => {
            try {
              const { canonicalUrl, slug } = canonicalizeLinkedInUrl(rawUrl);
              const profile = await client.fetchProfile(canonicalUrl, slug, {
                enrichEmail,
                useSandboxFallback,
              });
              return {
                url: canonicalUrl,
                success: true,
                data: profile,
              };
            } catch (err) {
              return {
                url: rawUrl,
                success: false,
                error: (err as Error).message,
              };
            }
          })
        );

        const successful = results.filter((r) => r.success).length;
        const failed = results.length - successful;

        return reply.send({
          status: failed === 0 ? 'success' : successful > 0 ? 'partial' : 'error',
          total: urls.length,
          successful,
          failed,
          processingTimeMs: Date.now() - startTime,
          results,
        });
      } catch (err: any) {
        return reply.status(err.statusCode || 500).send({
          status: 'error',
          error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'Batch extraction failed',
          },
        });
      }
    }
  );

  // POST /api/v1/batch/export-csv
  fastify.post(
    '/batch/export-csv',
    {
      schema: {
        description: 'Extract multiple LinkedIn profiles and download a PhantomBuster-compatible CSV export',
        tags: ['Batch Scraper'],
        body: {
          type: 'object',
          required: ['urls'],
          properties: {
            urls: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of LinkedIn profile URLs to extract and export as CSV',
            },
            liAtCookie: { type: 'string' },
            enrichEmail: { type: 'boolean', default: true },
            useSandboxFallback: { type: 'boolean', default: true },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = BatchBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          status: 'error',
          message: parsed.error.issues[0]?.message || 'Invalid batch payload',
        });
      }

      const { urls, liAtCookie, jsessionId, enrichEmail, useSandboxFallback } = parsed.data;
      const client = new LinkedInVoyagerClient({ liAtCookie, jsessionId });

      const profiles: LinkedInProfile[] = [];
      for (const rawUrl of urls) {
        try {
          const { canonicalUrl, slug } = canonicalizeLinkedInUrl(rawUrl);
          const profile = await client.fetchProfile(canonicalUrl, slug, {
            enrichEmail,
            useSandboxFallback,
          });
          if (profile) profiles.push(profile);
        } catch {
          // skip failed entries in CSV export or add minimal row
        }
      }

      const csvContent = convertProfilesToPhantomBusterCsv(profiles);

      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="linkedin-profiles-export-${Date.now()}.csv"`);
      return reply.send(csvContent);
    }
  );
};
