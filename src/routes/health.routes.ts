import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const startTime = Date.now();

  fastify.get(
    '/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              uptimeSeconds: { type: 'number' },
              timestamp: { type: 'string' },
              service: { type: 'string' },
              version: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.send({
        status: 'ok',
        uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
        service: 'linkedin-profile-api',
        version: '1.0.0',
      });
    }
  );

  fastify.get('/healthz', async (_request, reply) => {
    return reply.send({ status: 'ok' });
  });

  fastify.get('/readyz', async (_request, reply) => {
    return reply.send({ status: 'ready' });
  });
};
