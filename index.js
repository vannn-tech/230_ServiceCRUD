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

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
  pool
    .query("SELECT NOW()")
    .then(() => console.log(`Terhubung ke PostgreSQL, database: ${process.env.DB_NAME}`))
    .catch((err) => console.error("Gagal terhubung ke PostgreSQL:", err.message));
});
