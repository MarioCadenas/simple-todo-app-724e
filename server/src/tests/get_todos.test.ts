
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    expect(result).toEqual([]);
  });

  it('should return all todos', async () => {
    // Create test todos
    await db.insert(todosTable)
      .values([
        { description: 'First todo', status: 'pending' },
        { description: 'Second todo', status: 'completed' }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    expect(result[0].description).toBeDefined();
    expect(result[0].status).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return todos ordered by creation date (newest first)', async () => {
    // Create todos with slight delay to ensure different timestamps
    await db.insert(todosTable)
      .values({ description: 'First todo', status: 'pending' })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(todosTable)
      .values({ description: 'Second todo', status: 'completed' })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    expect(result[0].description).toEqual('Second todo');
    expect(result[1].description).toEqual('First todo');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return todos with all required fields', async () => {
    await db.insert(todosTable)
      .values({ description: 'Test todo', status: 'pending' })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    const todo = result[0];
    expect(todo.id).toBeDefined();
    expect(todo.description).toEqual('Test todo');
    expect(todo.status).toEqual('pending');
    expect(todo.created_at).toBeInstanceOf(Date);
  });
});
