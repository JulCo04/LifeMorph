import React, { useState } from 'react';
import APMeatballDropdown from '../components/APMeatballDropdown';
import { BsThreeDots } from "react-icons/bs";

interface APTitleBarProps {
    title: string;
}

const APTitleBar: React.FC<APTitleBarProps> = ({ title }) => {
    
    const [openDropdown, setOpenDropdown] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleDropdownToggle = () => {
        setOpenDropdown(prev => !prev);
    };

    const handleDarkModeToggle = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        
            
        <div className='p-7'>
            <div className='flex items-center'>
                <h1 className='text-2xl font-semibold'>{title}</h1>
                <div className='ml-auto self-end'>
                    <BsThreeDots className='cursor-pointer' onClick={handleDropdownToggle} />
                </div>
            </div>
            
            <hr className='mt-1' />
            
            {openDropdown && <APMeatballDropdown isDarkMode={isDarkMode} onDarkMode={handleDarkModeToggle} />}
        </div>
         
        
    );
};

export default APTitleBar;