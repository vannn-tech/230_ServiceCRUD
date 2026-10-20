export function parseId(value) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function validateBiodata(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Data harus berupa object" };
  }

  const limits = { nama: 100, nim: 20, kelas: 20 };
  const data = {};

  for (const [field, maxLength] of Object.entries(limits)) {
    const value = body[field];
    if (typeof value !== "string" || !value.trim()) {
      return { error: `${field} wajib diisi dengan teks` };
    }
    if (value.trim().length > maxLength) {
      return { error: `${field} maksimal ${maxLength} karakter` };
    }
    data[field] = value.trim();
  }

  return { data };
}
