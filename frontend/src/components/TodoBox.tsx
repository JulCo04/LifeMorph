import React from 'react';

export interface Todo {
  id: number;
  todo_title: string;
  todo_type: string;
  due_date: string;
  completed: number;
  notes: string;
}

interface TodoBoxProps {
  id: number;
  todo_title: string;
  todo_type: string;
  due_date: string;
  completed: number;
  notes: string;
  handleDeleteTodo: (id: number) => void;
  handleEditTodo: (todo: Todo) => void;
  handleToggleCompletion: () => void; // Added here
}

const TodoBox: React.FC<TodoBoxProps> = ({
  id,
  todo_title,
  todo_type,
  due_date,
  completed,
  notes,
  handleDeleteTodo,
  handleEditTodo,
  handleToggleCompletion, // Added here
}) => {
  return (
    <div className="flex justify-between items-center border p-2 my-2">
      <div>
        <input
          type="checkbox"
          checked={completed === 100}
          onChange={handleToggleCompletion} // Updated here
        />
        <span className="ml-2">{todo_title}</span>
      </div>
      <div>
        <button onClick={() => handleEditTodo({ id, todo_title, todo_type, due_date, completed, notes })}>Edit</button>
        <button onClick={() => handleDeleteTodo(id)}>Delete</button>
      </div>
    </div>
  );
};

export default TodoBox;