const { pgTable, uuid, text, timestamp, integer } = require('drizzle-orm/pg-core')

const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  gender: text('gender'),
  customerLimit: integer('customer_limit').default(50),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

module.exports = { users }
