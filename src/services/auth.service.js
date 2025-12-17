import { User } from "../models";
import {
  generateAccessToken,
  generateDeviceId,
  generateRefreshToken,
  revokeToken,
  revokeUserTokens,
  saveRefreshToken,
  validateRefreshToken,
} from "./token.service";

class AuthService {
  async signup(userData, req) {
    const { email, phone, password } = userData;

    if (!email && !phone) {
      throw new Error("Either email or phone must be provided");
    }

    const whereCondition = {};
    if (email) whereCondition.email = email;
    if (phone) whereCondition.phone = phone;

    const existingUser = await User.findOne({
      where: whereCondition,
    });

    if (existingUser) {
      throw new Error("User with this email or phone already exists");
    }

    const user = await User.create({
      email: email || null,
      phone: phone || null,
      password,
    });

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      req
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async signin(credentials, req) {
    const { id, password } = credentials;

    const user = await User.findOne({
      where: {
        $or: [{ email: id }, { phone: id }],
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    await user.update({ lastLogin: new Date() });

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      req
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        lastLogin: user.lastLogin,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken, req) {
    const tokenRecord = await validateRefreshToken(refreshToken);
    await revokeToken(tokenRecord.jti);

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(tokenRecord.userId, req);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId, req) {
    const deviceId = generateDeviceId(req);
    await revokeUserTokens(userId, deviceId);
  }

  async getUserInfo(userId) {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "email",
        "phone",
        "createdAt",
        "lastLogin",
        "isActive",
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async userExists(email, phone) {
    const whereCondition = {};
    if (email) whereCondition.email = email;
    if (phone) whereCondition.phone = phone;

    const user = await User.findOne({
      where: whereCondition,
      attributes: ["id"],
    });

    return !!user;
  }

  async generateTokens(id, req) {
    const accessToken = generateAccessToken(id);
    const refreshToken = generateRefreshToken(id);

    await saveRefreshToken(id, refreshToken, req);

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
