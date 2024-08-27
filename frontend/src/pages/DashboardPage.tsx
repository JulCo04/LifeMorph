import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import APTitleBar from '../components/APTitleBar';

const DashboardPage: React.FC = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem('user');
        if (data) {
            setUserData(JSON.parse(data));
        }
    }, []);

    return (
        <div className='flex'>
            <Sidebar/>
            <div className='w-full'>
                <APTitleBar title="Dashboard" />
                <div className='p-4'>
                    <h2 className='text-2xl font-bold mb-4'>User Data</h2>
                    <pre className='bg-gray-100 p-4 rounded'>
                        {userData ? JSON.stringify(userData, null, 2) : 'No user data found'}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
