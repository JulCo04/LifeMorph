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
import { FaCheck, FaMinus, FaPencil, FaPlus, FaTrash } from "react-icons/fa6";

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
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

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

  const [editSubgoals, setEditSubgoals] = useState<Step[]>([blankStep]);
  const [editRatio, setEditRatio] = useState({ done: 0, target: 0 });

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [repetitionExpanded, setRepetitionExpanded] = useState(false);

  const handleSwapEditMode = () => {
    setEditMode(!editMode);

    if (editMode) {
      if (goalStates.displayedGoal.goalType === 1)
        setEditSubgoals(goalStates.displayedGoal.steps as Step[]);
      if (goalStates.displayedGoal.goalType === 2)
        setEditRatio(goalStates.displayedGoal.steps as Ratio);
    }

    if (descriptionExpanded || repetitionExpanded)
      setGoalStates((prevState) => {
        const newDescription = descriptionExpanded
          ? prevState.editedGoal.description
          : "";
        const newRepetition = repetitionExpanded
          ? prevState.editedGoal.repetition
          : 0;
        let newDateOfRep = null;

        if (newRepetition > 0) {
          const currDate = new Date();
          currDate.setDate(
            currDate.getDate() + goalStates.editedGoal.repetition
          );
          newDateOfRep = currDate.toISOString().slice(0, 10);
        }

        return {
          ...prevState,
          editedGoal: {
            ...prevState.editedGoal,
            description: newDescription,
            repetition: newRepetition,
            dateOfRepetition: newDateOfRep,
          },
        };
      });
  };

  const handleRepetition = () => {
    if (
      daysLeft > 0 &&
      goalStates.displayedGoal.repetition > 0 &&
      daysUntilRepeat <= 0
    ) {
      // Reset repeat date
      const currDate = new Date();
      currDate.setDate(currDate.getDate() + goalStates.editedGoal.repetition);
      setGoalStates((prevState) => ({
        ...prevState,
        editedGoal: {
          ...prevState.editedGoal,
          dateOfRepetition: currDate.toISOString().slice(0, 10),
          completed: 0,
        },
      }));

      // Reset steps
      // Subgoals
      if (goalStates.editedGoal.goalType === 1) {
        setGoalStates((prevState) => {
          const updatedSteps = [...(prevState.editedGoal.steps as Step[])];
          for (let i = 0; i < updatedSteps.length; i++) {
            updatedSteps[i] = {
              ...updatedSteps[i],
              done: false,
            };
          }
          return {
            ...prevState,
            editedGoal: { ...prevState.editedGoal, steps: updatedSteps },
          };
        });
      }
      // Ratio
      else if (goalStates.editedGoal.goalType === 2) {
        setGoalStates((prevState) => {
          let updatedSteps = prevState.editedGoal.steps as Ratio;
          updatedSteps = {
            ...updatedSteps,
            done: 0,
          };
          return {
            ...prevState,
            editedGoal: { ...prevState.editedGoal, steps: updatedSteps },
          };
        });
      }

      handleUpdateGoal();
    }
  };
  handleRepetition();

  const handleEdit = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "goalType" || name === "repetition")
      setGoalStates((prevState) => ({
        ...prevState,
        editedGoal: { ...prevState.editedGoal, [name]: Number(value) },
      }));
    else
      setGoalStates((prevState) => ({
        ...prevState,
        editedGoal: { ...prevState.editedGoal, [name]: value },
      }));
  };

  const handleUpdateGoal = () => {
    setGoalStates((prevState) => {
      const updatedGoalState = {
        ...prevState,
        displayedGoal: prevState.editedGoal,
      };

      const updatedGoal: Goal = {
        ...updatedGoalState.editedGoal,
        id: goal.id,
        steps: JSON.stringify(updatedGoalState.editedGoal.steps),
      };

      handleEditGoal(updatedGoal);

      return updatedGoalState;
    });
  };

  const handleClickDots = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleClickEdit = () => {
    setEditMode(false);
    handleSwapEditMode();
    setOpen(true);
  };

  const handleClickComplete = () => {
    setGoalStates((prevState) => ({
      ...prevState,
      editedGoal: { ...prevState.editedGoal, completed: 100 },
    }));

    // Subgoals
    if (goalStates.editedGoal.goalType === 1) {
      setGoalStates((prevState) => {
        const updatedSteps = [...(prevState.editedGoal.steps as Step[])];
        for (let i = 0; i < updatedSteps.length; i++) {
          updatedSteps[i] = {
            ...updatedSteps[i],
            done: true,
          };
        }
        return {
          ...prevState,
          editedGoal: { ...prevState.editedGoal, steps: updatedSteps },
        };
      });
    }
    // Ratio
    else if (goalStates.editedGoal.goalType === 2) {
      setGoalStates((prevState) => {
        let updatedSteps = prevState.editedGoal.steps as Ratio;
        updatedSteps = {
          ...updatedSteps,
          done: updatedSteps.target,
        };
        return {
          ...prevState,
          editedGoal: { ...prevState.editedGoal, steps: updatedSteps },
        };
      });
    }
  };

  const handleClickDelete = () => {
    setOpen(false);
    handleDeleteGoal(goal.id);
  };

  const handleSubgoalUpdate = (index: number) => {
    setGoalStates((prevState) => {
      const updatedSteps = [...(prevState.editedGoal.steps as Step[])];
      const bool = !updatedSteps[index].done;
      const percent = bool
        ? Math.round(100 / updatedSteps.length)
        : -Math.round(100 / updatedSteps.length);
      updatedSteps[index] = {
        ...updatedSteps[index],
        done: bool,
      };

      let numOfDone = 0;
      for (let i = 0; i < updatedSteps.length; i++)
        if (updatedSteps[i].done) numOfDone++;

      const updatedCompletion =
        numOfDone === updatedSteps.length
          ? 100
          : numOfDone === 0
          ? 0
          : prevState.editedGoal.completed + percent;

      return {
        ...prevState,
        editedGoal: {
          ...prevState.editedGoal,
          steps: updatedSteps,
          completed: updatedCompletion,
        },
      };
    });

    handleUpdateGoal();
  };

  const handleRatioUpdate = (done: number) => {
    setGoalStates((prevState) => {
      let updatedSteps = prevState.editedGoal.steps as Ratio;
      updatedSteps = {
        ...updatedSteps,
        done: done,
      };

      const updatedCompletion =
        done > updatedSteps.target
          ? 100
          : Math.round((done * 100) / updatedSteps.target);

      return {
        ...prevState,
        editedGoal: {
          ...prevState.editedGoal,
          steps: updatedSteps,
          completed: updatedCompletion,
        },
      };
    });

    handleUpdateGoal();
  };

  const handleClickSave = () => {
    const newGoalType = goalStates.editedGoal.goalType;

    if (newGoalType === 0) {
      setGoalStates((prevState) => ({
        ...prevState,
        editedGoal: { ...prevState.editedGoal, steps: "{}", completed: 0 },
      }));
    } else if (newGoalType === 1) {
      setGoalStates((prevState) => ({
        ...prevState,
        editedGoal: {
          ...prevState.editedGoal,
          steps: editSubgoals,
          completed: 0,
        },
      }));
    } else if (newGoalType === 2) {
      setGoalStates((prevState) => ({
        ...prevState,
        editedGoal: {
          ...prevState.editedGoal,
          steps: { done: 0, target: editRatio.target },
          completed: 0,
        },
      }));
    }

    handleUpdateGoal();
    setEditMode(false);
  };

  const handleStepChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    setEditSubgoals((prevState) => {
      const newEditSubgoals = [...prevState];
      newEditSubgoals[index] = {
        name: value,
        done: false,
      };
      return newEditSubgoals;
    });
  };

  const handleRemoveStep = (index: number) => {
    setEditSubgoals(editSubgoals.filter((_, idx) => idx !== index));
  };

  const handleNewStep = () => {
    if (editSubgoals[editSubgoals.length - 1].name !== "") {
      setEditSubgoals((prevState) => [...prevState, blankStep]);
    }
  };

  const editModePanel = () => {
    return (
      <>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-2xl">
            <span className="mr-3">
              <GoGoal />
            </span>
            <div className="mt-2 w-4/5">
              <input
                type="text"
                name="goalName"
                id="goalName"
                value={goalStates.editedGoal.goalName}
                onChange={handleEdit}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 w-[200px]">
          <select
            id="category"
            name="category"
            value={goalStates.editedGoal.category}
            onChange={handleEdit}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          >
            <option value="N/A">--Select a category--</option>
            {categories.map((category, index) => (
              <option value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Deadline
          </label>
          <div className="mt-2 w-[200px]">
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={goalStates.editedGoal.endDate}
              onChange={handleEdit}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Goal Type
          </label>
          <div className="mt-2">
            <select
              id="goalType"
              name="goalType"
              value={goalStates.editedGoal.goalType}
              onChange={handleEdit}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              {goalTypes.map((type, index) => (
                <option value={index}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div
          className={`overflow-hidden ${
            goalStates.editedGoal.goalType === 2 ? "mb-6 max-h-32" : "max-h-0"
          }`}
        >
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Target Value
          </label>
          <div className="mt-2">
            <input
              type="number"
              min="0"
              name="steps"
              id="stepsRatio"
              value={editRatio.target}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditRatio((prevState) => ({
                  ...prevState,
                  target: Number(e.target.value),
                }))
              }
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div
          className={`overflow-hidden ${
            goalStates.editedGoal.goalType === 1
              ? "mb-6 max-h-screen"
              : "max-h-0"
          }`}
        >
          {editSubgoals.map((subgoal, index) => (
            <>
              <div>
                <label className="block text-xs font-medium leading-6 text-gray-900">
                  Step {index + 1}: {subgoal.name}
                </label>
              </div>
              <div className="mb-2 flex flex-row items-center">
                <div className="mt-1 w-4/5">
                  <input
                    type="text"
                    name="steps"
                    id="stepsSub"
                    value={editSubgoals[index].name}
                    onChange={(event) => handleStepChange(event, index)}
                    className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                {index > 0 ? (
                  <span
                    onClick={() => handleRemoveStep(index)}
                    className="ml-2 text-neutral-500 text-xl hover:text-neutral-400 cursor-pointer"
                  >
                    <MdDelete />
                  </span>
                ) : (
                  <></>
                )}
              </div>
            </>
          ))}
          <div
            onClick={handleNewStep}
            className="mt-2 cursor-pointer text-neutral-500 hover:text-neutral-400"
          >
            <span className="float-left pr-1 pt-1">
              <FaPlus />
            </span>
            <h1 className="inline">Add a step</h1>
          </div>
        </div>

        <div
          className={`transition-all duration-1000 overflow-hidden ${
            descriptionExpanded ? "max-h-32" : "max-h-0"
          }`}
        >
          <label
            htmlFor="about"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Description
          </label>
          <div className="mt-2">
            <textarea
              id="description"
              name="description"
              value={goalStates.editedGoal.description}
              onChange={handleEdit}
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-600"></p>
        </div>

        <div
          onClick={() => setDescriptionExpanded(!descriptionExpanded)}
          className="cursor-pointer text-neutral-500 hover:text-neutral-400"
        >
          <span className="float-left pr-1 pt-1">
            {descriptionExpanded ? <FaMinus /> : <FaPlus />}
          </span>
          <h1 className="inline">Add a description</h1>
        </div>

        <div
          className={`flex flex-row transition-all duration-1000 overflow-hidden ${
            repetitionExpanded ? "max-h-32" : "max-h-0"
          }`}
        >
          <label className="mt-4 mr-2 text-sm font-medium leading-6 text-gray-900">
            Repeat every
          </label>
          <div className="mt-2 w-20">
            <input
              type="text"
              name="repetition"
              id="repetition"
              value={goalStates.editedGoal.repetition}
              onChange={handleEdit}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <label className="mt-4 ml-2 text-sm font-medium leading-6 text-gray-900">
            day(s)
          </label>
        </div>

        <div
          onClick={() => setRepetitionExpanded(!repetitionExpanded)}
          className="cursor-pointer text-neutral-500 hover:text-neutral-400"
        >
          <span className="float-left pr-1 pt-1">
            {repetitionExpanded ? <FaMinus /> : <FaPlus />}
          </span>
          <h1 className="inline">Add repetition</h1>
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
            {goalStates.displayedGoal.completed !== 100 ? (
              <>
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
            ) : (
              <></>
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
        onClick={() => setOpen(true)}
        className="relative max-w-lg min-w-fit my-2 px-5 py-4 bg-gray-100 rounded border border-gray-200 drop-shadow-[0_4px_3px_rgba(0,0,0,0.2)]"
      >
        <div className="mb-3 flex flex-row items-center justify-between">
          <div className="flex">
            <span className="mt-0.5 mr-3 text-xl">
              <GoGoal />
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
          {goalStates.displayedGoal.completed !== 100 ? threeDotsMenu() : <></>}
        </div>

        <div className="mb-4 flex gap-x-2 gap-y-1 text-sm text-slate-700 items-center flex-wrap">
          <div className="bg-slate-200 w-fit rounded-sm">
            <h2 className="py-0.5 px-3 font-semibold">
              {goalStates.displayedGoal.category}
            </h2>
          </div>
          {goalStates.displayedGoal.repetition > 0 ? (
            <div className="bg-slate-200 w-fit rounded-sm">
              <h2 className="py-0.5 px-3 font-semibold">
                Repeating in {daysUntilRepeat} days
              </h2>
            </div>
          ) : (
            <></>
          )}
          <div
            className={`py-0.5 rounded-sm flex items-center justify-center bg-slate-200`}
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
            <text className="pr-3 font-semibold">
              {goalStates.displayedGoal.completed === 0
                ? "Not started"
                : goalStates.displayedGoal.completed === 100
                ? "Completed"
                : "In progress"}
            </text>
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

        {goalStates.displayedGoal.completed !== 100 ? (
          <div className="text-sm flex justify-end">
            {daysLeft >= 0 ? (
              <div className="text-neutral-500">{daysLeft} day(s) left </div>
            ) : (
              <div className="text-red-500">
                Overdue by {Math.abs(daysLeft)} days
              </div>
            )}
          </div>
        ) : (
          <div className="h-5" />
        )}
        {goalStates.displayedGoal.completed === 100 ? (
          <div className="absolute rounded inset-0 bg-neutral-500 bg-opacity-30 z-10">
            <span className="mr-5 mt-4 float-right">{threeDotsMenu()}</span>
          </div>
        ) : (
          <></>
        )}
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
              <div className="bg-white p-6 pb-4">
                <div className="w-full">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    {!editMode ? (
                      <>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-2xl">
                            <span className="mr-3">
                              <GoGoal />
                            </span>
                            {goalStates.displayedGoal.goalName}
                          </div>
                          <div
                            onClick={() => setOpen(false)}
                            className="text-2xl text-neutral-400 hover:text-neutral-300 cursor-pointer"
                          >
                            <MdClose />
                          </div>
                        </div>

                        <div className="mt-2 text-lg text-black">
                          <div className="mb-4 bg-slate-300 w-fit text-base rounded-sm">
                            <h2 className="py-0.5 px-3 font-semibold">
                              {goalStates.displayedGoal.category}
                            </h2>
                          </div>
                          <div className="">Description:</div>
                          <div className="">
                            {goalStates.displayedGoal.description}
                          </div>
                          Deadline: {goalStates.displayedGoal.endDate}
                          <br />
                          Repetition: {goalStates.displayedGoal.repetition}
                          <br />
                          Goal Type:{" "}
                          {goalTypes[goalStates.displayedGoal.goalType]}
                          <br />
                          Progress: {goalStates.displayedGoal.completed}%<br />
                          Steps:
                          <br />
                          {goalStates.displayedGoal.goalType === 1 ? (
                            <div className="flex flex-col gap-y-2">
                              {(goalStates.displayedGoal.steps as Step[]).map(
                                (step, index) => (
                                  <Field className="text-base flex items-center gap-x-2">
                                    <Checkbox
                                      checked={step.done}
                                      onChange={() =>
                                        handleSubgoalUpdate(index)
                                      }
                                      className="group block size-4 rounded border bg-white data-[checked]:bg-slate-300"
                                    >
                                      <FaCheck className="opacity-0 group-data-[checked]:opacity-100" />
                                    </Checkbox>
                                    <Label
                                      className={
                                        step.done
                                          ? `line-through text-neutral-500`
                                          : ``
                                      }
                                    >
                                      {step.name}
                                    </Label>
                                  </Field>
                                )
                              )}
                            </div>
                          ) : goalStates.displayedGoal.goalType === 2 ? (
                            <div>
                              <div className="mt-2">
                                <input
                                  type="number"
                                  min="0"
                                  name="steps"
                                  id="stepsRatio"
                                  value={
                                    (goalStates.displayedGoal.steps as Ratio)
                                      .done
                                  }
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) =>
                                    handleRatioUpdate(Number(e.target.value))
                                  }
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                              /{" "}
                              {(goalStates.displayedGoal.steps as Ratio).target}
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </>
                    ) : (
                      editModePanel()
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                  onClick={handleClickSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 sm:w-auto"
                  onClick={() => {
                    setOpen(false);
                    setGoalStates((prevState) => ({
                      ...prevState,
                      editedGoal: prevState.displayedGoal,
                    }));
                  }}
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
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-neutral-400 px-3 py-2 text-sm font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-500 sm:mt-0 sm:w-auto"
                  onClick={handleSwapEditMode}
                  data-autofocus
                >
                  Edit
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
