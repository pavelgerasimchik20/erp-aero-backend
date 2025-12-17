import { createHash, randomUUID } from "crypto";
import { sign, verify } from "jsonwebtoken";
import { refreshToken as _refreshToken, accessToken } from "../config/jwt";
import { Token, User } from "../models";

class TokenService {
  generateAccessToken(userId) {
    const payload = {
      userId,
      type: "access",
      jti: randomUUID(), // jwt id
    };

    return sign(payload, accessToken.secret, {
      expiresIn: accessToken.expiresIn,
    });
  }

  generateRefreshToken(userId) {
    const payload = {
      userId,
      type: "refresh",
      jti: randomUUID(),
    };

    return sign(payload, _refreshToken.secret, {
      expiresIn: _refreshToken.expiresIn,
    });
  }

  verifyAccessToken(token) {
    try {
      return verify(token, accessToken.secret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Access token expired");
      }
      throw new Error("Invalid access token");
    }
  }

  verifyRefreshToken(token) {
    try {
      return verify(token, _refreshToken.secret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Refresh token expired");
      }
      throw new Error("Invalid refresh token");
    }
  }

  // device id generating
  generateDeviceId(req) {
    const userAgent = req.headers["user-agent"] || "";
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const combined = `${userAgent}-${ip}`;

    return createHash("sha256").update(combined).digest("hex").substring(0, 32);
  }

  // save refresh token into db
  async saveRefreshToken(userId, refreshToken, req) {
    const decoded = this.verifyRefreshToken(refreshToken);

    const tokenData = {
      userId,
      jti: decoded.jti,
      refreshToken,
      deviceId: this.generateDeviceId(req),
      userAgent: req.headers["user-agent"] || "unknown",
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      expiresAt: new Date(decoded.exp * 1000),
    };

    return await Token.create(tokenData);
  }

  async validateRefreshToken(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);

    const token = await Token.findOne({
      where: {
        jti: decoded.jti,
        refreshToken: refreshToken,
        isRevoked: false,
        expiresAt: {
          $gt: new Date(), // expiresAt > now
        },
      },
      include: [
        {
          model: User,
          attributes: ["id", "email", "phone", "isActive"],
        },
      ],
    });

    if (!token) {
      throw new Error("Refresh token not found or revoked");
    }

    if (!token.User.isActive) {
      throw new Error("User account is deactivated");
    }

    return token;
  }

  async revokeUserTokens(userId, deviceId) {
    return await Token.update(
      { isRevoked: true },
      {
        where: {
          userId,
          deviceId,
          isRevoked: false,
        },
      }
    );
  }

  async revokeToken(jti) {
    return await Token.update({ isRevoked: true }, { where: { jti } });
  }

  async isAccessTokenValid(jti) {
    const token = await Token.findOne({
      where: {
        jti,
        isRevoked: false,
      },
    });
    return !!token;
  }

  async getTokenInfo(jti) {
    return await Token.findOne({
      where: { jti },
      include: [
        {
          model: User,
          attributes: ["id", "email", "phone"],
        },
      ],
    });
  }
}

export default new TokenService();
