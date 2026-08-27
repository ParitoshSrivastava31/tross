import { buildServer } from './server.js';
import { env } from './config/env.js';

async function main() {
  try {
    const server = await buildServer();

    await server.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`\n🚀 LinkedIn Profile API running at http://${env.HOST}:${env.PORT}`);
    console.log(`📚 Interactive Swagger API Docs at http://${env.HOST}:${env.PORT}/docs`);
    console.log(`🌐 Web Playground UI at http://${env.HOST}:${env.PORT}/\n`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main();
