import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export interface Step {
  name: string;
  done: boolean;
}

export interface Ratio {
  done: number;
  target: number;
}

export interface Goal {
  id: number;
  goalName: string;
  category: string;
  description: string;
  endDate: string;
  repetition: string;
  dateOfRepetition: string;
  goalType: number;
  steps: Step[] | Ratio | string;
  completed: number;
}

interface Props extends Goal {
  handleDeleteGoal: (id: number) => void;
}

function GoalBox({
  id,
  goalName,
  category,
  description,
  endDate,
  repetition,
  dateOfRepetition,
  goalType,
  steps,
  completed,
  handleDeleteGoal,
}: Props) {
  const [open, setOpen] = useState(false);

  const goalTypes = ["Single", "Subgoals", "Number"];

  const handleClickDelete = () => {
    setOpen(false);
    handleDeleteGoal(id);
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="my-3 px-12 py-10 bg-neutral-300 rounded-lg drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)] transition transform hover:-translate-y-0.5 hover:-translate-x-0.5"
      >
        <h1 className="font-semibold">{goalName}</h1>
        <h2>{category}</h2>
        <h2>Date: {endDate}</h2>
        <h2>{completed}%</h2>
      </div>

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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"></div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {goalName}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Category: {category}
                        <br />
                        Description: {description}
                        <br />
                        Deadline: {endDate}
                        <br />
                        Repetition: {repetition}
                        <br />
                        Goal Type: {goalTypes[goalType]}
                        <br />
                        Progress: {completed}%<br />
                        Steps:
                        <br />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                  onClick={() => setOpen(false)}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 sm:w-auto"
                  onClick={() => setOpen(false)}
                  data-autofocus
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-500 sm:mt-0 sm:w-auto"
                  onClick={handleClickDelete}
                  data-autofocus
                >
                  Delete
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default GoalBox;
