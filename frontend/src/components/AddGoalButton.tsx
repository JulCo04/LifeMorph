import { useState } from "react";
import { Goal, Step, Ratio } from "../components/GoalBox";
import {
  Checkbox,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Field,
  Label,
} from "@headlessui/react";

import { FaCheck, FaPlus } from "react-icons/fa6";
import { MdClose, MdDelete } from "react-icons/md";

interface Props {
  handleAddGoal: (goal: Goal) => void;
}

function AddGoalButton({ handleAddGoal }: Props) {
  const [open, setOpen] = useState(false);
  const initialState: Goal = {
    id: -1,
    goalName: "",
    category: "",
    description: "",
    endDate: new Date().toISOString().slice(0, 10),
    repetition: 0,
    dateOfRepetition: null,
    goalType: 0,
    steps: "{}",
    completed: 0,
  };

  const [newGoal, setNewGoal] = useState(initialState);

  const categories = [
    "Personal Development",
    "Health & Fitness",
    "Career",
    "Finance",
    "Education",
    "Relationship",
    "Fun & Entertainment",
    "Miscellaneous",
  ];

  const editItems = [
    "Goal",
    "Category",
    "Deadline",
    "Goal Type",
    "Progress",
    "Description",
    "Repetition",
  ];

  const inputFieldClass =
    "rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6";

  const goalTypes = ["Single", "Subgoals", "Number"];
  const blankStep: Step = { name: "", done: false };

  // On "Cancel" Press: reset all goal fields and states
  const handleReset = () => {
    setOpen(false);
    setNewGoal(initialState);
  };

  const handleClickAdd = () => {
    const constructedGoal: Goal = newGoal;
    let updatedCompletion = constructedGoal.completed;

    // Removing empty steps
    if (constructedGoal.goalType === 1) {
      constructedGoal.steps = (constructedGoal.steps as Step[]).filter(
        (step) => step.name !== ""
      );
    }

    // Calculate completion
    if (constructedGoal.goalType === 1) {
      const subgoals = [...(constructedGoal.steps as Step[])];

      let numOfDone = 0;
      for (let i = 0; i < subgoals.length; i++)
        if (subgoals[i].done) numOfDone++;

      updatedCompletion = Math.round((numOfDone * 100) / subgoals.length);
    } else if (constructedGoal.goalType === 2) {
      const ratio = constructedGoal.steps as Ratio;
      updatedCompletion =
        ratio.done > ratio.target
          ? 100
          : ratio.target === 0
          ? 0
          : Math.round((ratio.done * 100) / ratio.target);
    }

    constructedGoal.completed = updatedCompletion;
    constructedGoal.steps = JSON.stringify(constructedGoal.steps);

    if (constructedGoal.repetition > 0) {
      const currDate = new Date();
      currDate.setDate(currDate.getDate() + constructedGoal.repetition);
      constructedGoal.dateOfRepetition = currDate.toISOString().slice(0, 10);
    }

    handleAddGoal(constructedGoal);
    handleReset();
  };

  const handleNewStep = () => {
    const subgoals = newGoal.steps as Step[];
    if (subgoals[subgoals.length - 1].name !== "") {
      subgoals.push(blankStep);
      setNewGoal((prevState) => ({
        ...prevState,
        steps: subgoals,
      }));
    }
  };

  const handleStepChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    setNewGoal((prevState) => {
      const newSteps = [...(prevState.steps as Step[])];
      newSteps[index] = { name: value, done: false };

      return {
        ...prevState,
        steps: newSteps,
      };
    });
  };

  const handleSubgoalUpdate = (index: number) => {
    setNewGoal((prevState) => {
      const updatedSteps = [...(prevState.steps as Step[])];
      const bool = !updatedSteps[index].done;

      updatedSteps[index] = {
        ...updatedSteps[index],
        done: bool,
      };

      return {
        ...prevState,
        steps: updatedSteps,
      };
    });
  };

  const handleStepDelete = (index: number) => {
    setNewGoal((prevState) => ({
      ...prevState,
      steps: (prevState.steps as Step[]).filter((_, idx) => idx !== index),
    }));
  };

  const handleRatioDoneUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGoal((prevState) => {
      let updatedSteps = {
        target: (prevState.steps as Ratio).target,
        done: Number(e.target.value),
      };

      return {
        ...prevState,

        steps: updatedSteps,
      };
    });
  };

  const handleRatioTargetUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGoal((prevState) => {
      let updatedSteps = {
        done: (prevState.steps as Ratio).done,
        target: Number(e.target.value),
      };

      return {
        ...prevState,
        steps: updatedSteps,
      };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewGoal((prevState) => {
      if (name === "goalType" || name === "repetition")
        return {
          ...prevState,
          [name]: Number(value),
        };

      return {
        ...prevState,
        [name]: value,
      };
    });

    if (name === "goalType") {
      setNewGoal((prevState) => {
        const goalType = Number(value);
        let newSteps = prevState.steps;

        if (goalType === 1) newSteps = [blankStep];
        else if (goalType === 2) newSteps = { done: 0, target: 0 };
        else newSteps = "{}";

        return {
          ...prevState,
          steps: newSteps,
        };
      });
    }
  };

  return (
    <>
      <button
        className="mr-5 mt-2 border-b-2 border-neutral-400 float-right hover:text-black/70"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center">
          <FaPlus className="size-5" />
          <div className="ml-2 font-semibold">New</div>
        </div>
      </button>
      <Dialog className="relative z-10" open={open} onClose={setOpen}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative w-1/2 transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white">
                <div className="w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <div className="grid grid-rows-[auto_auto_auto_auto_auto_auto_auto_auto]">
                      <div className="col-span-full flex flex-col justify-center py-8 px-12 border-gray-200 border-b">
                        <div className="flex justify-between">
                          <div className="font-semibold">Add a new goal</div>
                          <div
                            onClick={() => setOpen(false)}
                            className="text-neutral-400 hover:text-neutral-300 cursor-pointer"
                          >
                            <MdClose className="size-6" />
                          </div>
                        </div>
                        <div className="text-gray-600">
                          Fill in details and information
                        </div>
                      </div>

                      {editItems.map((name, index) => (
                        <div
                          key={index}
                          className="mt-6 grid grid-cols-3 border-gray-200 border-b"
                        >
                          <div className="ml-12 col-span-1 font-semibold">
                            {name}
                          </div>
                          <div className="col-span-2 mb-6 text-gray-700">
                            {index === 0 ? (
                              <div className="">
                                <input
                                  type="text"
                                  name="goalName"
                                  id="goalName"
                                  autoComplete="off"
                                  placeholder="What is your goal?"
                                  value={newGoal.goalName}
                                  onChange={handleChange}
                                  className={`w-2/3 ${inputFieldClass}`}
                                />
                              </div>
                            ) : index === 1 ? (
                              <div className="">
                                <select
                                  id="category"
                                  name="category"
                                  value={newGoal.category}
                                  onChange={handleChange}
                                  className={`${inputFieldClass}`}
                                >
                                  <option key={0} value="N/A">
                                    None
                                  </option>
                                  {categories.map((category, index) => (
                                    <option key={index + 1} value={category}>
                                      {category}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : index === 2 ? (
                              <div>
                                <input
                                  type="date"
                                  name="endDate"
                                  id="endDate"
                                  value={newGoal.endDate}
                                  onChange={handleChange}
                                  className={`${inputFieldClass}`}
                                />
                              </div>
                            ) : index === 3 ? (
                              <div>
                                <select
                                  id="goalType"
                                  name="goalType"
                                  value={newGoal.goalType}
                                  onChange={handleChange}
                                  className={`${inputFieldClass}`}
                                >
                                  {goalTypes.map((type, index) => (
                                    <option key={index} value={index}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : index === 4 ? (
                              <>
                                {newGoal.goalType === 1 ? (
                                  <div className="flex flex-col gap-y-2">
                                    {(newGoal.steps as Step[]).map(
                                      (step, index) => (
                                        <Field
                                          key={index}
                                          className="flex items-center gap-x-2"
                                        >
                                          <Checkbox
                                            checked={step.done}
                                            onChange={() =>
                                              handleSubgoalUpdate(index)
                                            }
                                            className="group block size-4 rounded border bg-white data-[checked]:bg-gray-200"
                                          >
                                            <FaCheck className="fill-gray-500 size-4 opacity-0 group-data-[checked]:opacity-100" />
                                          </Checkbox>
                                          {step.done ? (
                                            <Label className="my-1 ml-1 line-through text-neutral-500">
                                              {step.name}
                                            </Label>
                                          ) : (
                                            <>
                                              <input
                                                type="text"
                                                name="steps"
                                                id="stepsSub"
                                                value={step.name}
                                                onChange={(event) =>
                                                  handleStepChange(event, index)
                                                }
                                                className="w-2/3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                              />
                                              {index > 0 && (
                                                <span
                                                  onClick={() =>
                                                    handleStepDelete(index)
                                                  }
                                                  className="ml-2 text-neutral-500 hover:text-neutral-400 cursor-pointer"
                                                >
                                                  <MdDelete className="size-5" />
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </Field>
                                      )
                                    )}
                                    <div
                                      onClick={handleNewStep}
                                      className="cursor-pointer text-neutral-500 hover:text-neutral-400"
                                    >
                                      <span className="float-left pr-1 pt-1">
                                        <FaPlus />
                                      </span>
                                      <h1 className="inline">Add a step</h1>
                                    </div>
                                  </div>
                                ) : newGoal.goalType === 2 ? (
                                  <div>
                                    <div className="flex items-center">
                                      <div className="font-semibold">
                                        Progress:{" "}
                                      </div>
                                      <input
                                        type="number"
                                        min="0"
                                        name="steps"
                                        id="stepsRatio"
                                        onChange={handleRatioDoneUpdate}
                                        className={`ml-2 ${inputFieldClass}`}
                                      />
                                    </div>
                                    <div className="mt-2 flex items-center">
                                      <div className="font-semibold">
                                        Target:{" "}
                                      </div>
                                      <input
                                        type="number"
                                        min="0"
                                        name="steps"
                                        id="stepsRatio"
                                        onChange={handleRatioTargetUpdate}
                                        className={`ml-2 ${inputFieldClass}`}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <Field className="flex items-center gap-2">
                                    <Checkbox
                                      checked={newGoal.completed === 100}
                                      onChange={() => {
                                        setNewGoal((prevState) => ({
                                          ...prevState,
                                          completed:
                                            prevState.completed === 0 ? 100 : 0,
                                        }));
                                      }}
                                      className="group block size-4 rounded border bg-white data-[checked]:bg-gray-200"
                                    >
                                      <FaCheck className="fill-gray-500 size-4 opacity-0 group-data-[checked]:opacity-100" />
                                    </Checkbox>
                                    <Label>Completed?</Label>
                                  </Field>
                                )}
                              </>
                            ) : index === 5 ? (
                              <div>
                                <textarea
                                  id="description"
                                  name="description"
                                  placeholder="Enter a description..."
                                  value={newGoal.description}
                                  onChange={handleChange}
                                  rows={3}
                                  className={`w-2/3 ${inputFieldClass}`}
                                />
                              </div>
                            ) : (
                              index === 6 && (
                                <div className="flex items-center">
                                  Repeat every
                                  <div>
                                    <input
                                      type="text"
                                      name="repetition"
                                      id="repetition"
                                      defaultValue={0}
                                      onChange={handleChange}
                                      className={`mx-2 ${inputFieldClass}`}
                                    />
                                  </div>
                                  day(s)
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className={`${"bg-green-600 hover:bg-green-500"} inline-flex w-full transition justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto`}
                  onClick={handleClickAdd}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 sm:w-auto"
                  onClick={() => {
                    setOpen(false);
                    setNewGoal(initialState);
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

export default AddGoalButton;
