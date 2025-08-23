import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth } from './mw.js';

const { Pool } = pkg;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(cors());
app.use(express.json());

// ---- Health
app.get('/health', async (_req, res) => {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ status: 'error', error: String(e) });
  }
});

// ---- Auth
app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({error:'missing'});
  try {
    const { rows } = await pool.query('SELECT id,email,role,pass_hash FROM users WHERE email=$1 LIMIT 1',[email]);
    if (!rows.length) return res.status(401).json({error:'bad_credentials'});
    const u = rows[0];
    const ok = await bcrypt.compare(password, u.pass_hash || '');
    if (!ok) return res.status(401).json({error:'bad_credentials'});
    const token = jwt.sign({ id: u.id, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: '10h' });
    res.json({ token, user: {id:u.id,email:u.email,role:u.role} });
  } catch(e) {
    res.status(500).json({error:String(e)});
  }
});

// ---- Me
app.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,name,email,role,is_tech FROM users WHERE id=$1',[req.user.id]);
    res.json(rows[0] || null);
  } catch(e) {
    res.status(500).json({error:String(e)});
  }
});

// ---- Clients (liste + création)
app.get('/clients', auth, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,name,email,phone,address,city,zip,created_at FROM clients ORDER BY created_at DESC LIMIT 200');
    res.json(rows);
  } catch(e) {
    res.status(500).json({error:String(e)});
  }
});

app.post('/clients', auth, async (req, res) => {
  const { name, email, phone, address, city, zip } = req.body || {};
  if (!name) return res.status(400).json({error:'name_required'});
  try {
    const { rows } = await pool.query(
      `INSERT INTO clients (name,email,phone,address,city,zip)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
       [name,email||null,phone||null,address||null,city||null,zip||null]
    );
    res.status(201).json(rows[0]);
  } catch(e) {
    res.status(500).json({error:String(e)});
  }
});

// ---- Interventions (liste + création basique)
app.get('/interventions', auth, async (req,res) => {
  const status = req.query.status;
  let sql = 'SELECT id,client_id,tech_id,category,status,planned_at,estimated_minutes FROM interventions';
  const params = [];
  if (status) { sql += ' WHERE status=$1'; params.push(status); }
  sql += ' ORDER BY planned_at DESC NULLS LAST, id DESC LIMIT 200';
  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch(e) {
    res.status(500).json({error:String(e)});
  }
});

app.post('/interventions', auth, async (req,res) => {
  const { client_id, tech_id, category, planned_at, estimated_minutes } = req.body || {};
  if (!client_id || !category) return res.status(400).json({error:'missing_fields'});
  try {
    const { rows } = await pool.query(
      `INSERT INTO interventions (client_id, tech_id, category, status, planned_at, estimated_minutes)
       VALUES ($1,$2,$3,'planned',$4,$5) RETURNING *`,
       [client_id, tech_id||null, category, planned_at||null, estimated_minutes||60]
    );
    res.status(201).json(rows[0]);
  } catch(e) {
    res.status(500).json({error:String(e)});
  }
});

// ---- Statistiques existantes
app.get('/stats/tech/daily', auth, async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM v_stats_tech_daily ORDER BY jour DESC LIMIT 30`);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});
app.get('/stock', auth, async (_req, res) => {
  try { const r = await pool.query(`SELECT * FROM v_stock_level ORDER BY sku`); res.json(r.rows); }
  catch(e){ res.status(500).json({error:String(e)}); }
});
app.get('/backlog', auth, async (_req, res) => {
  try { const r = await pool.query(`SELECT * FROM v_backlog ORDER BY status`); res.json(r.rows); }
  catch(e){ res.status(500).json({error:String(e)}); }
});

app.listen(PORT, () => console.log(`API running on :${PORT}`));
