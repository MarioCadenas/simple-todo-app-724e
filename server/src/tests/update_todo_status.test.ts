
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoStatusInput } from '../schema';
import { updateTodoStatus } from '../handlers/update_todo_status';
import { eq } from 'drizzle-orm';

describe('updateTodoStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo status to completed', async () => {
    // Create a test todo directly in the database
    const [createdTodo] = await db.insert(todosTable)
      .values({
        description: 'Test todo for status update',
        status: 'pending'
      })
      .returning()
      .execute();

    // Update the status
    const updateInput: UpdateTodoStatusInput = {
      id: createdTodo.id,
      status: 'completed'
    };

    const result = await updateTodoStatus(updateInput);

    // Verify the result
    expect(result.id).toEqual(createdTodo.id);
    expect(result.description).toEqual('Test todo for status update');
    expect(result.status).toEqual('completed');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update todo status to pending', async () => {
    // Create a completed todo directly in the database
    const [createdTodo] = await db.insert(todosTable)
      .values({
        description: 'Test completed todo',
        status: 'completed'
      })
      .returning()
      .execute();

    // Change back to pending
    const updateInput: UpdateTodoStatusInput = {
      id: createdTodo.id,
      status: 'pending'
    };

    const result = await updateTodoStatus(updateInput);

    // Verify the result
    expect(result.id).toEqual(createdTodo.id);
    expect(result.description).toEqual('Test completed todo');
    expect(result.status).toEqual('pending');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated status to database', async () => {
    // Create a test todo directly in the database
    const [createdTodo] = await db.insert(todosTable)
      .values({
        description: 'Database persistence test',
        status: 'pending'
      })
      .returning()
      .execute();

    // Update the status
    const updateInput: UpdateTodoStatusInput = {
      id: createdTodo.id,
      status: 'completed'
    };

    await updateTodoStatus(updateInput);

    // Query the database directly to verify persistence
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].status).toEqual('completed');
    expect(todos[0].description).toEqual('Database persistence test');
  });

  it('should throw error when todo does not exist', async () => {
    const updateInput: UpdateTodoStatusInput = {
      id: 999, // Non-existent ID
      status: 'completed'
    };

    await expect(updateTodoStatus(updateInput)).rejects.toThrow(/not found/i);
  });
});
