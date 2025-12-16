import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Token = sequelize.define(
  "Token",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    jti: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deviceId: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.TEXT,
    },
    ipAddress: {
      type: DataTypes.STRING(45), // IPv6 compatible
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "tokens",
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["jti"], unique: true },
      { fields: ["refresh_token"] },
      { fields: ["device_id"] },
      { fields: ["expires_at"] },
      { fields: ["is_revoked"] },
    ],
  }
);

export default Token;
