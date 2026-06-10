const { getAuth } = require("@clerk/express");

function requireAuth(req, res, next) {
  // Clerk inspects incoming request
  const clerkAuth = getAuth(req);

  if (!clerkAuth.isAuthenticated) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  next();
}

function requireAdmin(req, res, next) {
  const clerkAuth = getAuth(req);

  if (!clerkAuth.isAuthenticated) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  const role = clerkAuth.sessionClaims?.metadata?.role;

  if (role !== "admin" && role !== "mainadmin") {
    return res.status(403).json({
      error: "Admin access required",
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
