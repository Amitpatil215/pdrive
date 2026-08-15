# Drive

Personal image and video library. Next.js on Vercel, files in Cloudflare R2, metadata and users in Cloudflare D1.

Login uses a **plain** password stored in D1 plus today's date in IST:

`basePassword + DDMMYYYY`

Example: stored password `amit67` on 15 Aug 2026 → type `amit6715082026`. There is no signup screen.

## 1. Create Cloudflare resources

1. Create an **R2** bucket named `drive-media` (or any name you put in `R2_BUCKET_NAME`).
2. Create an **R2 API token** with Object Read & Write. Use the access key, secret, and account ID in `.env.local`.
3. Set bucket CORS so the browser can upload and play files. From this repo:

```bash
npx wrangler r2 bucket cors set drive-media --file cors.json
```

Or paste the same rules in the R2 bucket **Settings → CORS**. After you deploy, you can replace `"origins": ["*"]` with `http://localhost:3000` and your Vercel URL.

4. Create a **D1** database (for example `drive-db`). Copy the database ID.
5. Create a Cloudflare API token with **D1 edit** permission.
6. Run the schema in the D1 SQL editor (or `wrangler d1 execute drive-db --remote --file=./migrations/0001_init.sql`).

## 2. Add a user

```sql
INSERT INTO users (id, email, password)
VALUES (lower(hex(randomblob(16))), 'you@example.com', 'amit67');
```

## 3. Local env

Copy `.env.example` to `.env.local` and fill in values.

- `R2_ENDPOINT` is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- `SESSION_SECRET` can be any long random string (`openssl rand -base64 32`)

```bash
npm install
npm run dev
```

Open http://localhost:3000, sign in with `password + DDMMYYYY`, then upload, browse, play, and delete.

## 4. Deploy to Vercel

Push the repo and import it in Vercel. Add the same env vars in the project settings, then deploy.

Uploads go **directly to R2** with presigned URLs, so large videos are not limited by Vercel's request body size.
