import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;
const PORT = process.env.PORT || 3000;

// DATABASE_URL format: postgres://app:change_me@postgres:5432/geeks_app
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(cors());
app.use(express.json());

// healthcheck
app.get('/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ status: 'error', error: String(e) });
  }
});

// exemple: stats journalières par tech
app.get('/stats/tech/daily', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM v_stats_tech_daily ORDER BY jour DESC LIMIT 30`);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// exemple: stock
app.get('/stock', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM v_stock_level ORDER BY sku`);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// exemple: backlog interventions par statut
app.get('/backlog', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM v_backlog ORDER BY status`);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log(`API running on :${PORT}`));
