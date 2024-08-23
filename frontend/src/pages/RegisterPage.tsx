import React, { useState } from "react";
import { Link } from "react-router-dom";

import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { PiButterflyDuotone } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { Checkbox, Field, Label } from "@headlessui/react";
import { FaCheck } from "react-icons/fa6";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [warnings, setWarnings] = useState({
    userWarningMessage: "",
    emailWarningMessage: "",
    passWarningMessage: "",
    showUserWarning: false,
    showEmailWarning: false,
    showPassWarning: false,
    generalWarningMessage: "",
    showGeneralWarning: false,
  });

  const [successMsg, setSuccessMsg] = useState(false);
  const [passwordHide, setPasswordHide] = useState(true);
  const [staySignedIn, setStaySignedIn] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{12,}$/;

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return "http://localhost:3001/" + route;
    } else {
      return "http://localhost:3001/" + route;
    }
  }

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name === "username") {
      if (value.length > 20) {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showUserWarning: true,
          userWarningMessage: "Name can't be over 20 characters",
        }));
      } else {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showUserWarning: value === "",
          userWarningMessage: value === "" ? "Please provide a username" : "",
        }));
      }
    } else if (name === "email") {
      if (value === "") {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showEmailWarning: true,
          emailWarningMessage: "Please provide an email",
        }));
      } else if (!value.match(emailRegex)) {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showEmailWarning: true,
          emailWarningMessage: "Please provide a valid email",
        }));
      } else {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showEmailWarning: false,
          emailWarningMessage: "",
        }));
      }
    } else if (name === "password") {
      if (value === "") {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showPassWarning: true,
          passWarningMessage: "Please provide a password",
        }));
      } else if (!value.match(passwordRegex)) {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showPassWarning: true,
          passWarningMessage:
            "Password must be at least 12 characters long, include at least one uppercase letter, one number, and one special character.",
        }));
      } else {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showPassWarning: false,
          passWarningMessage: "",
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
      generalWarningMessage: "",
    }));

    if (username.length > 20) {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showUserWarning: true,
        userWarningMessage: "Name can't be over 20 characters",
      }));
    } else {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showUserWarning: username === "",
        userWarningMessage: username === "" ? "Please provide a username" : "",
      }));
    }

    if (email === "") {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showEmailWarning: true,
        emailWarningMessage: "Please provide an email",
      }));
    } else if (!email.match(emailRegex)) {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showEmailWarning: true,
        emailWarningMessage: "Please provide a valid email",
      }));
    } else {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showEmailWarning: false,
        emailWarningMessage: "",
      }));
    }

    if (password === "") {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showPassWarning: true,
        passWarningMessage: "Please provide a password",
      }));
    } else if (!password.match(passwordRegex)) {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showPassWarning: true,
        passWarningMessage:
          "Password must be at least 12 characters long, include at least one uppercase letter, one number, and one special character.",
      }));
    } else {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showPassWarning: false,
        passWarningMessage: "",
      }));
    }

    if (username && email && password) {
      try {
        const response = await fetch(buildPath("api/register"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log("User registered successfully:", data);
          setSuccessMsg(true);
        } else {
          console.error("Failed to register user");
          setWarnings((prevWarnings) => ({
            ...prevWarnings,
            showGeneralWarning: true,
            generalWarningMessage: "An account with that email already exists.",
          }));
        }
      } catch (error: any) {
        console.error("Error registering user:", error.message);
        console.error("Failed creating user");
      }
    } else {
      console.error("Failed creating user");
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showGeneralWarning: true,
        generalWarningMessage: "Please fill out all required fields correctly.",
      }));
    }
  };

  const handleSignUpWithGoogle = () => {};

  return (
    <div className="relative flex flex-col bg-white items-center h-screen w-screen">
      <Link to={"/"}>
        <PiButterflyDuotone className="mt-8 size-24" />
      </Link>

      <div className="mt-8 w-[450px] flex flex-col bg-white py-10 px-16 rounded-lg border shadow-md">
        <div className="relative text-center">
          <span className="font-semibold text-xl text-center">
            Create AdultEase Account
          </span>
        </div>

        <div className="relative w-full flex justify-center">
          {successMsg && (
            <>
              <span className="absolute text-green-500 text-sm">
                Registration successful. Please check your inbox to verify your
                email.
              </span>
            </>
          )}
          {warnings.showGeneralWarning && (
            <>
              <span className="absolute text-red-500 text-sm">
                {warnings.generalWarningMessage}
              </span>
            </>
          )}
        </div>

        {/* Email */}
        <div className="mt-6">
          <span className="font-semibold text-gray-500">
            Email
            {warnings.showEmailWarning && (
              <span className="text-red-500">*</span>
            )}
          </span>
          <div className="relative">
            <input
              type="text"
              name="email"
              className={`p-2 rounded w-full outline-none border`}
              placeholder="youremail@address.com"
              onBlur={handleInputBlur}
            />
            {warnings.showEmailWarning && (
              <>
                <span className="text-red-500 text-sm">
                  {warnings.emailWarningMessage}
                </span>
                <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none"></div>
              </>
            )}
          </div>
        </div>

        {/* Username */}
        <div className="mt-4">
          <span className="mb-1 font-semibold text-gray-500">
            Username
            {warnings.showUserWarning && (
              <span className="text-red-500">*</span>
            )}
          </span>
          <div className="relative">
            <input
              type="text"
              name="username"
              className={`p-2 rounded w-full outline-none border`}
              placeholder="Username"
              onBlur={handleInputBlur}
            />
            {warnings.showUserWarning && (
              <>
                <span className="text-red-500 text-sm">
                  {warnings.userWarningMessage}
                </span>
                <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none"></div>
              </>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="mt-4">
          <span className="font-semibold text-gray-500">
            Password
            {warnings.showPassWarning && (
              <span className="text-red-500">*</span>
            )}
          </span>
          <div className="relative">
            <input
              type={passwordHide ? "password" : "text"}
              name="password"
              className={`p-2 rounded w-full outline-none border`}
              placeholder="Password"
              onBlur={handleInputBlur}
            />
            <span
              onClick={() => setPasswordHide(!passwordHide)}
              className="absolute right-2 top-[14px]"
            >
              {passwordHide ? (
                <IoMdEye className="fill-gray-700" />
              ) : (
                <IoMdEyeOff className="fill-gray-700" />
              )}
            </span>
            {warnings.showPassWarning && (
              <>
                <span className="text-red-500 text-sm">
                  {warnings.passWarningMessage}
                </span>
                <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none"></div>
              </>
            )}
          </div>
        </div>

        <Field className="mt-3 flex items-center gap-x-2">
          <Checkbox
            checked={staySignedIn}
            onChange={setStaySignedIn}
            className="group block size-3.5 border border-gray-500 bg-white data-[checked]:bg-blue-600 data-[checked]:border-blue-600"
          >
            <FaCheck className="fill-white size-3 opacity-0 group-data-[checked]:opacity-100" />
          </Checkbox>
          <Label className="text-xs">Stay signed in</Label>
        </Field>

        <button
          type="button"
          className="mt-8 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
          onClick={handleSignUp}
        >
          Sign Up
        </button>

        <span className="mt-6 self-center text-gray-500">or</span>

        {/* Sign up with Google */}
        <div
          onClick={handleSignUpWithGoogle}
          className="mt-6 mb-4 flex items-center justify-center px-12 py-2 rounded cursor-pointer border border-blue-500 hover:bg-gray-100"
        >
          <FcGoogle className="size-5" />
          <span className="ml-2 text-blue-500 font-semibold">
            Sign up with Google
          </span>
        </div>

        <div className="mt-4 self-center text-center text-sm text-gray-500 text-wrap">
          By creating an account, you agree to our
          <span className="mx-1 text-blue-500 hover:underline">terms</span>
          and sell us your soul.
        </div>
      </div>

      <div className="mt-6 flex items-center text-sm">
        Already have an account?
        <Link to={"/login"}>
          <span className="ml-2 font-semibold text-blue-500 hover:underline">
            Sign in
          </span>
        </Link>
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
