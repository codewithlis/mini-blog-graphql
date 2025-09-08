const jwt = require("jsonwebtoken");
const { ForbiddenError } = require("./errors");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

function signToken(user) {
  // keep payload minimal
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function getTokenFromReq(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  return h.slice(7).trim();
}

// Guards to use inside resolvers
function requireAuth(ctx) {
  if (!ctx.user) throw new ForbiddenError("Authentication required");
  return ctx.user;
}

function requireRole(ctx, roles = []) {
  const user = requireAuth(ctx);
  if (roles.length && !roles.includes(user.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
  return user;
}

module.exports = {
  signToken,
  verifyToken,
  getTokenFromReq,
  requireAuth,
  requireRole,
};
