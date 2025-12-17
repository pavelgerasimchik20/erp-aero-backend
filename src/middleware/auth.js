import {
    isAccessTokenValid,
    verifyAccessToken,
} from "../services/token.service.js";

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyAccessToken(token);

      const isTokenValid = await isAccessTokenValid(decoded.jti);
      if (!isTokenValid) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Token has been revoked",
        });
      }

      req.userId = decoded.userId;
      req.tokenJti = decoded.jti;

      next();
    } catch (error) {
      if (error.message === "Access token expired") {
        return res.status(401).json({
          error: "Token Expired",
          message: "Access token has expired. Please refresh your token.",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }
  } catch (error) {
    next(error);
  }
}

export { authenticate };
export default authenticate;
