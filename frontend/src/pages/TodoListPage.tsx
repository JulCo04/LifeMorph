import React, { useState, useEffect } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Sidebar from "../components/Sidebar";
import APTitleBar from "../components/APTitleBar";
import TodoBox, { Todo } from "../components/TodoBox";
import { clsx } from "clsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCheck } from "react-icons/fa6";
import { FaDeleteLeft } from "react-icons/fa6";
import { MdCancelPresentation } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const TodoListPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<Todo | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<{ todoId: number | null, field: string | null }>({ todoId: null, field: null });
  const [userId, setUserId] = useState(-1);

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return process.env.REACT_APP_PRODUCTION_ENVIRONMENT + route;
    } else {
      return  "http://localhost:3001/" + route;
    }
  }

  const handleApiResponse = (data: any): Todo[] => {
    return data.map((item: any) => ({
      id: item.id,
      todo_title: item.todo_title,
      todo_type: item.todo_type,
      due_date: item.due_date,
      completed: Number(item.completed),
      notes: item.notes,
    }));
  };

  const handleAddTodo = (todo: Todo) => {
    fetch(buildPath("api/todos"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...todo,userId:userId}),
    })
      .then((response) => response.json())
      .then((data) => {
        setTodos([...todos, data.todo]);
        setNewTodo(null);
      })
      .catch((error) => console.error("Error adding todo:", error));
  };

  const handleDeleteTodo = (id: number) => {
    fetch(buildPath(`api/todos/${id}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(() => {
        setTodos(todos.filter((todo) => todo.id !== id));
      })
      .catch((error) => console.error("Error deleting todo:", error));
  };

  const handleEditTodo = (todo: Todo) => {
    fetch(buildPath(`api/todos/${todo.id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...todo,
        due_date: new Date(todo.due_date).toISOString().split('T')[0],
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setTodos(todos.map(t => (t.id === todo.id ? todo : t)));
        setEditingTodoId(null);
        setEditingField({ todoId: null, field: null });
      })
      .catch((error) => console.error("Error updating todo:", error));
  };

  const updateTodoCompletion = (id: number, completed: number) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;

    fetch(buildPath(`api/todos/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...todoToUpdate, completed }),
    })
      .then((response) => response.json())
      .then(() => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, completed } : todo));
      })
      .catch((error) => console.error("Error updating todo completion:", error));
  };

  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("user");
    let userID = -1;
    if (data) {
      userID = JSON.parse(data).user.id;
      setUserId(userID);
    } else {
      navigate('/');
    }
    fetch(buildPath(`api/todos/${userID}`))
      .then((response) => response.json())
      .then((data) => {
      console.log(data);      
        setTodos(data);
      })
      .catch((error) => console.error("Error fetching todos:", error));
  }, []);

  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const filterTodos = (todos: Todo[]) => {
    let all: Todo[] = [];
    let today: Todo[] = [];
    let upcoming: Todo[] = [];
    let completed: Todo[] = [];

    todos.forEach((todo) => {
      if (todo.completed === undefined || todo.completed === null) {
        console.error(`Todo with id ${todo.id} has an invalid 'completed' value.`);
        return;
      }

      const completedValue = Number(todo.completed);

      if (isNaN(completedValue)) {
        console.error(`Todo with id ${todo.id} has a non-numeric 'completed' value.`);
        return;
      }

      if (completedValue === 100) {
        completed.push(todo);
      } else {
        all.push(todo);
        if (isToday(todo.due_date)) {
          today.push(todo);
        } else {
          upcoming.push(todo);
        }
      }
    });

    return { all, today, upcoming, completed };
  };

  const filteredTodos = filterTodos(todos);
  const { all, today, upcoming, completed } = filteredTodos;

  const todoRow = (todo: Todo) => (
    <tr key={todo.id} className="border-t">
      <td className="px-4 py-2 text-center">
        <input 
          type="checkbox" 
          checked={todo.completed === 100} 
          onChange={() => updateTodoCompletion(todo.id, todo.completed === 100 ? 0 : 100)} 
        />
      </td>
      <td className="px-4 py-2">
        {editingField.todoId === todo.id && editingField.field === 'title' ? (
          <input
            type="text"
            value={todo.todo_title}
            onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, todo_title: e.target.value } : t))}
            onBlur={() => handleEditTodo(todo)}
            className="w-full"
            autoFocus
          />
        ) : (
          <span onClick={() => setEditingField({ todoId: todo.id, field: 'title' })}>
            {todo.todo_title}
          </span>
        )}
      </td>
      <td className="px-4 py-2">
        {editingField.todoId === todo.id && editingField.field === 'type' ? (
          <input
            type="text"
            value={todo.todo_type}
            onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, todo_type: e.target.value } : t))}
            onBlur={() => handleEditTodo(todo)}
            className="w-full"
            autoFocus
          />
        ) : (
          <span onClick={() => setEditingField({ todoId: todo.id, field: 'type' })}>
            <span className={`px-2 py-1 rounded ${getTodoTypeColor(todo.todo_type)}`}>{todo.todo_type}</span>
          </span>
        )}
      </td>
      <td className="px-4 py-2">
        {editingField.todoId === todo.id && editingField.field === 'date' ? (
          <DatePicker
            selected={new Date(todo.due_date)}
            onChange={(date) => setTodos(todos.map(t => t.id === todo.id ? { ...t, due_date: date ? date.toISOString().split('T')[0] : todo.due_date } : t))}
            onBlur={() => handleEditTodo(todo)}
            dateFormat="MM/dd/yyyy"
            className="w-full"
            autoFocus
          />
        ) : (
          <span onClick={() => setEditingField({ todoId: todo.id, field: 'date' })}>
            {dateFormatter.format(new Date(todo.due_date))}
          </span>
        )}
      </td>
      <td className="px-4 py-2">
        {editingField.todoId === todo.id && editingField.field === 'notes' ? (
          <input
            type="text"
            value={todo.notes}
            onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, notes: e.target.value } : t))}
            onBlur={() => handleEditTodo(todo)}
            className="w-full"
            autoFocus
          />
        ) : (
          <span onClick={() => setEditingField({ todoId: todo.id, field: 'notes' })}>
            {todo.notes}
          </span>
        )}
      </td>
      <td className="px-4 py-2 text-center">
        <button onClick={() => handleDeleteTodo(todo.id)}>
        <span className="text-red-500 hover:text-red-700"><FaDeleteLeft /></span>
        </button>
      </td>
    </tr>
  );

  const getTodoTypeColor = (todoType: string) => {
    switch (todoType.toLowerCase()) {
      case "work":
        return "bg-blue-200 text-blue-700";
      case "personal":
        return "bg-green-200 text-green-700";
      case "shopping":
        return "bg-yellow-200 text-yellow-700";
      case "other":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };


  const addNewTodoRow = () => {
    setNewTodo({
      id: 0,
      todo_title: '',
      todo_type: '',
      due_date: new Date().toISOString().split('T')[0],
      completed: 0,
      notes: '',
    });
    setEditingTodoId(null); // Reset editing mode when adding a new todo
  };

  const saveNewTodo = () => {
    if (newTodo) {
      handleAddTodo(newTodo);
    }
  };

  const cancelNewTodo = () => {
    setNewTodo(null);
  };






  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <APTitleBar title="To-do List" />
        <div className='p-5'>
          <TabGroup>
            <TabList className="flex space-x-4 border-b">
              <Tab className={({ selected }) => clsx("px-4 py-2", selected ? "border-b-2 border-black" : "text-gray-500")}>
                All
              </Tab>
              <Tab className={({ selected }) => clsx("px-4 py-2", selected ? "border-b-2 border-black" : "text-gray-500")}>
                Today
              </Tab>
              <Tab className={({ selected }) => clsx("px-4 py-2", selected ? "border-b-2 border-black" : "text-gray-500")}>
                Upcoming
              </Tab>
              <Tab className={({ selected }) => clsx("px-4 py-2", selected ? "border-b-2 border-black" : "text-gray-500")}>
                Completed
              </Tab>
            </TabList>
            <TabPanels className="mt-5">
              <TabPanel>
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-300">
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {all.map(todoRow)}
                    {newTodo && (
                      <tr className="border-t">
                        <td className="px-4 py-2 text-center">
                          <input 
                            type="checkbox" 
                            checked={newTodo.completed === 100} 
                            onChange={() => setNewTodo({ ...newTodo, completed: newTodo.completed === 100 ? 0 : 100 })} 
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={newTodo.todo_title} 
                            onChange={(e) => setNewTodo({ ...newTodo, todo_title: e.target.value })} 
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={newTodo.todo_type} 
                            onChange={(e) => setNewTodo({ ...newTodo, todo_type: e.target.value })} 
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <DatePicker
                            selected={new Date(newTodo.due_date)}
                            onChange={(date) => setNewTodo({ ...newTodo, due_date: date ? date.toISOString().split('T')[0] : newTodo.due_date })}
                            dateFormat="MM/dd/yyyy"
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={newTodo.notes} 
                            onChange={(e) => setNewTodo({ ...newTodo, notes: e.target.value })} 
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={saveNewTodo} className="text-xl text-green-500 hover:text-green-700">
                            <FaCheck />
                          </button>
                          <button onClick={cancelNewTodo} className="text-xl text-red-500 hover:text-red-700 ml-2">
                            <MdCancelPresentation />
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <button onClick={addNewTodoRow} className="mt-4 px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500">
                  + Add New Todo
                </button>
              </TabPanel>
              <TabPanel>
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-300">
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {today.map(todoRow)}
                  </tbody>
                </table>
              </TabPanel>
              <TabPanel>
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-300">
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map(todoRow)}
                  </tbody>
                </table>
              </TabPanel>
              <TabPanel>
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-300">
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map(todoRow)}
                  </tbody>
                </table>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default TodoListPage;