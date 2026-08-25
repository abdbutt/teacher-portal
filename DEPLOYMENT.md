# Deploying Teacher Portal to Vercel

This guide provides step-by-step instructions for deploying the **Teacher Portal** application to Vercel, integrating it with a hosted PostgreSQL database (such as Supabase or Neon), running database migrations in production, and setting up the required environment variables.

---

## 1. Database Setup (Supabase or Neon)

Prisma uses a PostgreSQL database. We recommend **Supabase** or **Neon** since they offer robust pooling configurations optimized for serverless environments (like Vercel).

### Option A: Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to **Settings > Database > Connection Strings**.
3. Under **Connection Pooler** (Transaction Mode, port `6543`), copy the connection URI. This pool connection is used for `DATABASE_URL`.
   - Make sure to append `?pgbouncer=true` to the end of the query string.
4. Under **Direct Connection** (Session Mode, port `5432`), copy the direct URI. This direct connection is used for `DIRECT_URL` (necessary for running migrations).

### Option B: Neon
1. Create a project at [neon.tech](https://neon.tech).
2. Copy the pooled connection string from the Dashboard for `DATABASE_URL` (pooled).
3. Toggle the connection details to select the unpooled direct address for `DIRECT_URL`.

---

## 2. Configuration & Dependencies

The project's code has already been pre-adapted for PostgreSQL compatibility in `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Make sure your local environment variables in `.env` match this system signature.

---

## 3. Deployment Steps to Vercel

### Step 3.1: Import Your Code to GitHub/GitLab
Push the local repository to your remote control system (e.g., GitHub):
```bash
git remote add origin <your-repo-ui-url>
git push -u origin main
```

### Step 3.2: Create a Vercel Project
1. Log in to [vercel.com](https://vercel.com).
2. Click **New Project** and click **Import** next to your imported Git repository.
3. Keep the **Framework Preset** as **Next.js** and build settings at their defaults.

### Step 3.3: Configure Production Environment Variables
Under the **Environment Variables** section in the Vercel Setup, add the following variables:

| Environment Variable | Description / Suggested Value |
| :--- | :--- |
| `DATABASE_URL` | Your transaction-pooled connection URL (e.g., Supabase port `6543` with `?pgbouncer=true`) |
| `DIRECT_URL` | Your direct database connection URL (e.g., Supabase port `5432`) |
| `NEXTAUTH_SECRET` | A secure, random 32-character string. Generate one using: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production Vercel deployment URL (e.g., `https://my-teacher-portal.vercel.app`) |
| `TWILIO_ACCOUNT_SID` | Your Twilio SID (obtained from the Twilio Console) |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Secret Key |
| `TWILIO_WHATSAPP_NUMBER` | Your Twilio Sandbox/Production WhatsApp number (e.g., `whatsapp:+14155238886`) |

---

## 4. Database Migrations in production

Since serverless functions are ephemeral, you must run database migrations during the build phase of your Vercel deployment.

Vercel will trigger this automatically because the project's build command in `package.json` is set to:
```json
"scripts": {
  "build": "prisma generate && next build"
}
```

### Applying Initial Schema and Database Seeding
To write the initial schema and create the default admin account:
1. Ensure your local machine is connected to the database via `.env` (or run it temporary via a CLI proxy).
2. Push your schema status:
   ```bash
   npx prisma migrate dev --name init
   ```
3. To seed the database with the default teacher credentials:
   ```bash
   npx prisma db seed
   ```

*(Default Seed Credentials: `teacher@school.com` / Password: `password123`)*

---

## 5. Verifying & Troubleshooting

If you encounter issues after deployment:
1. **PGBouncer Session Errors**: Ensure `DATABASE_URL` has `?pgbouncer=true` appended and `DIRECT_URL` points directly to port `5432`.
2. **Twilio Credentials**: If messages return `FAILED` status, verify:
   - The recipient parent numbers in the CSV import contain the country code prefix (e.g., `+923000000000` or `+1...`).
   - The `TWILIO_WHATSAPP_NUMBER` includes the exact `whatsapp:` prefix inside Vercel environment configurations.
3. **Logs**: View Vercel's real-time **Deployment Logs** and **Runtime Function Logs** inside your Vercel Project dashboard.
