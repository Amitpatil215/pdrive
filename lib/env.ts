function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing env var ${name}`);
  }
  return value;
}

export function d1Config() {
  return {
    accountId: required("CLOUDFLARE_ACCOUNT_ID"),
    apiToken: required("CLOUDFLARE_API_TOKEN"),
    databaseId: required("CLOUDFLARE_D1_DATABASE_ID"),
  };
}

export function r2Config() {
  return {
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    bucket: required("R2_BUCKET_NAME"),
    endpoint: required("R2_ENDPOINT"),
  };
}

export function sessionSecret(): string {
  return required("SESSION_SECRET");
}
