import React, { useState, useEffect } from "react";
import {
  Select,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";

import GoalBox, { Goal } from "../components/GoalBox";
import AddGoalButton from "../components/AddGoalButton";
import Sidebar from "../components/Sidebar";
import APTitleBar from "../components/APTitleBar";
import { clsx } from "clsx";

const GoalTrackingPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const TabNames = ["All", "Not Started", "In Progress", "Completed"];

  const categories = [
    "--Select a category--",
    "Personal Development",
    "Health & Fitness",
    "Career",
    "Finance",
    "Education",
    "Relationship",
    "Fun & Entertainment",
    "Miscellaneous",
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  let notStarted: Goal[] = [];
  let inProgress: Goal[] = [];
  let completed: Goal[] = [];

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return "http://localhost:3001/" + route;
    } else {
      return "http://localhost:3001/" + route;
    }
  }

  useEffect(() => {
    fetch(buildPath("api/goals"))
      .then((response) => response.json())
      .then((data) => setGoals(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const compareFn = (firstGoal: Goal, secondGoal: Goal) => {
    if (firstGoal.completed === 100) return 1;
    if (secondGoal.completed === 100) return -1;

    const first = new Date(firstGoal.endDate);
    const second = new Date(secondGoal.endDate);
    const diff = first.getTime() - second.getTime();

    if (diff > 0) return 1;
    else if (diff < 0) return -1;
    return 0;
  };

  const handleSortGoals = () => {
    notStarted = [];
    completed = [];
    inProgress = [];

    goals.forEach((goal) => {
      if (goal.completed === 0) notStarted.push(goal);
      else if (goal.completed === 100) completed.push(goal);
      else inProgress.push(goal);
    });

    goals.sort(compareFn);
  };

  handleSortGoals();

  const handleAddGoal = (goal: Goal) => {
    fetch(buildPath("api/goals"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goal),
    })
      .then((response) => response.json())
      .then((data) => {
        setGoals([...goals, data.goal]); // Add the new goal to the goals state
      })
      .catch((error) => console.error("Error adding goal:", error));
  };

  const handleEditGoal = (goal: Goal) => {
    fetch(buildPath("api/goals"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goal),
    })
      .then((response) => response.json())
      .then((data) => {
        setGoals((prevState) => [
          ...prevState.filter((filterGoal) => filterGoal.id !== goal.id),
          { ...goal, steps: JSON.parse(goal.steps as string) },
        ]);
        handleSortGoals();
      })
      .catch((error) => console.error("Error updating goal:", error));
  };

  const handleDeleteGoal = (id: number) => {
    fetch(buildPath(`api/goals/${id}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setGoals(goals.filter((goal) => goal.id !== id));
      })
      .catch((error) => console.error("Error deleting goal:", error));
  };

  const handleCategoryFilter = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  const createGoalBox = (goal: Goal) => {
    return (
      <GoalBox
        key={goal.id}
        goal={goal}
        handleDeleteGoal={handleDeleteGoal}
        handleEditGoal={handleEditGoal}
      />
    );
  };

  const goalTabs: Goal[][] = [goals, notStarted, inProgress, completed];

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <APTitleBar title="Goal Tracker" />
        <div className="mx-4 p-2 sm:px-0">
          <TabGroup>
            <TabList className="flex rounded-xl bg-white p-1">
              {TabNames.map((name, index) => (
                <Tab
                  key={name}
                  className={({ selected }) =>
                    clsx(
                      "px-5 py-2.5 text-md text-nowrap font-medium leading-5 focus:outline-none border-b-2",
                      selected
                        ? "bg-white text-black border-black border-b-4"
                        : "text-neutral-400 border-neutral-400 hover:text-neutral-500 hover:border-neutral-500"
                    )
                  }
                >
                  <div className="flex items-center">
                    {name}
                    <span className="font-normal text-sm ml-2">
                      {goalTabs[index].length}
                    </span>
                  </div>
                </Tab>
              ))}
              <Tab
                disabled
                className="w-full focus:outline-none border-b-2 border-neutral-400"
              />
              <AddGoalButton handleAddGoal={handleAddGoal} />
            </TabList>
            <TabPanels className="mt-2">
              <div className="ml-6 p-10 h-full float-right border-l-2 border-neutral-400">
                statistics go here aaaaaaaaaa
              </div>
              <Select
                name="category"
                aria-label="Goal category"
                onChange={handleCategoryFilter}
              >
                {categories.map((category, index) => (
                  <option value={category}>{category}</option>
                ))}
              </Select>
              {goalTabs.map((type, index) => (
                <TabPanel key={index}>
                  <div className="grid grid-cols-4 gap-x-4">
                    {type
                      .filter(
                        (goal) =>
                          selectedCategory === categories[0] ||
                          goal.category === selectedCategory
                      )
                      .map((goal) => createGoalBox(goal))}
                  </div>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default GoalTrackingPage;
