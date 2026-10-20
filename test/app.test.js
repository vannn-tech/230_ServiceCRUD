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

test("GET /biodata/:id menolak id yang bukan angka", async () => {
  const response = await requestApi(
    () => assert.fail("Query tidak seharusnya dipanggil"),
    "/biodata/abc"
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: "id harus berupa angka" });
});
