import React, { useState } from 'react';
import { PiButterflyDuotone } from "react-icons/pi";
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [warnings, setWarnings] = useState({
        emailWarningMessage: '',
        passWarningMessage: '',
        showEmailWarning: false,
        showPassWarning: false,
        generalWarningMessage: '',
        showGeneralWarning: false
    });

    function buildPath(route: string) {
        if (process.env.NODE_ENV === 'production') {
            return 'http://localhost:3001/' + route;
        } else {
            return 'http://localhost:3001/' + route;
        }
    }

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));

        if (name === 'email') {
            if (value === '') {
                setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showEmailWarning: true,
                    emailWarningMessage: 'Please provide an email'
                }));
            } else {
                setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showEmailWarning: false,
                    emailWarningMessage: ''
                }));
            }

        } else if (name === 'password') {
            if (value === '') {
                    setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showPassWarning: true,
                    passWarningMessage: 'Please provide a password'
                }));
            } else {
                setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showPassWarning: false,
                    passWarningMessage: ''
                }));
            }
        }
    };

    const handleLogin = async () => {
        const { email, password } = formData;

        if (email && password) {
            try {
                const response = await fetch(buildPath('api/login'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password}),
                });
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('user', JSON.stringify(data));
                    console.log('User logged in successfully:', data);
                    navigate('/dashboard');

                } else {
                    console.error('Failed to login user');
                    setWarnings((prevWarnings) => ({
                        ...prevWarnings,
                        showGeneralWarning: true,
                        generalWarningMessage: 'Account doesn\'t exist.'
                    }));
                } 
            } catch(error: any) {
                console.error('Error registering user:', error.message);
                console.error('Failed to login');
                
            }
        } else {
            console.error('Failed to login user');
            setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showGeneralWarning: true,
                generalWarningMessage: 'Please fill out all required fields correctly.'
            }));
        }
    };

    return (
        <div className='relative flex flex-col bg-white items-center justify-center h-screen w-screen'>
            <Link to={"/"}>
                <PiButterflyDuotone className="text-9xl ml-2" />
            </Link>
            

            <div className='flex flex-col bg-white gap-5 pt-10 pb-10 pl-16 pr-16 rounded-md border-2' style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div className='relative text-center'>
                    <span className='font-bold text-3xl text-center mt-1 mb-2'>Login</span>                    
                </div>

                <div className='relative w-full flex justify-center'>
                    {warnings.showGeneralWarning && (
                        <>
                            <span className='absolute text-red-500 text-sm'>
                                {warnings.generalWarningMessage}
                            </span>
                        </>
                    )}
                </div> 
                
                {/* Email */}
                <div className='mt-5'>
                    <span className='text-lg '>Email{warnings.showEmailWarning && <span className="text-red-500">*</span>}</span>
                    <div className='relative'>
                        <input 
                            type='text' 
                            name='email'
                            className={`p-2 rounded-md w-full outline-none border-2`} 
                            placeholder='youremail@address.com' 
                            onBlur={handleInputBlur}
                        />
                        {warnings.showEmailWarning && (
                            <>
                                <span className='absolute text-red-500 text-sm top-full left-0'>
                                    {warnings.emailWarningMessage}
                                </span>
                                <div className='absolute inset-0 border-2 rounded-md border-red-500 pointer-events-none'></div>
                            </>
                        )}
                    </div>  
                </div>

                {/* Password */}
                <div className='mb-10'>
                    <span className='text-lg '>Password{warnings.showPassWarning && <span className="text-red-500">*</span>}</span>
                    <div className='relative'>
                        <input 
                            type='text' 
                            name='password'
                            className={`p-2 rounded-md w-full outline-none border-2`} 
                            placeholder='Password' 
                            onBlur={handleInputBlur}
                        />
                        {warnings.showPassWarning && (
                            <>
                                <span className='absolute text-red-500 text-sm top-full left-0'>
                                    {warnings.passWarningMessage}
                                </span>
                                <div className='absolute inset-0 border-2 rounded-md border-red-500 pointer-events-none'></div>
                            </>
                        )}
                    </div>  
                </div>

                <button type="button" className="mt-1 mb-2 text-2xl bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" 
                    onClick={handleLogin}
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default LoginPage;