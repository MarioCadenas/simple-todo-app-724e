
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

// Test input
const testDeleteInput: DeleteTodoInput = {
  id: 1
};

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a todo first
    const insertResult = await db.insert(todosTable)
      .values({
        description: 'Test todo to delete'
      })
      .returning()
      .execute();

    const todoId = insertResult[0].id;
    
    // Delete the todo
    const result = await deleteTodo({ id: todoId });

    // Should return success
    expect(result.success).toBe(true);

    // Verify todo is deleted from database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should return false when deleting non-existent todo', async () => {
    // Try to delete a todo that doesn't exist
    const result = await deleteTodo({ id: 999 });

    // Should return false for non-existent todo
    expect(result.success).toBe(false);
  });

  it('should not affect other todos when deleting one', async () => {
    // Create multiple todos
    const insertResults = await db.insert(todosTable)
      .values([
        { description: 'Todo 1' },
        { description: 'Todo 2' },
        { description: 'Todo 3' }
      ])
      .returning()
      .execute();

    const todoToDelete = insertResults[1].id; // Delete the middle one

    // Delete one todo
    const result = await deleteTodo({ id: todoToDelete });

    // Should succeed
    expect(result.success).toBe(true);

    // Verify only the specified todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2);
    expect(remainingTodos.find(t => t.id === todoToDelete)).toBeUndefined();
    expect(remainingTodos.find(t => t.id === insertResults[0].id)).toBeDefined();
    expect(remainingTodos.find(t => t.id === insertResults[2].id)).toBeDefined();
  });
});
