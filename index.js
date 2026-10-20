import "dotenv/config";
import pg from "pg";
import { createApp } from "./app.js";

const { Pool } = pg;
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

const app = createApp(pool);
const server = app.listen(port, () => {
  console.log(`App running on port ${port}.`);
  pool
    .query("SELECT NOW()")
    .then(() => console.log(`Terhubung ke PostgreSQL, database: ${process.env.DB_NAME}`))
    .catch((err) => console.error("Gagal terhubung ke PostgreSQL:", err.message));
});

let isShuttingDown = false;
const shutdown = () => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log("Menutup server...");
  server.close((serverError) => {
    if (serverError) {
      console.error("Gagal menutup server:", serverError.message);
      process.exitCode = 1;
    }
    pool
      .end()
      .then(() => console.log("Koneksi database ditutup."))
      .catch((err) => {
        console.error("Gagal menutup koneksi database:", err.message);
        process.exitCode = 1;
      });
  });
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
