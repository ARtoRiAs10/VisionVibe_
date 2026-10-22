import { pgTable, serial, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const designs = pgTable('designs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  originalImageUrl: text('original_image_url').notNull(),
  generatedImageUrl: text('generated_image_url').notNull(),
  description: text('description'),
  theme: varchar('theme', { length: 100 }).notNull(),
  subTheme: varchar('sub_theme', { length: 100 }).notNull(),
  budget: varchar('budget', { length: 50 }).notNull(),
  prompt: text('prompt'),
  /** Full art-directed prompt that was actually sent to the model */
  generatedPrompt: text('generated_prompt'),
  roomType: varchar('room_type', { length: 100 }),
  lighting: varchar('lighting', { length: 100 }),
  aspectRatio: varchar('aspect_ratio', { length: 20 }),
  provider: varchar('provider', { length: 60 }),
  model: varchar('model', { length: 120 }),
  isPublic: boolean('is_public').default(false).notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Design = typeof designs.$inferSelect;
export type NewDesign = typeof designs.$inferInsert;
