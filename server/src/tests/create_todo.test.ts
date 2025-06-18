
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  description: 'Test todo item'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo with default status', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.description).toEqual('Test todo item');
    expect(result.status).toEqual('pending'); // Should default to pending
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].description).toEqual('Test todo item');
    expect(todos[0].status).toEqual('pending');
    expect(todos[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple todos independently', async () => {
    const todo1 = await createTodo({ description: 'First todo' });
    const todo2 = await createTodo({ description: 'Second todo' });

    expect(todo1.id).not.toEqual(todo2.id);
    expect(todo1.description).toEqual('First todo');
    expect(todo2.description).toEqual('Second todo');
    expect(todo1.status).toEqual('pending');
    expect(todo2.status).toEqual('pending');
  });

  it('should create todo with whitespace description', async () => {
    const result = await createTodo({ description: '   Todo with spaces   ' });

    expect(result.description).toEqual('   Todo with spaces   ');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });
});
