import { Checkbox, Field, Label } from "@headlessui/react";
import React, { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { PiButterflyDuotone } from "react-icons/pi";
import { Link, useNavigate, useLocation } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [warnings, setWarnings] = useState({
    emailWarningMessage: "",
    passWarningMessage: "",
    showEmailWarning: false,
    showPassWarning: false,
    generalWarningMessage: "",
    showGeneralWarning: false,
  });

  const [passwordHide, setPasswordHide] = useState(true);
  const [staySignedIn, setStaySignedIn] = useState(false);

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return 'https://' + process.env.REACT_APP_PROD_API_ENVIRONMENT + '/' + route;
    } else {
      return  "http://localhost:3001/" + route;
    }
  }

  const handleInputChange = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "email") {
      if (value === "") {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showEmailWarning: true,
          emailWarningMessage: "Please provide an email",
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
      } else {
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showPassWarning: false,
          passWarningMessage: "",
        }));
      }
    }
  };


  const email =  '';
  const handleCreateAccountClick = () => {
    navigate('/register', { state: {email} });
  };

  const handleContinueWithGoogle = () => {};

  /*const handleLogin = async () => {
    const { email, password } = formData;

    if (email && password) {
      try {
        const response = await fetch(buildPath("api/login"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("user", JSON.stringify(data));
          console.log("User logged in successfully:", data);
          navigate("/dashboard");
        } else {
          console.error("Failed to login user");
          setWarnings((prevWarnings) => ({
            ...prevWarnings,
            showGeneralWarning: true,
            generalWarningMessage: "Account doesn't exist.",
          }));
        }
      } catch (error: any) {
        console.error("Error registering user:", error.message);
        console.error("Failed to login");
      }
    } else {
      console.error("Failed to login user");
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showGeneralWarning: true,
        generalWarningMessage: "Please fill out all required fields correctly.",
      }));
    }
  };*/

  const handleLogin = async () => {
    const { email, password } = formData;

    if (email && password) {
      try {
        const response = await fetch(buildPath("api/login"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.message === "Logged in successfully") {
            localStorage.setItem("user", JSON.stringify(data));
            console.log("User logged in successfully:", data.user);
            navigate("/dashboard");
          } else {
            // Handle other cases such as non-verified emails
            setWarnings((prevWarnings) => ({
              ...prevWarnings,
              showGeneralWarning: true,
              generalWarningMessage: data.message,
            }));
          }
        } else {
          console.error("Failed to login user");
          setWarnings((prevWarnings) => ({
            ...prevWarnings,
            showGeneralWarning: true,
            generalWarningMessage: data.message || "Account doesn't exist.",
          }));
        }
      } catch (error: any) {
        console.error("Error logging in user:", error.message);
        setWarnings((prevWarnings) => ({
          ...prevWarnings,
          showGeneralWarning: true,
          generalWarningMessage: "An error occurred. Please try again.",
        }));
      }
    } else {
      console.error("Failed to login user");
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        showGeneralWarning: true,
        generalWarningMessage: "Please fill out all required fields correctly.",
      }));
    }
  };

  return (
    <div className="relative flex flex-col bg-white items-center h-screen w-screen">
      <Link to={"/"}>
        <PiButterflyDuotone className="mt-8 size-24" />
      </Link>

      <div className="mt-8 w-[450px] flex flex-col bg-white py-10 px-16 rounded-lg border shadow-md">
        <div className="relative text-center">
          <span className="font-semibold text-xl text-center">
            Login to LifeMorph
          </span>
        </div>

        <div className="relative w-full flex justify-center">
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
              onChange={handleInputChange}
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

        {/* Password */}
        <div className="mt-5">
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
              onChange={handleInputChange}
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

        <div className="mt-2 flex items-center justify-between">
          <Field className="flex items-center gap-x-2">
            <Checkbox
              checked={staySignedIn}
              onChange={setStaySignedIn}
              className="group block size-3.5 border border-gray-500 bg-white data-[checked]:bg-blue-600 data-[checked]:border-blue-600"
            >
              <FaCheck className="fill-white size-3 opacity-0 group-data-[checked]:opacity-100" />
            </Checkbox>
            <Label className="text-xs">Stay signed in</Label>
          </Field>

          <Link to={"/forgot-password"}>
            <span className="text-xs text-blue-500 hover:underline">
              Forgot password?
            </span>
          </Link>
        </div>

        <button
          type="button"
          className="mt-8 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
          onClick={handleLogin}
        >
          Login
        </button>

        {/* <span className="mt-6 self-center text-gray-500">or</span> */}

        {/* Sign up with Google */}
        {/* <div
          onClick={handleContinueWithGoogle}
          className="mt-6 mb-4 flex items-center justify-center px-12 py-2 rounded cursor-pointer border border-blue-500 hover:bg-gray-100"
        >
          <FcGoogle className="size-5" />
          <span className="ml-2 text-blue-500 font-semibold">
            Continue with Google
          </span>
        </div> */}
      </div>

      <div className="mt-6 flex items-center text-sm">
        New to AdultEase?
        <span
          onClick={handleCreateAccountClick}
          className="ml-2 font-semibold text-blue-500 hover:underline cursor-pointer"
        >
          Create free account
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
