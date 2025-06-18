
import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define enum for todo status
export const todoStatusEnum = pgEnum('todo_status', ['pending', 'completed']);

export const todosTable = pgTable('todos', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  status: todoStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Todo = typeof todosTable.$inferSelect; // For SELECT operations
export type NewTodo = typeof todosTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { todos: todosTable };
