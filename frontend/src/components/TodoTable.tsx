import { useState } from "react";
import TodoBox, { Todo } from "./TodoBox";
import AddTodoButton from "./AddTodoButton";

interface TodoTableProps {
  todos: Todo[];
  handleAddTodo: (todo: Todo) => void;
  handleDeleteTodo: (id: number) => void;
}

const TodoTable: React.FC<TodoTableProps> = ({ todos, handleAddTodo, handleDeleteTodo }) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredTodos = todos.filter(todo => {
    const today = new Date().toISOString().slice(0, 10);
    switch (filter) {
      case "today":
        return todo.due_date === today;
      case "upcoming":
        return todo.due_date > today;
      case "completed":
        return todo.completed === 100;
      default:
        return true;
    }
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">To-do List</h1>
      <div className="flex justify-between mb-4">
        <div>
          {["all", "today", "upcoming", "completed"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 mr-2 ${
                filter === tab ? "bg-blue-500 text-white" : "bg-gray-200"
              } rounded`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <AddTodoButton handleAddtodo={handleAddTodo} />
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="w-1/12 px-4 py-2 border">Status</th>
            <th className="w-3/12 px-4 py-2 border">Name</th>
            <th className="w-2/12 px-4 py-2 border">Type</th>
            <th className="w-2/12 px-4 py-2 border">Date</th>
            <th className="w-4/12 px-4 py-2 border">Notes</th>
            <th className="w-1/12 px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTodos.map(todo => (
            <tr key={todo.id} className="hover:bg-gray-100">
              <td className="border px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={todo.completed === 100}
                  onChange={() => {
                    // Handle status change here
                  }}
                />
              </td>
              <td className="border px-4 py-2">{todo.todo_title}</td>
              <td className="border px-4 py-2">{todo.todo_type}</td>
              <td className="border px-4 py-2">{todo.due_date}</td>
              <td className="border px-4 py-2">{todo.notes}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TodoTable;