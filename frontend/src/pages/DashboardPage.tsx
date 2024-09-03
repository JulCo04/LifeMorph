import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import APTitleBar from '../components/APTitleBar';

const DashboardPage: React.FC = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('user');
        if (data) {
            setUserData(JSON.parse(data));
        }
    }, []);

    const handleWidgetClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className='flex'>
            <Sidebar />
            <div className='w-full'>
                <APTitleBar title="Dashboard" />
                <div className='p-4 flex justify-center items-center h-5/6'>
                    <div className='w-3/6 h-5/6 grid grid-cols-2 gap-8'>
                        <div 
                            className='bg-blue-500 text-white p-8 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105'
                            onClick={() => handleWidgetClick('/finance')}
                        >
                            Finances
                        </div>
                        <div 
                            className='bg-green-500 text-white p-8 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105'
                            onClick={() => handleWidgetClick('/todo-list')}
                        >
                            Lists
                        </div>
                        <div 
                            className='bg-red-500 text-white p-8 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105'
                            onClick={() => handleWidgetClick('/contact-manager')}
                        >
                            Contact Manager
                        </div>
                        <div 
                            className='bg-purple-500 text-white p-8 rounded-lg cursor-pointer text-center transition-transform transform hover:scale-105'
                            onClick={() => handleWidgetClick('/goal-tracking')}
                        >
                            Goal Tracker
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
