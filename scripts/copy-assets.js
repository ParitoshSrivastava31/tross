import fs from 'fs';
import path from 'path';

const srcPublic = path.resolve('src/public');
const distPublic = path.resolve('dist/public');

if (fs.existsSync(srcPublic)) {
  fs.mkdirSync(distPublic, { recursive: true });
  fs.cpSync(srcPublic, distPublic, { recursive: true });
  console.log('✅ Copied static assets from src/public to dist/public');
}
