import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Checkbox } from "@headlessui/react";
import { Todo } from "./TodoBox";

interface Props {
  handleAddtodo: (todo: Todo) => void;
}

function AddTodoButton({ handleAddtodo }: Props) {
  const [open, setOpen] = useState(false);
  const [checkBox, setCheckBox] = useState(false);
  const initialState = {
    id: -1,
    todo_title: "",
    notes: "",
    due_date: new Date().toISOString().slice(0, 10),
    todo_type: "",
    completed: 0,
  };

  const [newTodo, setNewTodo] = useState(initialState);

  const categories = [
    "Personal",
    "Health",
    "Work",
    "Project",
    "Education",
    "Daily Task",
    "Miscellaneous",
  ];

  const handleClickAdd = () => {
    handleAddtodo(newTodo);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTodo((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <>
      <button
        className="mr-5 mt-2 border-2 border-neutral-400 float-right"
        onClick={() => setOpen(true)}
      >
        Add new todo
      </button>
      <Dialog className="relative z-10" open={open} onClose={setOpen}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Add a new todo
                    </DialogTitle>
                    <form>
                      <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">
                          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-full">
                              <label className="block text-sm font-medium leading-6 text-gray-900">
                                todo Name
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="todo_title"
                                  id="todo_title"
                                  value={newTodo.todo_title}
                                  onChange={handleChange}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-sm font-medium leading-6 text-gray-900">
                                Todo type
                              </label>
                              <div className="mt-2">
                                <select
                                  id="todo_type"
                                  name="todo_type"
                                  value={newTodo.todo_type}
                                  onChange={handleChange}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                >
                                  <option value="">-Select a type-</option>
                                  {categories.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="col-span-full">
                              <label
                                htmlFor="about"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Description
                              </label>
                              <div className="mt-2">
                                <textarea
                                  id="notes"
                                  name="notes"
                                  value={newTodo.notes}
                                  onChange={handleChange}
                                  rows={3}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                              <p className="mt-3 text-sm leading-6 text-gray-600"></p>
                            </div>

                            <div className="col-span-3">
                              <label className="block text-sm font-medium leading-6 text-gray-900">
                                Deadline
                              </label>
                              <div className="mt-2">
                                <input
                                  type="date"
                                  name="due_date"
                                  id="due_date"
                                  value={newTodo.due_date}
                                  onChange={handleChange}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>

                            <div>
                              <Checkbox
                                checked={checkBox}
                                onChange={setCheckBox}
                                className="group block size-4 rounded border bg-white data-[checked]:bg-blue-500"
                              >
                                {/* Checkmark icon */}
                                <svg
                                  className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                >
                                  <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Checkbox>
                              <label className="block text-sm font-medium leading-6 text-gray-900">
                                Repetition?
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                  onClick={handleClickAdd}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => {
                    setOpen(false);
                    setNewTodo(initialState);
                  }}
                  data-autofocus
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default AddTodoButton;