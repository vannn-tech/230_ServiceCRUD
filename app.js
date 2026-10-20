import express from "express";

export function createApp(pool) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const serverError = (res, err) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", detail: err.message });
  };

  const getAll = (req, res) => {
    pool
      .query("SELECT * FROM biodata ORDER BY id")
      .then((result) => res.json(result.rows))
      .catch((err) => serverError(res, err));
  };
  app.get("/", getAll);
  app.get("/biodata", getAll);

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

  return app;
}
