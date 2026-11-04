This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment setup

Create a local `.env` file from `.env.example` and set real values before running the project:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` for the PostgreSQL connection string
- `JWT_SECRET` for signing auth tokens

Server features that require these values will report a configuration error if they are missing. The production build does not need live database credentials.

For Vercel, add both variables in **Project Settings → Environment Variables** for every environment where the app should run. `DATABASE_URL` must be the connection string for a reachable PostgreSQL database; the local URL in `.env.example` is only for local development. Set `JWT_SECRET` to a long, random secret and redeploy after changing variables.

Before accepting registrations, deploy the Prisma migrations to that same database:

```bash
npx prisma migrate deploy
```

You can check database connectivity at `/api/test-db`. Never put database credentials in client-side variables such as `NEXT_PUBLIC_DATABASE_URL`.

## Provision staff and group leaders

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to the target PostgreSQL database, plus a unique `INITIAL_ADMIN_EMAIL` and strong `INITIAL_ADMIN_PASSWORD` (at least 12 characters). The bootstrap script also reads `INITIAL_ADMIN_NAME` and optional `INITIAL_ADMIN_PHONE`.
2. Deploy the schema to that database with `npx prisma migrate deploy`.
3. Run `npm run bootstrap:admin` once. It creates an admin only if the database has no admin. It never resets or replaces an existing administrator. Do not expose this script through a public API.
4. Sign in as the admin and open **Manage Staff and Groups** from the loan applications page. Create loan officer accounts there; share their initial password securely and out of band.
5. People who will lead groups must first register as customers. The admin can then create a group, select its leader, and add registered customers as members. Group creation promotes the selected customer to `TEAM_LEADER`.

The admin management APIs are restricted to active administrators. Loan officers can view the application queue but cannot approve or reject applications.

To configure the approved Individual Loan product (₹5,000–₹1,00,000, 30% flat interest, fixed 26 weeks), set `DATABASE_URL` to the target database and run `npm run setup:individual-product`. The command is safe to repeat and refuses to overwrite an existing product with different terms. Run it against the same database used by Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
