import React, { useState, useEffect } from 'react';
import { PiButterflyDuotone } from "react-icons/pi";
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div>
            {/* Nav Bar */}
            <div className="fixed top-0 inset-x-0 bg-white h-14 flex items-center z-10 shadow-md">
                <PiButterflyDuotone className="text-4xl ml-2" />
                <span className="text-3xl">Adult Ease</span>
                <div className="ml-auto mr-5">
                    <Link to="/login" className="text-xl hover:bg-gray-100 px-2 py-1 rounded-md">
                        Log in
                    </Link>
                </div>
            </div>
            <hr></hr>

            <div className='mt-10 flex flex-col h-screen items-center'>

                <div className=' h-max w-max m-5 p-5 text-center'>
                    <h1 className='mb-4 text-6xl font-bold'>Manage your adult life effortlessly</h1>
                    <span className='mb-4 text-3xl'>Track expenses, organize contacts, <br/> and stay on top of 
                    appointments all in one place.
                    </span>
                </div>
                <div className=' h-max w-max text-center'>
                    <span className='mb-4 text-xl'>
                    Ready to get organized? Enter your email to create your account.</span>
                    <div className='mt-3 flex gap-6 justify-center'>
                        <input type="text" id="email" className="bg-gray-50 border 
                        border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                        focus:border-blue-500 block w-80 p-2.5 outline-none" placeholder="Email Address" required />
                        <Link to="/register" type="button" className="bg-gray-50 border 
                            border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                            focus:border-blue-500 block w-fit p-2.5">Get Started
                        </Link>
                    </div>
                    <div className='mt-5'>
                        <img 
                        src="AEDash.PNG" 
                        alt="Descriptive Alt Text" 
                        className='w-fit h-96 rounded-md'
                        style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}   
                        />
                    </div>
                    <div className="butterfly"></div>
                </div>
            </div>
        </div>

    );
};

export default HomePage;



