import "dotenv/config";
import express from "express";
import pg from "pg";

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

const serverError = (res, err) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error", detail: err.message });
};

// ===== GET ALL =====
const getAll = (req, res) => {
  pool
    .query("SELECT * FROM biodata ORDER BY id")
    .then((result) => res.json(result.rows))
    .catch((err) => serverError(res, err));
};
app.get("/", getAll);
app.get("/biodata", getAll);

// ===== GET BY ID =====
app.get("/biodata/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "id harus berupa angka" });
  }
  pool
    .query("SELECT * FROM biodata WHERE id = $1", [id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.json(result.rows[0]);
    })
    .catch((err) => serverError(res, err));
});

// ===== POST (Tambah Data) =====
app.post("/biodata", (req, res) => {
  const { nama, nim, kelas } = req.body;
  if (!nama || !nim || !kelas) {
    return res.status(400).json({ message: "nama, nim, dan kelas wajib diisi" });
  }
  pool
    .query(
      "INSERT INTO biodata (nama, nim, kelas) VALUES ($1, $2, $3) RETURNING *",
      [nama, nim, kelas]
    )
    .then((result) =>
      res.status(201).json({ message: "Data berhasil ditambahkan", data: result.rows[0] })
    )
    .catch((err) => {
      if (err.code === "23505") {
        return res.status(409).json({ message: "NIM sudah terdaftar" });
      }
      serverError(res, err);
    });
});

// ===== PUT (Update Data) =====
app.put("/biodata/:id", (req, res) => {
  const id = Number(req.params.id);
  const { nama, nim, kelas } = req.body;
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "id harus berupa angka" });
  }
  if (!nama || !nim || !kelas) {
    return res.status(400).json({ message: "nama, nim, dan kelas wajib diisi" });
  }
  pool
    .query(
      "UPDATE biodata SET nama=$1, nim=$2, kelas=$3 WHERE id=$4 RETURNING *",
      [nama, nim, kelas, id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.json({ message: "Data berhasil diupdate", data: result.rows[0] });
    })
    .catch((err) => {
      if (err.code === "23505") {
        return res.status(409).json({ message: "NIM sudah terdaftar" });
      }
      serverError(res, err);
    });
});

// ===== DELETE (Hapus Data) =====
app.delete("/biodata/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "id harus berupa angka" });
  }
  pool
    .query("DELETE FROM biodata WHERE id = $1 RETURNING *", [id])
    .then((result) => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.json({ message: "Data berhasil dihapus", data: result.rows[0] });
    })
    .catch((err) => serverError(res, err));
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
  pool
    .query("SELECT NOW()")
    .then(() => console.log(`Terhubung ke PostgreSQL, database: ${process.env.DB_NAME}`))
    .catch((err) => console.error("Gagal terhubung ke PostgreSQL:", err.message));
});
