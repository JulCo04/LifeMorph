import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import APTitleBar from '../components/APTitleBar';

const DashboardPage: React.FC = () => {
    
    return (
        <div className='flex'>
            <Sidebar />
            <div className='w-full'>
                <APTitleBar title="Finances"/>
            </div>
            
        </div>
        
    );
};

export default DashboardPage;