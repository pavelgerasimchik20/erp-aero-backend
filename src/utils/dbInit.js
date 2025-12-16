import { sequelize } from '../models/index.js';

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized.');

    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return null;
  }
}

async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    return false;
  }
}

export default { initializeDatabase, checkDatabaseConnection };