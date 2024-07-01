interface Props {
  title: string;
  color: string;
}

const GoalColumnTitle = ({ title, color }: Props) => {
  const colors: any = {
    gray: "bg-neutral-300",
    blue: "bg-[#2681B4]/30",
    green: "bg-[#168321]/30",
  };

  const circleColors: any = {
    gray: "bg-neutral-400",
    blue: "bg-[#2681B4]/60",
    green: "bg-[#168321]/60",
  };

  return (
    <div
      className={`py-0.5 rounded-full inline-flex items-center justify-center ${colors[color]} `}
    >
      <span
        className={`w-2.5 h-2.5 mr-3 ml-4 ${circleColors[color]} rounded-full`}
      />
      <text className="pr-4 font-medium">{title}</text>
    </div>
  );
};

export default GoalColumnTitle;
