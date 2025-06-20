
import { z } from 'zod';

// Todo schema
export const todoSchema = z.object({
  id: z.number(),
  description: z.string(),
  status: z.enum(['pending', 'completed']),
  created_at: z.coerce.date()
});

export type Todo = z.infer<typeof todoSchema>;

// Input schema for creating todos
export const createTodoInputSchema = z.object({
  description: z.string().min(1, 'Description cannot be empty')
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

// Input schema for updating todo status
export const updateTodoStatusInputSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'completed'])
});

export type UpdateTodoStatusInput = z.infer<typeof updateTodoStatusInputSchema>;

// Input schema for deleting todos
export const deleteTodoInputSchema = z.object({
  id: z.number()
});

export type DeleteTodoInput = z.infer<typeof deleteTodoInputSchema>;
