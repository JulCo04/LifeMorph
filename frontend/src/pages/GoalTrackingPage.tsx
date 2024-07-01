import React, { useState, useEffect } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import GoalBox, { Goal } from "../components/GoalBox";
import GoalColumnTitle from "../components/GoalColumnTitle";
import AddGoalButton from "../components/AddGoalButton";
import { clsx } from "clsx";

const GoalTrackingPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);

  const columnTitleNames = ["Not Started", "In Progress", "Completed"];
  const columnTitleColors = ["gray", "blue", "green"];

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

  //sorting goals by completion
  goals.forEach((goal) => {
    if (goal.completed === 0) notStarted.push(goal);
    else if (goal.completed === 100) completed.push(goal);
    else inProgress.push(goal);
  });

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

  const goalColumn = (goalProgressType: Goal[], index: number) => {
    return (
      <>
        <GoalColumnTitle
          color={columnTitleColors[index]}
          title={columnTitleNames[index]}
        />
        <p className="inline ml-2">{goalProgressType.length}</p>
        {goalProgressType.map((goal, index) => (
          <GoalBox
            key={goal.id}
            id={goal.id}
            goalName={goal.goalName}
            category={goal.category}
            description={goal.description}
            endDate={dateFormatter.format(new Date(goal.endDate))}
            repetition={goal.repetition}
            dateOfRepetition=""
            goalType={goal.goalType}
            steps=""
            completed={goal.completed}
            handleDeleteGoal={handleDeleteGoal}
          />
        ))}
      </>
    );
  };

  let goalTabs: Goal[][] = [notStarted, inProgress, completed];

  return (
    <div>
      <h1 className="text-neutral-500 font-medium ml-5 text-3xl">
        Goal Tracker
      </h1>
      <div className="border-2 mx-5 my-2 border-neutral-400" />

      <div className="w-full mx-5 p-2 mt-8 sm:px-0">
        <TabGroup>
          <TabList className="flex rounded-xl bg-white p-1">
            <Tab
              key="All"
              className={({ selected }) =>
                clsx(
                  "px-5 py-2.5 text-md font-medium leading-5 focus:outline-none border-b-2",
                  selected
                    ? "bg-white text-black border-black border-b-4"
                    : "text-neutral-400 border-neutral-400 hover:text-neutral-500 hover:border-neutral-500"
                )
              }
            >
              All
            </Tab>
            {columnTitleNames.map((title) => (
              <Tab
                key={title}
                className={({ selected }) =>
                  clsx(
                    "px-5 py-2.5 text-md text-nowrap font-medium leading-5 focus:outline-none border-b-2",
                    selected
                      ? "bg-white text-black border-black border-b-4"
                      : "text-neutral-400 border-neutral-400 hover:text-neutral-500 hover:border-neutral-500"
                  )
                }
              >
                {title}
              </Tab>
            ))}
            <Tab
              disabled
              className="w-full focus:outline-none border-b-2 border-neutral-400"
            />
            <AddGoalButton handleAddGoal={handleAddGoal} />
          </TabList>
          <TabPanels className="mt-2">
            <TabPanel>
              <div className="w-2/3 flex">
                {goalTabs.map((goalType, index) => (
                  <div className="w-1/3 mx-2">
                    {goalColumn(goalType, index)}
                  </div>
                ))}
              </div>
            </TabPanel>
            {goalTabs.map((type, index) => (
              <TabPanel key={index}>
                <div className="ml-2 w-[30rem]">
                  {type.map((goal) => (
                    <GoalBox
                      key={goal.id}
                      id={goal.id}
                      goalName={goal.goalName}
                      category={goal.category}
                      description={goal.description}
                      endDate={dateFormatter.format(new Date(goal.endDate))}
                      repetition={goal.repetition}
                      dateOfRepetition=""
                      goalType={goal.goalType}
                      steps=""
                      completed={goal.completed}
                      handleDeleteGoal={handleDeleteGoal}
                    />
                  ))}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default GoalTrackingPage;
