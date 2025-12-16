import { Sequelize } from "sequelize";
import * as config from "./database.js";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelizeConfig = {
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: true,
    underscored: true,
  },
};

// SQLite doesn't support timezone setting
if (dbConfig.dialect !== 'sqlite') {
  sequelizeConfig.timezone = "+03:00";
}

const sequelize = new Sequelize(sequelizeConfig);

export { sequelize };
export default sequelize;
