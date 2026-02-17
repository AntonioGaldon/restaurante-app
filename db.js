const { Pool } = require("pg");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || "antoniogaldoncarrion",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "restaurante",
      }
);

module.exports = pool;
