import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import APTitleBar from '../components/APTitleBar';

const DashboardPage: React.FC = () => {

    return (
        <div className='flex'>
            <Sidebar />
            <APTitleBar title="Dashboard"/>
        </div>
        
    );
};

export default DashboardPage;
