import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import APTitleBar from '../components/APTitleBar';

import { TbTargetArrow } from "react-icons/tb"; // Goal Icon
import { VscChecklist } from "react-icons/vsc"; // Todo List Icon
import { FaMoneyBillTrendUp } from "react-icons/fa6"; // Finance Icon

import {
    RiContactsBook2Fill, // Contact Icon
    RiLockPasswordFill, // Password Icon
} from "react-icons/ri";

const DashboardPage: React.FC = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('user');
        if (data) {
            setUserData(JSON.parse(data));
        } else {
            navigate('/');
        }
    }, []);

    const handleWidgetClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className="flex">
            <Sidebar/>
            <div className="w-full">
                <div className='flex-1 flex flex-col'>
                    <APTitleBar title="Dashboard" />
                    <div className='flex-1 p-6'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
                            <div 
                                className='bg-green-300 text-green-600 h-56 shadow-lg p-6 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center space-y-4'
                                onClick={() => handleWidgetClick('/finance')}
                            >
                                <FaMoneyBillTrendUp size={60} />
                                <span className='text-xl font-semibold'>Finances</span>
                            </div>
                            <div 
                                className='bg-green-300 text-green-600 h-56 shadow-lg p-6 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center space-y-4'
                                onClick={() => handleWidgetClick('/todo-list')}
                            >
                                <VscChecklist size={60} />
                                <span className='text-xl font-semibold'>To-Do List</span>
                            </div>
                            <div 
                                className='bg-green-300 text-green-600 h-56 shadow-lg p-6 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center space-y-4'
                                onClick={() => handleWidgetClick('/contact-manager')}
                            >
                                <RiContactsBook2Fill size={60} />
                                <span className='text-xl font-semibold'>Contact Manager</span>
                            </div>
                            <div 
                                className='bg-green-300 text-green-600 h-56 shadow-lg p-6 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center space-y-4'
                                onClick={() => handleWidgetClick('/goal-tracking')}
                            >
                                <TbTargetArrow size={60} />
                                <span className='text-xl font-semibold'>Goal Tracker</span>
                            </div>
                            <div 
                                className='bg-green-300 text-green-600 h-56 shadow-lg p-6 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center space-y-4'
                                onClick={() => handleWidgetClick('/password-manager')}
                            >
                                <RiLockPasswordFill size={60} />
                                <span className='text-xl font-semibold'>Passwords</span>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
