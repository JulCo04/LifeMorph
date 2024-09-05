import { useState } from "react";
import {
  Checkbox,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Field,
  Label,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { clsx } from "clsx";

import { GoGoal } from "react-icons/go";
import { MdClose, MdDelete, MdOutlineDateRange } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaCheck, FaPencil, FaPlus, FaTrash } from "react-icons/fa6";

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
  repetition: number;
  dateOfRepetition: any;
  goalType: number;
  steps: Step[] | Ratio | string;
  completed: number;
}

interface Props {
  goal: Goal;
  handleDeleteGoal: (id: number) => void;
  handleEditGoal: (goal: Goal) => void;
}

function GoalBox({ goal, handleDeleteGoal, handleEditGoal }: Props) {
  const [open, setOpen] = useState({
    menuModal: false,
    logModal: false,
  });
  const [isEdited, setIsEdited] = useState(false);

  const initialGoalState = {
    goalName: goal.goalName,
    category: goal.category,
    description: goal.description,
    endDate: goal.endDate.slice(0, 10),
    repetition: goal.repetition,
    dateOfRepetition: goal.dateOfRepetition,
    goalType: goal.goalType,
    steps: goal.steps,
    completed: goal.completed,
  };

  const [goalStates, setGoalStates] = useState({
    displayedGoal: initialGoalState,
    editedGoal: initialGoalState,
  });

  const goalTypes = ["Single", "Subgoals", "Number"];
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
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const editItems = open.logModal
    ? ["Progress"]
    : [
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

  const currentDate = new Date();
  const deadline = new Date(
    goalStates.displayedGoal.endDate.replace(/-/g, "/")
  );

  const timeLeft = deadline.getTime() - currentDate.getTime();
  const daysLeft = Math.round(timeLeft / (1000 * 3600 * 24)) + 1;

  const daysUntilRepeat =
    goalStates.displayedGoal.repetition > 0 && daysLeft > 0
      ? Math.round(
          (new Date(goalStates.displayedGoal.dateOfRepetition).getTime() -
            currentDate.getTime()) /
            (1000 * 3600 * 24)
        ) + 1
      : 0;

  const blankStep: Step = { name: "", done: false };

  // (Executed at initialization) For repeating goals, reset progress if goal is due for repetition
  const handleRepetition = () => {
    if (
      daysLeft > 0 &&
      goalStates.displayedGoal.repetition > 0 &&
      daysUntilRepeat <= 0
    ) {
      // Reset repeat date
      const currDate = new Date();
      currDate.setDate(currDate.getDate() + goalStates.editedGoal.repetition);
      setGoalStates((prevState) => {
        let updatedSteps = prevState.editedGoal.steps;

        // Reset subgoals
        if (goalStates.editedGoal.goalType === 1) {
          updatedSteps = [...(prevState.editedGoal.steps as Step[])];
          for (let i = 0; i < updatedSteps.length; i++) {
            updatedSteps[i] = {
              ...updatedSteps[i],
              done: false,
            };
          }
        }

        // Reset ratio
        else if (goalStates.editedGoal.goalType === 2) {
          updatedSteps = prevState.editedGoal.steps as Ratio;
          updatedSteps = {
            ...updatedSteps,
            done: 0,
          };
        }

        const updatedGoal = {
          ...prevState.editedGoal,
          dateOfRepetition: currDate.toISOString().slice(0, 10),
          steps: updatedSteps,
          completed: 0,
        };

        handleEditGoal({
          ...updatedGoal,
          id: goal.id,
          steps: JSON.stringify(updatedGoal.steps),
        });

        return {
          displayedGoal: updatedGoal,
          editedGoal: updatedGoal,
        };
      });
    }
  };
  handleRepetition();

  const handleUpdateGoal = () => {
    setGoalStates((prevState) => {
      // Update completion status
      let updatedCompletion = prevState.editedGoal.completed;

      if (prevState.editedGoal.goalType === 1) {
        const subgoals = [...(prevState.editedGoal.steps as Step[])];

        let numOfDone = 0;
        for (let i = 0; i < subgoals.length; i++)
          if (subgoals[i].done) numOfDone++;

        updatedCompletion = Math.round((numOfDone * 100) / subgoals.length);
      } else if (prevState.editedGoal.goalType === 2) {
        const ratio = prevState.editedGoal.steps as Ratio;
        updatedCompletion =
          ratio.done > ratio.target
            ? 100
            : ratio.target === 0
            ? 0
            : Math.round((ratio.done * 100) / ratio.target);
      }

      // Adjust dateOfRepetition if repetition is changed
      let newDateOfRep = prevState.editedGoal.dateOfRepetition;

      if (
        goalStates.editedGoal.repetition !==
          goalStates.displayedGoal.repetition &&
        goalStates.editedGoal.repetition !== 0
      ) {
        const currDate = new Date();
        currDate.setDate(currDate.getDate() + goalStates.editedGoal.repetition);
        newDateOfRep = currDate.toISOString().slice(0, 10);
      }

      // constructed goal for API call
      const updatedGoal: Goal = {
        ...prevState.editedGoal,
        id: goal.id,
        dateOfRepetition: newDateOfRep,
        completed: updatedCompletion,
      };

      // new goalStates (displayedGoal = editedGoal)
      const updatedGoalState = {
        ...prevState,
        displayedGoal: updatedGoal,
      };

      // API call
      handleEditGoal({
        ...updatedGoal,
        steps: JSON.stringify(updatedGoal.steps),
      });

      return updatedGoalState;
    });
  };

  const handleEdit = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!isEdited) setIsEdited(true);

    const { name, value } = e.target;

    setGoalStates((prevState) => {
      if (name === "goalType" || name === "repetition")
        return {
          ...prevState,
          editedGoal: { ...prevState.editedGoal, [name]: Number(value) },
        };

      return {
        ...prevState,
        editedGoal: { ...prevState.editedGoal, [name]: value },
      };
    });

    if (name === "goalType") {
      setGoalStates((prevState) => {
        const goalType = Number(value);
        let newSteps = prevState.editedGoal.steps;

        if (goalType === 1) newSteps = [blankStep];
        else if (goalType === 2) newSteps = { done: 0, target: 0 };
        else {
          return {
            ...prevState,
            editedGoal: { ...prevState.editedGoal, steps: "{}", completed: 0 },
          };
        }

        return {
          ...prevState,
          editedGoal: { ...prevState.editedGoal, steps: newSteps },
        };
      });
    }
  };

  const handleClickDots = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleClickEdit = () => {
    setOpen((prevState) => ({ ...prevState, menuModal: true }));
  };

  const handleClickComplete = () => {
    setGoalStates((prevState) => ({
      ...prevState,
      editedGoal: { ...prevState.editedGoal, completed: 100 },
    }));

    if (goalStates.editedGoal.goalType > 0) {
      setGoalStates((prevState) => {
        let updatedSteps = prevState.editedGoal.steps;

        if (goalStates.editedGoal.goalType === 1) {
          updatedSteps = [...(prevState.editedGoal.steps as Step[])];
          for (let i = 0; i < updatedSteps.length; i++) {
            updatedSteps[i] = {
              ...updatedSteps[i],
              done: true,
            };
          }
        } else if (goalStates.editedGoal.goalType === 2) {
          updatedSteps = prevState.editedGoal.steps as Ratio;
          updatedSteps = {
            ...updatedSteps,
            done: updatedSteps.target,
          };
        }

        return {
          ...prevState,
          editedGoal: { ...prevState.editedGoal, steps: updatedSteps },
        };
      });
    }
  };

  const handleClickDelete = () => {
    setOpen((prevState) => ({ ...prevState, menuModal: false }));
    handleDeleteGoal(goal.id);
  };

  const handleSubgoalUpdate = (index: number) => {
    if (!isEdited) setIsEdited(true);
    setGoalStates((prevState) => {
      const updatedSteps = [...(prevState.editedGoal.steps as Step[])];
      const bool = !updatedSteps[index].done;

      updatedSteps[index] = {
        ...updatedSteps[index],
        done: bool,
      };

      return {
        ...prevState,
        editedGoal: {
          ...prevState.editedGoal,
          steps: updatedSteps,
        },
      };
    });
  };

  const handleRatioDoneUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdited) setIsEdited(true);
    setGoalStates((prevState) => {
      let updatedSteps = {
        target: (prevState.editedGoal.steps as Ratio).target,
        done: Number(e.target.value),
      };

      return {
        ...prevState,
        editedGoal: {
          ...prevState.editedGoal,
          steps: updatedSteps,
        },
      };
    });
  };

  const handleRatioTargetUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdited) setIsEdited(true);
    setGoalStates((prevState) => {
      let updatedSteps = {
        done: (prevState.editedGoal.steps as Ratio).done,
        target: Number(e.target.value),
      };

      return {
        ...prevState,
        editedGoal: {
          ...prevState.editedGoal,
          steps: updatedSteps,
        },
      };
    });
  };

  const handleClickSave = () => {
    if (isEdited) {
      setIsEdited(false);
      handleUpdateGoal();
    }
  };

  const handleStepChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (!isEdited) setIsEdited(true);
    const { value } = e.target;
    setGoalStates((prevState) => {
      const newSteps = [...(prevState.editedGoal.steps as Step[])];
      newSteps[index] = { name: value, done: false };

      return {
        ...prevState,
        editedGoal: { ...prevState.editedGoal, steps: newSteps },
      };
    });
  };

  const handleNewStep = () => {
    if (!isEdited) setIsEdited(true);
    const subgoals = goalStates.editedGoal.steps as Step[];
    if (subgoals[subgoals.length - 1].name !== "") {
      subgoals.push(blankStep);
      setGoalStates((prevState) => ({
        ...prevState,
        editedGoal: { ...prevState.editedGoal, steps: subgoals },
      }));
    }
  };

  const handleStepDelete = (index: number) => {
    if (!isEdited) setIsEdited(true);
    setGoalStates((prevState) => ({
      ...prevState,
      editedGoal: {
        ...prevState.editedGoal,
        steps: (prevState.editedGoal.steps as Step[]).filter(
          (_, idx) => idx !== index
        ),
      },
    }));
  };

  const editModePanel = () => {
    return (
      <>
        <div className="grid grid-rows-[auto_auto_auto_auto_auto_auto_auto_auto]">
          <div className="col-span-full flex flex-col justify-center py-8 px-12 border-gray-200 border-b">
            <div className="flex justify-between">
              <div className="font-semibold">Goal Information</div>
              <div
                onClick={() =>
                  setOpen((prevState) => ({
                    ...prevState,
                    menuModal: false,
                  }))
                }
                className="text-neutral-400 hover:text-neutral-300 cursor-pointer"
              >
                <MdClose className="size-6" />
              </div>
            </div>
            <div className="text-gray-600">Details and customization</div>
          </div>

          {editItems.map((name, index) => (
            <div
              key={index}
              className="mt-6 grid grid-cols-3 border-gray-200 border-b"
            >
              <div className="ml-12 col-span-1 font-semibold">{name}</div>
              <div className="col-span-2 mb-6 text-gray-700">
                {index === 0 && !open.logModal ? (
                  <div className="">
                    <input
                      type="text"
                      name="goalName"
                      id="goalName"
                      placeholder="What is your goal?"
                      autoComplete="off"
                      value={goalStates.editedGoal.goalName}
                      onChange={handleEdit}
                      className={`w-2/3 ${inputFieldClass}`}
                    />
                  </div>
                ) : index === 1 && !open.logModal ? (
                  <div className="">
                    <select
                      id="category"
                      name="category"
                      value={goalStates.editedGoal.category}
                      onChange={handleEdit}
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
                ) : index === 2 && !open.logModal ? (
                  <div>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={goalStates.editedGoal.endDate}
                      onChange={handleEdit}
                      className={`${inputFieldClass}`}
                    />
                  </div>
                ) : index === 3 && !open.logModal ? (
                  <div>
                    <select
                      id="goalType"
                      name="goalType"
                      value={goalStates.editedGoal.goalType}
                      onChange={handleEdit}
                      className={`${inputFieldClass}`}
                    >
                      {goalTypes.map((type, index) => (
                        <option key={index} value={index}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : index === 4 || open.logModal ? (
                  <>
                    {goalStates.editedGoal.goalType === 1 ? (
                      <div className="flex flex-col gap-y-2">
                        {(goalStates.editedGoal.steps as Step[]).map(
                          (step, index) => (
                            <Field
                              key={index}
                              className="flex items-center gap-x-2"
                            >
                              <Checkbox
                                checked={step.done}
                                onChange={() => handleSubgoalUpdate(index)}
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
                                      onClick={() => handleStepDelete(index)}
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
                    ) : goalStates.editedGoal.goalType === 2 ? (
                      <div>
                        <div className="flex items-center">
                          <div className="font-semibold">Progress: </div>
                          <input
                            type="number"
                            min="0"
                            name="steps"
                            id="stepsRatio"
                            defaultValue={
                              (goalStates.editedGoal.steps as Ratio).done
                            }
                            onChange={handleRatioDoneUpdate}
                            className={`ml-2 ${inputFieldClass}`}
                          />
                        </div>
                        <div className="mt-2 flex items-center">
                          <div className="font-semibold">Target: </div>
                          <input
                            type="number"
                            min="0"
                            name="steps"
                            id="stepsRatio"
                            defaultValue={
                              (goalStates.editedGoal.steps as Ratio).target
                            }
                            onChange={handleRatioTargetUpdate}
                            className={`ml-2 ${inputFieldClass}`}
                          />
                        </div>
                      </div>
                    ) : (
                      <Field className="flex items-center gap-2">
                        <Checkbox
                          checked={goalStates.editedGoal.completed === 100}
                          onChange={() => {
                            if (!isEdited) setIsEdited(true);
                            setGoalStates((prevState) => ({
                              ...prevState,
                              editedGoal: {
                                ...prevState.editedGoal,
                                completed:
                                  prevState.editedGoal.completed === 0
                                    ? 100
                                    : 0,
                              },
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
                ) : index === 5 && !open.logModal ? (
                  <div>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Enter a description..."
                      value={goalStates.editedGoal.description}
                      onChange={handleEdit}
                      rows={3}
                      className={`w-2/3 ${inputFieldClass}`}
                    />
                  </div>
                ) : (
                  index === 6 &&
                  !open.logModal && (
                    <div className="flex items-center">
                      Repeat every
                      <div>
                        <input
                          type="text"
                          name="repetition"
                          id="repetition"
                          value={goalStates.editedGoal.repetition}
                          onChange={handleEdit}
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
      </>
    );
  };

  const threeDotsMenu = () => {
    return (
      <div onClick={handleClickDots} className="text-lg">
        <Menu>
          <MenuButton className="font-semibold focus:outline-none data-[hover]:text-gray-700 data-[open]:text-gray-500">
            <BsThreeDotsVertical />
          </MenuButton>

          <MenuItems
            transition
            anchor="bottom end"
            className="w-40 origin-top-right rounded-xl border border-black/5 bg-slate-200 p-1 text-sm/6 text-neutral-600 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <MenuItem>
              <button
                onClick={handleClickEdit}
                className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10"
              >
                <FaPencil className="size-4 fill-slate-700" />
                Edit
              </button>
            </MenuItem>
            {goalStates.displayedGoal.completed !== 100 && (
              <>
                <MenuItem>
                  <button
                    onClick={() =>
                      setOpen((prevState) => ({
                        logModal: true,
                        menuModal: true,
                      }))
                    }
                    className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10"
                  >
                    <FaCheck className="size-4 fill-slate-700" />
                    Log Progress
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleClickComplete}
                    className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10"
                  >
                    <FaCheck className="size-4 fill-slate-700" />
                    Mark Complete
                  </button>
                </MenuItem>
              </>
            )}
            <MenuItem>
              <button
                onClick={handleClickDelete}
                className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10"
              >
                <FaTrash className="size-4 fill-slate-700" />
                Delete
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    );
  };

  return (
    <>
      <div
        onClick={() => setOpen({ logModal: false, menuModal: true })}
        className="relative cursor-pointer max-w-lg min-w-fit my-2 px-5 py-4 bg-gray-50 rounded border border-gray-200 drop-shadow-sm hover:border-gray-300 hover:shadow-gray-300 hover:shadow"
      >
        <div className="mb-3 flex flex-row items-center justify-between">
          <div className="flex">
            <span className="mt-0.5 mr-3">
              <GoGoal className="size-6" />
            </span>
            <h1
              className={clsx(
                goalStates.displayedGoal.completed === 100
                  ? "line-through text-neutral-600"
                  : "",
                "text-lg"
              )}
            >
              {goalStates.displayedGoal.goalName}
            </h1>
          </div>
          {goalStates.displayedGoal.completed !== 100 && threeDotsMenu()}
        </div>

        <div className="mb-4 flex gap-x-2 gap-y-1 text-sm text-slate-700 items-center flex-wrap">
          {goalStates.displayedGoal.category !== "" && (
            <div className="bg-green-200 w-fit rounded-sm">
              <h2 className="py-0.5 px-3 font-semibold">
                {goalStates.displayedGoal.category}
              </h2>
            </div>
          )}
          {goalStates.displayedGoal.repetition > 0 && (
            <div className="bg-green-200 w-fit rounded-sm">
              <h2 className="py-0.5 px-3 font-semibold">
                Repeating in {daysUntilRepeat} days
              </h2>
            </div>
          )}
          <div
            className={`py-0.5 rounded-sm flex items-center justify-center bg-green-200`}
          >
            <span
              className={`w-2 h-2 mr-2 ml-3 ${
                goalStates.displayedGoal.completed === 0
                  ? "bg-neutral-500"
                  : goalStates.displayedGoal.completed === 100
                  ? "bg-green-500"
                  : "bg-blue-500"
              } rounded-full`}
            />
            <div className="pr-3 font-semibold ">
              {goalStates.displayedGoal.completed === 0
                ? "Not started"
                : goalStates.displayedGoal.completed === 100
                ? "Completed"
                : "In progress"}
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-row items-center">
          <span className="mt-0.5 mr-3 text-xl">
            <MdOutlineDateRange />
          </span>
          <h2 className="underline underline-offset-8 decoration-neutral-400">
            Deadline: {months[deadline.getMonth()]} {deadline.getDate()},{" "}
            {deadline.getFullYear()}
          </h2>
        </div>

        <div className="mb-2 flex flex-row items-center ">
          <h2 className="">{goalStates.displayedGoal.completed}%</h2>
          <div className="ml-4 w-2/5 h-2.5 bg-neutral-300 rounded-xl shadow">
            <div
              className="bg-green-500 h-full rounded-xl"
              style={{ width: `${goalStates.displayedGoal.completed}%` }}
            />
          </div>
        </div>

        <div className="h-3" />

        {goalStates.displayedGoal.completed !== 100 && (
          <div className="absolute bottom-4 right-4 text-sm flex justify-end">
            {daysLeft >= 0 ? (
              <div className="text-neutral-500">{daysLeft} day(s) left </div>
            ) : (
              <div className="text-red-500">
                Overdue by {Math.abs(daysLeft)} days
              </div>
            )}
          </div>
        )}
        {goalStates.displayedGoal.completed === 100 && (
          <div className="absolute rounded inset-0 bg-neutral-500 bg-opacity-30 z-10">
            <span className="mr-5 mt-4 float-right">{threeDotsMenu()}</span>
          </div>
        )}
      </div>

      <Dialog
        className="relative z-10"
        open={open.menuModal}
        onClose={() =>
          setOpen((prevState) => ({ ...prevState, menuModal: false }))
        }
      >
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
                    {editModePanel()}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className={`${
                    isEdited
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-gray-300 cursor-default"
                  } inline-flex w-full transition justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto`}
                  onClick={handleClickSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 sm:w-auto"
                  onClick={() => {
                    setOpen((prevState) => ({
                      ...prevState,
                      menuModal: false,
                    }));
                    setIsEdited(false);
                    setGoalStates((prevState) => ({
                      ...prevState,
                      editedGoal: prevState.displayedGoal,
                    }));
                  }}
                  data-autofocus
                >
                  Cancel
                </button>
                {!open.logModal && (
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-500 sm:mt-0 sm:w-auto"
                    onClick={handleClickDelete}
                    data-autofocus
                  >
                    Delete
                  </button>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default GoalBox;
