import { useState } from "react";
import { Goal, Step } from "../components/GoalBox";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

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

  const goalTypes = ["Single", "Subgoals", "Number"];
  const blankStep: Step = { name: "", done: false };
  const [stepsSubgoals, setStepsSubgoals] = useState<Step[]>([blankStep]);

  const [subgoalsRatioTarget, setSubgoalsRatioTarget] = useState(0);

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [repetitionExpanded, setRepetitionExpanded] = useState(false);

  // On "Cancel" Press: reset all goal fields and states
  const handleReset = () => {
    setOpen(false);
    setNewGoal(initialState);
    setSubgoalsRatioTarget(0);
    setStepsSubgoals([blankStep]);
  };

  const handleClickAdd = () => {
    const constructedGoal: Goal = newGoal;

    // Handling "steps" param depending on goal type
    if (newGoal.goalType === 1) {
      constructedGoal.steps = JSON.stringify(stepsSubgoals);
    } else if (newGoal.goalType === 2) {
      constructedGoal.steps = `{done: 0, target: ${subgoalsRatioTarget}}`;
    }

    // Optional fields
    if (!descriptionExpanded) {
      constructedGoal.description = "";
    }

    if (!repetitionExpanded) {
      constructedGoal.repetition = 0;
    } else {
      const currDate = new Date();
      currDate.setDate(currDate.getDate() + constructedGoal.repetition);
      constructedGoal.dateOfRepetition = currDate.toISOString().slice(0, 10);
    }

    handleAddGoal(constructedGoal);
    handleReset();
  };

  const handleNewStep = () => {
    if (stepsSubgoals[stepsSubgoals.length - 1].name !== "") {
      setStepsSubgoals((prevStepsSubgoals) => [
        ...prevStepsSubgoals,
        blankStep,
      ]);
    }
  };

  const handleStepChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    setStepsSubgoals((prevStepsSubgoals) => {
      const newStepsSubgoals = [...prevStepsSubgoals];
      newStepsSubgoals[index] = {
        name: value,
        done: false,
      };
      return newStepsSubgoals;
    });
  };

  const handleRemoveStep = (index: number) => {
    setStepsSubgoals(stepsSubgoals.filter((_, idx) => idx !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "goalType" || name === "repetition")
      setNewGoal((prevState) => ({ ...prevState, [name]: Number(value) }));
    else setNewGoal((prevState) => ({ ...prevState, [name]: value }));
    console.log(newGoal);
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
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-8 pb-6 pt-6">
                <div className="flex flex-col">
                  <div className="mt-3 sm:mx-4 sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="h1"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Add a Goal
                    </DialogTitle>
                    <form>
                      <div className="space-y-12">
                        <div className="pb-8">
                          <div className="mt-8">
                            <div className="mb-6">
                              <label className="block text-sm font-medium leading-6 text-gray-900">
                                What is your goal?
                              </label>
                              <div className="mt-2 w-4/5">
                                <input
                                  type="text"
                                  name="goalName"
                                  id="goalName"
                                  value={newGoal.goalName}
                                  onChange={handleChange}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>

                            <div className="flex flex-row">
                              <div className="mb-6 mr-6">
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                  Category
                                </label>
                                <div className="mt-2 w-[200px]">
                                  <select
                                    id="category"
                                    name="category"
                                    value={newGoal.category}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                  >
                                    <option value="N/A">
                                      --Select a category--
                                    </option>
                                    {categories.map((category, index) => (
                                      <option value={category}>
                                        {category}
                                      </option>
                                    ))}
                                  </select>
                                </div>
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
                                    value={newGoal.endDate}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
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
                                  value={newGoal.goalType}
                                  onChange={handleChange}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                >
                                  {goalTypes.map((type, index) => (
                                    <option value={index}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div
                              className={`transition-all duration-1000 overflow-hidden ${
                                newGoal.goalType === 2
                                  ? "mb-6 max-h-32"
                                  : "max-h-0"
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
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) =>
                                    setSubgoalsRatioTarget(
                                      Number(e.target.value)
                                    )
                                  }
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                            </div>

                            <div
                              className={`transition-all duration-1000 overflow-hidden ${
                                newGoal.goalType === 1
                                  ? "mb-6 max-h-screen"
                                  : "max-h-0"
                              }`}
                            >
                              {stepsSubgoals.map((subgoal, index) => (
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
                                        value={stepsSubgoals[index].name}
                                        onChange={(event) =>
                                          handleStepChange(event, index)
                                        }
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
                                  value={newGoal.description}
                                  onChange={handleChange}
                                  rows={3}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                              <p className="mt-3 text-sm leading-6 text-gray-600"></p>
                            </div>

                            <div
                              onClick={() =>
                                setDescriptionExpanded(!descriptionExpanded)
                              }
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
                                  value={newGoal.repetition}
                                  onChange={handleChange}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                              <label className="mt-4 ml-2 text-sm font-medium leading-6 text-gray-900">
                                day(s)
                              </label>
                            </div>

                            <div
                              onClick={() =>
                                setRepetitionExpanded(!repetitionExpanded)
                              }
                              className="cursor-pointer text-neutral-500 hover:text-neutral-400"
                            >
                              <span className="float-left pr-1 pt-1">
                                {repetitionExpanded ? <FaMinus /> : <FaPlus />}
                              </span>
                              <h1 className="inline">Add repetition</h1>
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
                  onClick={handleReset}
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
