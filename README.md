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

## Required Prisma commands

### Prisma init command
`npx prisma migrate dev --name init` or \
`npx prisma migrate dev --name add_password_to_user`

Create all tables in your Postgres database \
Record the migration in prisma/migrations/ \
Sync your database schema to match the Prisma models \

### Confirm the table exists
`npx prisma studio`

Then open your browser at the URL it prints (usually http://localhost:5555 \
You should see the tables listed. If Job doesn’t appear, the migration didn’t run or was applied to the wrong database.

### Force regeneration
`npx prisma generate`

When you changed the generator output path or moved files, regenerate the Prisma client
