CREATE TABLE IF NOT EXISTS biodata (
  id    SERIAL PRIMARY KEY,
  nama  VARCHAR(100) NOT NULL,
  nim   VARCHAR(20)  NOT NULL UNIQUE,
  kelas VARCHAR(20)  NOT NULL
);

-- Data awal (ganti dengan datamu sendiri)
INSERT INTO biodata (nama, nim, kelas) VALUES
  ('Nama Kamu', '230', 'TI-5A')
ON CONFLICT (nim) DO NOTHING;
