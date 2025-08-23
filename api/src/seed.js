import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  await pool.query(`SELECT 1`);
  console.log('Seed OK (nothing to do).');
  process.exit(0);
})();
