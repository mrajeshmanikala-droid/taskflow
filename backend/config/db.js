const { Sequelize } = require('sequelize');const path = require('path');require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  });
  console.log('📂 Database Config: PostgreSQL (Production)');
} else {
  const dbPath = path.join(__dirname, '../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
  console.log('📂 Database Config: SQLite (Development)');
}

const connectDB = async () => {  try {    await sequelize.authenticate();    console.log('✅ Database Connected...');    await sequelize.sync();    console.log('✅ Models Synchronized.');  } catch (err) {    console.error('❌ Database Connection Error!');    console.error(err.message);  }};module.exports = { sequelize, connectDB };