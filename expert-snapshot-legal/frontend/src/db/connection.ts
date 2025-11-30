// src/db/connection.ts

import sql from "mssql";

const config = {
  server: process.env.AZURE_SQL_SERVER!,
  database: process.env.AZURE_SQL_DATABASE!,
  user: process.env.AZURE_SQL_USER!,
  password: process.env.AZURE_SQL_PASSWORD!,
  options: { encrypt: true }
};

const requiredKeys = ["AZURE_SQL_SERVER", "AZURE_SQL_DATABASE", "AZURE_SQL_USER"];
requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing or empty env var: ${key}`);
  }
});

export const poolPromise = sql.connect(config);
