import dotenv from 'dotenv';
dotenv.config();

export const development = {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: console.log,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    }
};
export const test = {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
};
export const production = {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};