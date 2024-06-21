import { FaFont } from "react-icons/fa";
import Switch from "./Switch";
import { useState } from "react";

interface APMeatballDropdownProps {
    isDarkMode: boolean;
    onDarkMode: () => void;
}

const APMeatballDropdown: React.FC<APMeatballDropdownProps> = ({ isDarkMode, onDarkMode }) => {

    const handleDarkModeToggle = () => {
        onDarkMode();
    };

    return (
        <div className='flex flex-col'>
            <ul className='flex flex-col gap-3 dropDownMeatball'>
                <span className="text-sm">Font Sizes</span>
                <div className="flex gap-2 justify-center items-end">
                    <FaFont className="border cursor-pointer p-1 text-2xl"/>
                    <FaFont className="border cursor-pointer p-1 text-3xl"/>
                    <FaFont className="border cursor-pointer p-1 text-4xl"/>
                </div>
                <hr />
                
                <li>
                    {/* Dark Mode Switch */}
                    <div className="p-2 flex gap-8 items-end">
                        
                        <span className="text-sm">Dark Mode</span>
                        <Switch isToggled={isDarkMode} onToggle={handleDarkModeToggle} />
                        
                    </div>
                    
                </li>
                
            </ul>
        </div>
    );
};

export default APMeatballDropdown;
