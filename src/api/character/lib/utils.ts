// Beklenen ham query yapısı
interface RawCharacterQuery {
  name?: string;
  category?: string;
  limit?: string;
  offset?: string;
}

// Fonksiyonun döndüreceği temizlenmiş yapı
export interface ParsedCharacterQuery {
  filters: {
    name?: { $contains: string };
    category?: { name: { $eq: string } };
  };
  pagination: {
    limit?: number;
    start: number;
  };
}

export function parseCharacterQuery(query: unknown): ParsedCharacterQuery {
  if (!query || typeof query !== "object") {
    return { filters: {}, pagination: { start: 0 } };
  }
  const q = query as RawCharacterQuery;

  const filters: ParsedCharacterQuery["filters"] = {};

  if (typeof q.name === "string" && q.name.trim()) {
    filters.name = { $contains: q.name.trim() };
  }

  if (typeof q.category === "string" && q.category.trim()) {
    filters.category = { name: { $eq: q.category.trim() } };
  }

  const limit = q.limit ? parseInt(q.limit, 10) : NaN;
  const offset = q.offset ? parseInt(q.offset, 10) : NaN;

  return {
    filters,
    pagination: {
      limit: !isNaN(limit) ? limit : undefined,
      start: !isNaN(offset) ? offset : 0,
    },
  };
}

export function buildCharacterFilters(parsed: {
  name?: string;
  category?: string;
}) {
  return {
    ...(parsed.name && { name: { $contains: parsed.name } }),
    ...(parsed.category && {
      category: { name: { $eq: parsed.category } },
    }),
  };
}
