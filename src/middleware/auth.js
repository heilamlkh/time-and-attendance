const jwt = require("jsonwebtoken");

function getAccessSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be configured");
  }
  return secret;
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET must be configured");
  }
  return secret;
}

function createToken(username, type = "access") {
  const secret = type === "refresh" ? getRefreshSecret() : getAccessSecret();

  return jwt.sign(
    {
      username:
        typeof username === "string" ? username.trim().toLowerCase() : username,
      type,
    },
    secret,
    {
      expiresIn:
        type === "refresh"
          ? process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d"
          : process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m",
    },
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, getAccessSecret());

    if (
      !payload ||
      typeof payload.username !== "string" ||
      !payload.username.trim()
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = {
      username: payload.username.trim().toLowerCase(),
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = {
  getAccessSecret,
  getRefreshSecret,
  authenticateToken,
  createToken,
};
