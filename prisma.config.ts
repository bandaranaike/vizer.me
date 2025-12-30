import 'dotenv/config'; // Crucial for loading DATABASE_URL
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        // Pass the URL directly as a string or use the 'env' helper
        url: env('DATABASE_URL'),
    },
});
