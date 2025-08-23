FROM node:20-alpine
WORKDIR /app
RUN npm init -y && npm install pg ioredis
COPY <<'JS' /app/worker.js
import { Pool } from 'pg';
import Redis from 'ioredis';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);

async function loop(){
  try {
    await db.query('SELECT 1');
    await redis.ping();
    console.log(new Date().toISOString(), 'worker-ok');
  } catch(e) {
    console.error('worker-error', e?.message || e);
  }
  setTimeout(loop, 15000);
}
loop();
JS
ENV NODE_ENV=production
CMD ["node","/app/worker.js"]
