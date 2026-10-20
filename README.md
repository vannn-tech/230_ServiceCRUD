**SS HASIL POSTMAN**
**GET**
<img width="1919" height="1037" alt="image" src="https://github.com/user-attachments/assets/ae33c901-73aa-4273-88b7-e005f1f755ca" />
**POST**
<img width="1919" height="1033" alt="Screenshot 2026-10-20 103036" src="https://github.com/user-attachments/assets/82a7d631-2e09-4d2d-bf86-8ce848edf563" />
**PUT**
<img width="1919" height="1033" alt="Screenshot 2026-10-20 103959" src="https://github.com/user-attachments/assets/91717e62-8ff3-409c-ace1-e2727fed7ef3" />
**DELETE**
<img width="1919" height="1026" alt="Screenshot 2026-10-20 103311" src="https://github.com/user-attachments/assets/36455b01-a380-42d3-ba7d-bd7e97c9ffd8" />
**SS HASIL CHROME**
<img width="1919" height="990" alt="Screenshot 2026-10-20 094325" src="https://github.com/user-attachments/assets/8cb67788-f9a5-4cfc-928c-e647c22bbc89" />


# CRUD Biodata

API sederhana buat ngatur data biodata mahasiswa pakai Express dan PostgreSQL.

## Mulai jalanin

1. Install dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` jadi `.env`, lalu sesuaikan koneksi database.
3. Buat database PostgreSQL, lalu jalankan schema:

   ```bash
   psql -U postgres -d 230_crud -f schema.sql
   ```

4. Jalankan API:

   ```bash
   npm start
   ```

Default-nya jalan di `http://localhost:3000`.

## Endpoint

| Method | URL | Keterangan |
| --- | --- | --- |
| `GET` | `/biodata` | Lihat semua data |
| `GET` | `/biodata?page=2&limit=10` | Lihat data per halaman |
| `GET` | `/biodata/:id` | Lihat data berdasarkan ID |
| `GET` | `/biodata/nim/:nim` | Cari data berdasarkan NIM |
| `POST` | `/biodata` | Tambah data |
| `PUT` | `/biodata/:id` | Ganti semua field |
| `PATCH` | `/biodata/:id` | Ganti field tertentu |
| `DELETE` | `/biodata/:id` | Hapus data |
| `GET` | `/health` | Cek koneksi database |

Data tambah dan update pakai JSON dengan field `nama`, `nim`, dan `kelas`.
Limit paginasi maksimal 100 data. Kalau parameter halaman tidak dipakai,
`GET /biodata` tetap mengembalikan daftar biasa.

## Test

```bash
npm test
```
