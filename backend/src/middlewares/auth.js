import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export function requireAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  const parts = header.split(" ");
  const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
  if (!token) return res.status(401).json({ message: "No autorizado" });
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}