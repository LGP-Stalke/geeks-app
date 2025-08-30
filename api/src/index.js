import "dotenv/config";
import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { auth, requireRole } from "./mw.js";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, application_name: "geeks-api" });

// force le search_path
pool.on("connect", client => client.query("SET search_path TO geeks, public"));

const app = express();
app.use(cors());
app.use(express.json());

// ---- Auth (vérif du mot de passe dans Postgres)
app.post("/auth/login", async (req, res) => {
  const { ident, password } = req.body || {};
  if (!ident || !password) return res.status(400).json({ error: "missing_credentials" });

  // Sélecteur email OU username + user actif + vérif bcrypt dans SQL
  const q = `
    SELECT u.id, u.username, u.email, u.is_active,
           (SELECT name FROM geeks.roles WHERE id = u.role_id) AS role
    FROM geeks.users u
    WHERE (lower(u.username) = lower($1) OR lower(u.email) = lower($1))
      AND u.is_active = TRUE
      AND crypt($2, u.password_hash) = u.password_hash
    LIMIT 1
  `;
  try {
    const { rows } = await pool.query(q, [ident, password]);
    const u = rows[0];
    if (!u) return res.status(401).json({ error: "bad_credentials" });

    const access = jwt.sign(
      { id: u.id, role: u.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "3600s" }
    );
    return res.json({ access, user: { id: u.id, role: u.role, username: u.username, email: u.email } });
  } catch (e) {
    console.error("login error:", e);
    return res.status(500).json({ error: "server_error" });
  }
});

// ---- Planning
app.get("/planning/me", auth, async (req, res) => {
  const { from, to } = req.query;
  const { rows } = await pool.query(
    `SELECT a.*, u.full_name AS tech_name
       FROM geeks.appointments a
       LEFT JOIN geeks.users u ON u.id=a.assigned_to
      WHERE a.assigned_to=$1
        AND ($2::timestamptz IS NULL OR a.start_at >= $2::timestamptz)
        AND ($3::timestamptz IS NULL OR a.start_at <  $3::timestamptz)
      ORDER BY a.start_at`, [req.user.id, from || null, to || null]
  );
  res.json(rows);
});

app.get("/planning/team", auth, requireRole("admin","manager"), async (req,res) => {
  const { user_id, from, to } = req.query;
  const { rows } = await pool.query(
    `SELECT a.*, u.full_name AS tech_name
       FROM geeks.appointments a
       LEFT JOIN geeks.users u ON u.id=a.assigned_to
      WHERE ($1::bigint IS NULL OR a.assigned_to=$1::bigint)
        AND ($2::timestamptz IS NULL OR a.start_at >= $2::timestamptz)
        AND ($3::timestamptz IS NULL OR a.start_at <  $3::timestamptz)
      ORDER BY a.start_at`, [user_id || null, from || null, to || null]
  );
  res.json(rows);
});

// (exemple) interventions liste
app.get("/interventions", auth, async (req,res) => {
  const scope = req.query.scope || "me";
  const params = [];
  let where = "1=1";
  if (req.user.role === "technician" || scope === "me") { where += " AND i.assigned_to = $1"; params.push(req.user.id); }
  const { rows } = await pool.query(
    `SELECT i.*, c.company_name, c.first_name, c.last_name
       FROM geeks.interventions i
       JOIN geeks.clients c ON c.id=i.client_id
      WHERE ${where}
      ORDER BY i.created_at DESC
      LIMIT 100`, params);
  res.json(rows);
});

app.get("/me", auth, (req,res) => res.json({ id: req.user.id, role: req.user.role }));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log("API listening on", port));
