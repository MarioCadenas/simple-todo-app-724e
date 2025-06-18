
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, CheckCircle2, Clock } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Todo, CreateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTodoDescription, setNewTodoDescription] = useState('');

  // Load todos from API
  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Create new todo
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoDescription.trim()) return;

    setIsLoading(true);
    try {
      const input: CreateTodoInput = { description: newTodoDescription.trim() };
      const newTodo = await trpc.createTodo.mutate(input);
      setTodos((prev: Todo[]) => [newTodo, ...prev]);
      setNewTodoDescription('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle todo status
  const handleToggleStatus = async (todo: Todo) => {
    const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
    
    try {
      const updatedTodo = await trpc.updateTodoStatus.mutate({
        id: todo.id,
        status: newStatus
      });
      
      setTodos((prev: Todo[]) =>
        prev.map((t: Todo) => t.id === todo.id ? updatedTodo : t)
      );
    } catch (error) {
      console.error('Failed to update todo status:', error);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (todoId: number) => {
    try {
      const result = await trpc.deleteTodo.mutate({ id: todoId });
      if (result.success) {
        setTodos((prev: Todo[]) => prev.filter((t: Todo) => t.id !== todoId));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const completedCount = todos.filter((todo: Todo) => todo.status === 'completed').length;
  const pendingCount = todos.filter((todo: Todo) => todo.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✨ My Todo List
          </h1>
          <p className="text-gray-600">Stay organized and get things done!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Todo Form */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Plus className="h-5 w-5" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="flex gap-4">
              <Input
                value={newTodoDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewTodoDescription(e.target.value)
                }
                placeholder="What needs to be done? ✍️"
                className="flex-1 border-2 border-gray-200 focus:border-indigo-400 transition-colors"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !newTodoDescription.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6"
              >
                {isLoading ? 'Adding...' : 'Add Task'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todo List */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-800">Your Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {todos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">No tasks yet!</p>
                <p className="text-gray-400">Add your first task above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo: Todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                      todo.status === 'completed'
                        ? 'bg-green-50 border-green-200 opacity-75'
                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <Checkbox
                      checked={todo.status === 'completed'}
                      onCheckedChange={() => handleToggleStatus(todo)}
                      className="h-5 w-5"
                    />
                    
                    <div className="flex-1">
                      <p className={`font-medium ${
                        todo.status === 'completed'
                          ? 'line-through text-gray-500'
                          : 'text-gray-800'
                      }`}>
                        {todo.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {todo.created_at.toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={todo.status === 'completed' ? 'default' : 'secondary'}
                        className={`flex items-center gap-1 ${
                          todo.status === 'completed'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        }`}
                      >
                        {todo.status === 'completed' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {todo.status === 'completed' ? 'Done' : 'Pending'}
                      </Badge>
                      
                      <Button
                        onClick={() => handleDeleteTodo(todo.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Made with 💜 using React + tRPC
        </div>
      </div>
    </div>
  );
}

export default App;
