import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import APTitleBar from '../components/APTitleBar';
import YearlyTracker from '../components/CashFlowTracker';
import Budget from '../components/Budget';
import FinanceVisuals from '../components/FinanceVisuals';

const FinancePage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<'Budget' | 'Cash Flow Tracker' | 'Visuals'>('Cash Flow Tracker');
    const [transitioning, setTransitioning] = useState(false);

    const handleTabChange = (tab: 'Budget' | 'Cash Flow Tracker' | 'Visuals') => {
        if (selectedTab !== tab) {
            setTransitioning(true);
            setTimeout(() => {
                setSelectedTab(tab);
                setTransitioning(false);
            }, 200);
        }
    };

    return (
        <div className='flex'>
            <Sidebar /><div className='flex-1 flex flex-col'>
                <APTitleBar title="Finances" />
                <div className='w-fit mx-auto'>
                    <div className='flex'>
                        <button
                        onClick={() => handleTabChange('Cash Flow Tracker')}
                        className={`px-4 py-2 rounded-t-lg text-black font-semibold ${selectedTab === 'Cash Flow Tracker' ? 'bg-green-300' : 'bg-gradient-to-r from-green-500 to-green-400'}`}
                        >
                        Cash Flow Tracker
                        </button>
                        <button
                        onClick={() => handleTabChange('Budget')}
                        className={`px-4 py-2 rounded-t-lg text-black font-semibold ${selectedTab === 'Budget' ? 'bg-green-300' : 'bg-gradient-to-r from-green-500 to-green-400'}`}
                        >
                        Budget
                        </button>
                        {/* <button
                        onClick={() => handleTabChange('Visuals')}
                        className={`px-4 py-2 rounded-t-lg text-black font-semibold ${selectedTab === 'Visuals' ? 'bg-green-300' : 'bg-gradient-to-r from-green-500 to-green-400'}`}
                        >
                        Visuals
                        </button> */}
                    </div>
                    <div className={`flex flex-col md:flex-row gap-8 min-w-[85vw] md:min-w-[75vw] min-h-[70vh] h-[80vh] bg-green-300 p-4 rounded-tr-lg rounded-bl-lg rounded-br-lg justify-center items-center`}>
                        <div className={`transition-opacity duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                            {/* {selectedTab === 'Visuals' && <FinanceVisuals />} */}
                            {selectedTab === 'Budget' && <Budget />}
                            {selectedTab === 'Cash Flow Tracker' && <YearlyTracker />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
