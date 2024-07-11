import { useState } from 'react';
import { IoIosSettings} from "react-icons/io";
import { RxDashboard } from "react-icons/rx";
import { PiButterflyDuotone } from "react-icons/pi";
import { FiInbox } from "react-icons/fi";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { TbTargetArrow } from "react-icons/tb";
import { VscChecklist } from "react-icons/vsc";
import { RiContactsBook2Fill, RiArrowLeftSLine} from "react-icons/ri";
import { CgLogOut } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
    
    const navigate = useNavigate();

    const [open, setOpen] = useState(true);

    const Menus = [

        { title: "Dashboard", path:"/dashboard"},
        { title: "Inbox", icon: <FiInbox />},
        { title: "Finances", spacing: true, icon: <FaMoneyBillTrendUp />, path:"/finance"},
        { title: "To-do List", icon: <VscChecklist />, path:"/todo-list"},
        { title: "Contact Manager", icon: <RiContactsBook2Fill />, path:"/contact-manager"},
        { title: "Goal Tracker", icon: <TbTargetArrow />, path:"/goal-tracking"},
        { title: "Settings", spacing: true, icon: <IoIosSettings />, path:"/settings"},
        { title: "Logout", icon: <CgLogOut />, path:"/"},
    ]

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="flex">
            <div className={`bg-slate-300 h-screen p-5 pt-8 ${open ? "w-56" : "w-20"} 
            relative
            duration-300`}>
                <RiArrowLeftSLine 
                className={`
                ${!open && "rotate-180"}
                bg-slate-500 text-3xl rounded-full text-white
                absolute -right-4 
                cursor-pointer`}
                onClick={() => setOpen(!open)}>
                </RiArrowLeftSLine>

                <Link to="/" className={`flex`}>
                    <div className='inline-flex cursor-pointer'>
                        {/* Site Logo */}
                        <PiButterflyDuotone className={`bg-transparent text-4xl
                        block float-left duration-1000 ${open && "rotate-[360deg]"} `}>
                        </PiButterflyDuotone>
                        
                        {/* Text Next to Logo */}
                        <h1 className={`text-white origin-left font-medium text-2xl
                        ml-2 duration-300 ${!open && "hidden"}`}>
                        AdultEase
                        </h1>
                    </div>
                </Link>
                

                <ul className='pt-2'>
                    {Menus.map((menu, index) => (
                        <Link to={`${menu.path}`} key={index} onClick={menu.title === "Logout" ? handleLogout : undefined}>
                            {/* Line in between each spacing */}
                            {menu.spacing && <hr className="my-4 border-slate-400mt-9"  />}
                            <li key={index} className={`text-slate-600 text-sm flex
                            items-center gap-x-4 cursor-pointer p-2 hover:bg-slate-400  
                            hover:text-slate-800 rounded-md
                            mt-2 ${menu.spacing ? "mt-9" : "mt-2"}`}>
                                {/* Menu Icon */}
                                <span className='text-2xl block float-left'>
                                    {menu.icon ? menu.icon : <RxDashboard/>}
                                </span>
                                {/* Menu Title */}
                                <span className={`text-base font-medium flex-1 truncate 
                                ${!open && "hidden"}`}>{menu.title}
                                </span>
                            </li>
                        </Link>

                    ))}
                </ul>


            </div>
            
        </div>
        
    );
};

export default Sidebar;