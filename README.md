# Drive

A personal image and video library. The Next.js app runs on **Vercel**. Files live in **Cloudflare R2**. Users, sessions, and file metadata live in **Cloudflare D1**.

There is no signup. You insert users in D1 yourself. Each logged-in user only sees their own files.

Uploads go **from the browser straight to R2** with presigned URLs, so large videos are not limited by Vercel’s ~4.5MB request body size.

## Features

- Email login (no signup screen)
- Daily rotating password: stored base password + today’s date
- Upload images and videos
- Grid with All / Images / Videos filters
- Lightbox player (`<img>` or `<video controls>`)
- Delete from the card or the lightbox

Allowed types: JPEG, PNG, WebP, GIF, AVIF, MP4, WebM, QuickTime (`.mov`). Max size 5GB.

## How login works

D1 stores the **plain** base password, for example `amit67`.

What you type in the login form is:

```
basePassword + DDMMYYYY
```

Date is **IST (Asia/Kolkata)**.

Example: stored password `amit67` on 15 Aug 2026 → enter `amit6715082026`.

Sessions last 7 days (HTTP-only cookie).

## Architecture

```
Browser  →  Next.js (Vercel)  →  D1 HTTP API   (users, sessions, media rows)
Browser  →  R2 (presigned PUT/GET)              (actual files)
```

Next.js never streams file bytes. It only creates short-lived upload/playback URLs and writes metadata.

## Prerequisites

- Node.js 20+
- A Cloudflare account
- A Vercel account (for deploy)

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` (or `.env`):

```
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_D1_DATABASE_ID=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=drive-media
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
SESSION_SECRET=
```

| Variable | Where to get it |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard → Workers & Pages or R2 → **Account ID** (right sidebar) |
| `R2_ACCOUNT_ID` | Same value as `CLOUDFLARE_ACCOUNT_ID` |
| `R2_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` — **do not** append the bucket name |
| `R2_BUCKET_NAME` | Your R2 bucket name |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 → **Manage R2 API Tokens** → Create token (Object Read & Write). Shown once. |
| `CLOUDFLARE_D1_DATABASE_ID` | D1 → your database → **Database ID** (UUID) |
| `CLOUDFLARE_API_TOKEN` | [API Tokens](https://dash.cloudflare.com/profile/api-tokens) → Create Custom Token → Account → **D1** → **Edit**. This is **not** the R2 access key. |
| `SESSION_SECRET` | Any long random string: `openssl rand -base64 32` |

Never commit `.env` or `.env.local`.

## Cloudflare setup

### 1. R2 bucket

1. Open [R2](https://dash.cloudflare.com/?to=/:account/r2/overview)
2. **Create bucket** (for example `drive-media` or `pdrive`)
3. Put that name in `R2_BUCKET_NAME`

### 2. R2 access keys

1. R2 → **Manage R2 API Tokens**
2. **Create API token**
3. Permission: **Object Read & Write**
4. Apply to this bucket (or all buckets)
5. Copy **Access Key ID** and **Secret Access Key** into `.env.local`

### 3. CORS (required for browser upload/playback)

Without this, uploads fail with `No 'Access-Control-Allow-Origin'`.

1. R2 → your bucket → **Settings** → **CORS Policy** → **Add CORS policy**
2. JSON tab → paste [`cors.json`](cors.json) (already in this repo):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Type", "Accept-Ranges", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

3. Save

After you deploy, add your Vercel origin to `AllowedOrigins`, for example `"https://your-app.vercel.app"`.

### 4. D1 database

1. Open [D1](https://dash.cloudflare.com/?to=/:account/workers/d1)
2. **Create database** (for example `drive-db`)
3. Copy **Database ID** into `CLOUDFLARE_D1_DATABASE_ID`

### 5. Cloudflare API token (D1)

1. [Create Token](https://dash.cloudflare.com/profile/api-tokens) → **Create Custom Token**
2. Permission: Account → **D1** → **Edit**
3. Account Resources: your account
4. Create and paste into `CLOUDFLARE_API_TOKEN`

### 6. Run the migration

D1 → your database → **Console**. Paste and run [`migrations/0001_init.sql`](migrations/0001_init.sql).

If the console only accepts one statement at a time, run each `CREATE TABLE` / `CREATE INDEX` separately.

Then insert a user (change email and password):

```sql
INSERT INTO users (id, email, password)
VALUES (lower(hex(randomblob(16))), 'you@example.com', 'amit67');
```

Check:

```sql
SELECT email FROM users;
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign in with `basePassword + DDMMYYYY` (IST). Upload, browse, play, delete.

```bash
npm run lint
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub
2. [Import the project](https://vercel.com/new) in Vercel
3. Add the **same env vars** in Project Settings → Environment Variables
4. Deploy
5. Add the Vercel URL to the R2 CORS `AllowedOrigins` list and save

## Project structure

```
app/
  login/page.tsx              Login page
  page.tsx                    Media library
  api/auth/login|logout       Session create / destroy
  api/media                   List + save metadata after upload
  api/media/upload-url        Presigned PUT
  api/media/[id]              Delete R2 object + D1 row
components/                   Grid, cards, viewer, upload, header
lib/                          D1, R2, auth, password (IST date)
migrations/0001_init.sql      Schema
cors.json                     R2 CORS policy for the dashboard
proxy.ts                      Redirects unauthenticated users to /login
```

## Troubleshooting

**CORS error on upload** (`No 'Access-Control-Allow-Origin'`)  
CORS is missing or does not include `http://localhost:3000`. Add the policy in R2 Settings and hard-refresh.

**`R2_ENDPOINT` with `/bucketname` on the end**  
Wrong. Endpoint is only `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. The bucket name belongs in `R2_BUCKET_NAME`.

**Login always fails**  
Use base password + **today’s IST date** as `DDMMYYYY`, not the stored password alone. Confirm the user exists: `SELECT email, password FROM users;`

**D1 errors / 500 on login**  
`CLOUDFLARE_API_TOKEN` must be a **D1 Edit** API token from My Profile → API Tokens, not the R2 access key.

**Upload to storage failed after CORS is set**  
Confirm the R2 token has Object Read & Write on this bucket, and that `R2_BUCKET_NAME` matches the bucket you created.

**Font preload warning in the console**  
Harmless; ignore it.
