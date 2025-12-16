import sequelize from "../config/sequelize.js";
import User from "./User.js";
import Token from "./Token.js";
import File from "./File.js";
import { Sequelize, Op } from "sequelize";

// Setup associations
User.hasMany(Token, { foreignKey: "userId", onDelete: "CASCADE" });
Token.belongsTo(User, { foreignKey: "userId" });

User.hasMany(File, { foreignKey: "userId", onDelete: "CASCADE" });
File.belongsTo(User, { foreignKey: "userId" });

const models = {
  sequelize,
  Sequelize,
  User,
  Token,
  File,
  Op,
};

export default models;
export { sequelize, Sequelize, User, Token, File, Op };
