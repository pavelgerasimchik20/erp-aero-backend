import { createHash, randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { Token, User } from "../models/index.js";
import dotenv from "dotenv";
dotenv.config();

const jwtConfig = {
  accessSecret: process.env.JWT_SECRET || 'jwt_secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '10m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};


class TokenService {
  generateAccessToken(userId, jti) {
    const payload = {
      userId,
      type: "access",
      jti: jti || randomUUID(), // jwt id
    };

    return jwt.sign(payload, jwtConfig.accessSecret, {
      expiresIn: jwtConfig.accessExpiresIn,
    });
  }

  generateRefreshToken(userId, jti) {
    const payload = {
      userId,
      type: "refresh",
      jti: jti || randomUUID(),
    };

    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, jwtConfig.accessSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Access token expired");
      }
      throw new Error("Invalid access token");
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret);
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
          [Op.gt]: new Date(), // expiresAt > now
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

const tokenService = new TokenService();

export const generateAccessToken = tokenService.generateAccessToken.bind(
  tokenService,
);
export const generateRefreshToken = tokenService.generateRefreshToken.bind(
  tokenService,
);
export const verifyAccessToken = tokenService.verifyAccessToken.bind(
  tokenService,
);
export const verifyRefreshToken = tokenService.verifyRefreshToken.bind(
  tokenService,
);
export const generateDeviceId = tokenService.generateDeviceId.bind(
  tokenService,
);
export const saveRefreshToken = tokenService.saveRefreshToken.bind(
  tokenService,
);
export const validateRefreshToken = tokenService.validateRefreshToken.bind(
  tokenService,
);
export const revokeUserTokens = tokenService.revokeUserTokens.bind(
  tokenService,
);
export const revokeToken = tokenService.revokeToken.bind(tokenService);
export const isAccessTokenValid = tokenService.isAccessTokenValid.bind(
  tokenService,
);
export const getTokenInfo = tokenService.getTokenInfo.bind(tokenService);

export default tokenService;
