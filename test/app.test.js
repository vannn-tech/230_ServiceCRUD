import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createApp } from "../app.js";

async function requestApi(query, path, options) {
  const server = createApp({ query }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  try {
    return await fetch(`http://127.0.0.1:${address.port}${path}`, options);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("GET /biodata mengembalikan daftar data", async () => {
  const rows = [{ id: 1, nama: "Ayu", nim: "123", kelas: "TI-5A" }];
  const response = await requestApi(
    async () => ({ rows }),
    "/biodata"
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), rows);
});

test("GET /biodata bisa pakai paginasi", async () => {
  const rows = [{ id: 3, nama: "Cici", nim: "789", kelas: "TI-5C" }];
  const response = await requestApi(
    async (sql, values) => {
      if (sql.includes("COUNT(*)")) {
        return { rows: [{ total: "5" }] };
      }
      assert.deepEqual(values, [2, 2]);
      return { rows };
    },
    "/biodata?page=2&limit=2"
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    data: rows,
    pagination: { page: 2, limit: 2, total: 5, totalPages: 3 },
  });
});

test("GET /biodata menolak limit di atas batas", async () => {
  const response = await requestApi(
    () => assert.fail("Query tidak seharusnya dipanggil"),
    "/biodata?limit=101"
  );

  assert.equal(response.status, 400);
});

test("GET /biodata/:id mengembalikan data yang cocok", async () => {
  const row = { id: 2, nama: "Budi", nim: "456", kelas: "TI-5B" };
  const response = await requestApi(
    async (sql, values) => {
      assert.match(sql, /WHERE id = \$1/);
      assert.deepEqual(values, [2]);
      return { rows: [row], rowCount: 1 };
    },
    "/biodata/2"
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), row);
});

test("GET /biodata/nim/:nim mencari data lewat NIM", async () => {
  const row = { id: 2, nama: "Budi", nim: "456", kelas: "TI-5B" };
  const response = await requestApi(
    async (sql, values) => {
      assert.match(sql, /WHERE nim = \$1/);
      assert.deepEqual(values, ["456"]);
      return { rows: [row], rowCount: 1 };
    },
    "/biodata/nim/456"
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), row);
});

test("POST /biodata menambahkan data", async () => {
  const row = { id: 3, nama: "Cici", nim: "789", kelas: "TI-5C" };
  const response = await requestApi(
    async (_sql, values) => {
      assert.deepEqual(values, ["Cici", "789", "TI-5C"]);
      return { rows: [row] };
    },
    "/biodata",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nama: "Cici", nim: "789", kelas: "TI-5C" }),
    }
  );

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    message: "Data berhasil ditambahkan",
    data: row,
  });
});

test("POST /biodata merapikan spasi sebelum disimpan", async () => {
  const response = await requestApi(
    async (_sql, values) => {
      assert.deepEqual(values, ["Ayu", "123", "TI-5A"]);
      return { rows: [{ id: 4, nama: "Ayu", nim: "123", kelas: "TI-5A" }] };
    },
    "/biodata",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nama: " Ayu ", nim: " 123 ", kelas: " TI-5A " }),
    }
  );

  assert.equal(response.status, 201);
});

test("POST /biodata menolak data kosong atau format yang salah", async () => {
  for (const body of [[], { nama: "   ", nim: "123", kelas: "TI-5A" }]) {
    const response = await requestApi(
      () => assert.fail("Query tidak seharusnya dipanggil"),
      "/biodata",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    assert.equal(response.status, 400);
  }
});

test("GET /biodata/:id menolak id yang bukan angka", async () => {
  const response = await requestApi(
    () => assert.fail("Query tidak seharusnya dipanggil"),
    "/biodata/abc"
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: "id harus berupa angka" });
});

test("GET /biodata/:id menolak angka yang bukan id positif", async () => {
  const response = await requestApi(
    () => assert.fail("Query tidak seharusnya dipanggil"),
    "/biodata/0"
  );

  assert.equal(response.status, 400);
});
