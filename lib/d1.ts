import { d1Config } from "@/lib/env";

type D1Error = { message: string };

type D1QueryResponse<T> = {
  success: boolean;
  errors?: D1Error[];
  result?: Array<{ results: T[]; success: boolean }>;
};

// Runs a parameterized SQL statement against Cloudflare D1 over HTTP.
export async function d1Query<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { accountId, apiToken, databaseId } = d1Config();
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });

  const data = (await res.json()) as D1QueryResponse<T>;
  if (!res.ok || !data.success) {
    const message = data.errors?.[0]?.message ?? "D1 query failed";
    throw new Error(message);
  }

  return data.result?.[0]?.results ?? [];
}

export async function d1First<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await d1Query<T>(sql, params);
  return rows[0] ?? null;
}
