import express from "express";
import { parseId, parsePositiveInteger, validateBiodata } from "./validation.js";

export function createApp(pool) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const serverError = (res, err) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", detail: err.message });
  };

  const getAll = (req, res) => {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    if (hasPagination) {
      const page = parsePositiveInteger(req.query.page, 1);
      const limit = parsePositiveInteger(req.query.limit, 20);
      if (page === null || limit === null || limit > 100) {
        return res.status(400).json({ message: "page dan limit harus angka positif, limit maksimal 100" });
      }
      const offset = (page - 1) * limit;
      if (!Number.isSafeInteger(offset)) {
        return res.status(400).json({ message: "page terlalu besar" });
      }
      return Promise.all([
        pool.query("SELECT * FROM biodata ORDER BY id LIMIT $1 OFFSET $2", [limit, offset]),
        pool.query("SELECT COUNT(*) AS total FROM biodata"),
      ])
        .then(([result, count]) => {
          const total = Number(count.rows[0].total);
          res.json({
            data: result.rows,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
          });
        })
        .catch((err) => serverError(res, err));
    }

    pool
      .query("SELECT * FROM biodata ORDER BY id")
      .then((result) => res.json(result.rows))
      .catch((err) => serverError(res, err));
  };
  app.get("/", getAll);
  app.get("/biodata", getAll);

  app.get("/biodata/nim/:nim", (req, res) => {
    const nim = req.params.nim.trim();
    if (!nim || nim.length > 20) {
      return res.status(400).json({ message: "nim harus diisi maksimal 20 karakter" });
    }
    pool
      .query("SELECT * FROM biodata WHERE nim = $1", [nim])
      .then((result) => {
        if (result.rowCount === 0) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
        }
        res.json(result.rows[0]);
      })
      .catch((err) => serverError(res, err));
  });

  app.get("/biodata/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
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

  app.post("/biodata", (req, res) => {
    const validation = validateBiodata(req.body);
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }
    const { nama, nim, kelas } = validation.data;
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

  app.put("/biodata/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "id harus berupa angka" });
    }
    const validation = validateBiodata(req.body);
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }
    const { nama, nim, kelas } = validation.data;
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

  app.delete("/biodata/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
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

  return app;
}
