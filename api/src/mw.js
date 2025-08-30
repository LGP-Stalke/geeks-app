import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "no_token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "unauthenticated" });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" });
  next();
};
