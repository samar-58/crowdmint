import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
import { resolve } from 'path'

// Load .env from project root (two levels up from apps/server)
import { config } from 'dotenv'
config({ path: resolve(__dirname, '../../.env') })

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: '../../prisma/migrations',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
})
