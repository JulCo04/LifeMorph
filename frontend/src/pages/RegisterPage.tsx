import React, { useState } from 'react';
import { PiButterflyDuotone } from "react-icons/pi";
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [warnings, setWarnings] = useState({
        userWarningMessage: '',
        emailWarningMessage: '',
        passWarningMessage: '',
        showUserWarning: false,
        showEmailWarning: false,
        showPassWarning: false,
        generalWarningMessage: '',
        showGeneralWarning: false
    });

    const [successMsg, setSuccessMsg] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{12,}$/;

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

        if (name === 'username') {
            if (value.length > 20) {
                setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showUserWarning: true,
                    userWarningMessage: 'Name can\'t be over 20 characters'
                }));
            } else {
                setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showUserWarning: value === '',
                    userWarningMessage: value === '' ? 'Please provide a username' : ''
                }));
            }
        } else if (name === 'email') {
            if (value === '') {
                setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showEmailWarning: true,
                    emailWarningMessage: 'Please provide an email'
                }));
            } else if (!value.match(emailRegex)) {
                setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showEmailWarning: true,
                    emailWarningMessage: 'Please provide a valid email'
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
            } else if(!value.match(passwordRegex)) {
                    setWarnings((prevWarnings) => ({
                    ...prevWarnings,
                    showPassWarning: true,
                    passWarningMessage: 'Password must be at least 12 characters long, include at least one uppercase letter, one number, and one special character.'
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

    const handleSignUp = async () => {
        const { username, email, password } = formData;

        // Reset General Warnings and messages
        setSuccessMsg(false);
        setWarnings((prevWarnings) => ({
            ...prevWarnings,
            showGeneralWarning: false,
            generalWarningMessage: ''
        }));

        if (username.length > 20) {
            setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showUserWarning: true,
                userWarningMessage: 'Name can\'t be over 20 characters'
            }));
        } else {
            setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showUserWarning: username === '',
                userWarningMessage: username === '' ? 'Please provide a username' : ''
            }));
        }

        if (email === '') {
            setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showEmailWarning: true,
                emailWarningMessage: 'Please provide an email'
            }));
        } else if (!email.match(emailRegex)) {
            setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showEmailWarning: true,
                emailWarningMessage: 'Please provide a valid email'
            }));
        } else {
            setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showEmailWarning: false,
                emailWarningMessage: ''
            }));
        }

        if (password === '') {
            setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showPassWarning: true,
                passWarningMessage: 'Please provide a password'
             }));
        } else if(!password.match(passwordRegex)) {
                setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showPassWarning: true,
                passWarningMessage: 'Password must be at least 12 characters long, include at least one uppercase letter, one number, and one special character.'
            }));
        } else {
            setWarnings((prevWarnings) => ({
                ...prevWarnings,
                showPassWarning: false,
                passWarningMessage: ''
            }));
        }

        if (username && email && password) {
            try {
                const response = await fetch(buildPath('api/register'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password}),
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('User registered successfully:', data);
                    setSuccessMsg(true);
                } else {
                    console.error('Failed to register user');
                    setWarnings((prevWarnings) => ({
                        ...prevWarnings,
                        showGeneralWarning: true,
                        generalWarningMessage: 'An account with that email already exists.'
                    }));
                } 
            } catch(error: any) {
                console.error('Error registering user:', error.message);
                console.error('Failed creating user');
                
            }
        } else {
            console.error('Failed creating user');
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
                    <span className='font-bold text-3xl text-center mt-1 mb-2'>Register</span>
                    
                </div>

                <div className='relative w-full flex justify-center'>
                    {
                        successMsg && (
                            <>
                                <span className='absolute text-green-500 text-sm'>
                                    Registration successful. Please check your inbox to verify your email.
                                </span>
                            </>
                        )
                    }
                    {warnings.showGeneralWarning && (
                        <>
                            <span className='absolute text-red-500 text-sm'>
                                {warnings.generalWarningMessage}
                            </span>
                        </>
                    )}
                </div>
                
                <span className='mt-10 text-2xl pl-2 pr-2 bg-white rounded-xl cursor-pointer border-2'>Continue with Google</span>                
                
                {/* Username */}
                <div>
                    <span className='text-lg '>Username{warnings.showUserWarning && <span className="text-red-500">*</span>}</span>
                    <div className='relative'>
                        <input 
                            type='text' 
                            name='username'
                            className={`p-2 rounded-md w-full outline-none border-2`} 
                            placeholder='Username' 
                            onBlur={handleInputBlur}
                        />
                        {warnings.showUserWarning && (
                            <>
                                <span className='absolute text-red-500 text-sm top-full left-0'>
                                    {warnings.userWarningMessage}
                                </span>
                                <div className='absolute inset-0 border-2 rounded-md border-red-500 pointer-events-none'></div>
                            </>
                        )}
                    </div>  
                </div>
                
                {/* Email */}
                <div>
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
                <div className='mb-16'>
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
                    onClick={handleSignUp}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default RegisterPage;



// All
// Empty field 

// Display Name
// Name must be under 25 characters

// Email
// Email must be in the correct format

// Password
// Password must be at least 12 characters, one uppercase letter, one number, one symbol
// Passwords must match

// Email verification
