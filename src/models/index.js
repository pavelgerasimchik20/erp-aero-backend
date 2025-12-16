const sequelize = require("../config/sequelize");
const User = require("./User");
const Token = require("./Token");
const File = require("./File");

// Setup associations
User.hasMany(Token, { foreignKey: "userId", onDelete: "CASCADE" });
Token.belongsTo(User, { foreignKey: "userId" });

User.hasMany(File, { foreignKey: "userId", onDelete: "CASCADE" });
File.belongsTo(User, { foreignKey: "userId" });

const models = {
  sequelize,
  Sequelize: require("sequelize").Sequelize,
  User,
  Token,
  File,
};

// Export Sequelize operators
const { Op } = require("sequelize");
models.Op = Op;

module.exports = models;
