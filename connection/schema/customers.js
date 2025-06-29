const { pgTable, uuid, text, timestamp, integer, boolean, date, index, unique } = require('drizzle-orm/pg-core')

const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  idNumber: text('id_number').unique(),
  gender: text('gender'),
  birthday: date('birthday'),
  zodiacSign: text('zodiac_sign'),
  interests: text('interests'),
  isMarried: boolean('is_married'),
  hasChildren: boolean('has_children'),
  customerLevel: text('customer_level').default('C'),
  customerSource: text('customer_source'),
  company: text('company'),
  position: text('position'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  website: text('website'),
  notes: text('notes'),
  status: text('status').default('active'),
  priority: text('priority').default('normal'),
  assignedTo: uuid('assigned_to'),
  lastContactDate: timestamp('last_contact_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  nameIdx: index('customers_name_idx').on(table.name),
  emailIdx: index('customers_email_idx').on(table.email),
  phoneIdx: index('customers_phone_idx').on(table.phone),
  companyIdx: index('customers_company_idx').on(table.company),
  statusIdx: index('customers_status_idx').on(table.status),
  customerLevelIdx: index('customers_level_idx').on(table.customerLevel),
  assignedToIdx: index('customers_assigned_to_idx').on(table.assignedTo),
  createdAtIdx: index('customers_created_at_idx').on(table.createdAt),
}))

const customerRelationships = pgTable('customer_relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull(),
  relatedCustomerId: uuid('related_customer_id').notNull(),
  relationshipType: text('relationship_type').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  customerIdx: index('customer_relationships_customer_idx').on(table.customerId),
  relatedCustomerIdx: index('customer_relationships_related_idx').on(table.relatedCustomerId),
}))

module.exports = { customers, customerRelationships }