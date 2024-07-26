interface Props {
  title: string;
  color: string;
}

const GoalColumnTitle = ({ title, color }: Props) => {
  const colors: any = {
    gray: "bg-neutral-200",
    blue: "bg-blue-200",
    green: "bg-green-200",
  };

  const circleColors: any = {
    gray: "bg-neutral-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
  };

  return (
    <div
      className={`py-0.5 rounded-full inline-flex items-center justify-center ${colors[color]}`}
    >
      <span
        className={`w-2.5 h-2.5 mr-3 ml-4 ${circleColors[color]} rounded-full`}
      />
      <text className="pr-4 font-medium">{title}</text>
    </div>
  );
};

export default GoalColumnTitle;
