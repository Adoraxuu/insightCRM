import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './connection/migrations',
  schema: './connection/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
})
