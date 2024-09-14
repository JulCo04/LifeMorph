import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { PiButterflyDuotone } from "react-icons/pi";
import { Link, useSearchParams } from "react-router-dom";

const ResetPassPage: React.FC = () => {
  const [newPassword, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [warning, setWarning] = useState({
    show: false,
    message: "Please provide an password.",
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extract token from URL

  const passwordRegex: RegExp[] = [/.{12,}/, /[A-Z]/, /\d/, /[@$!%*?&]/];
  const passwordRegexDesc = [
    "Have at least 12 characters",
    "Contain at least one uppercase letter",
    "Contain at least one number",
    "Contain at least one special character",
  ];

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return process.env.REACT_APP_PROD_API_ENVIRONMENT + route;
    } else {
      return  "http://localhost:3001/" + route;
    }
  }

  const handlePasswordChange = (event: React.FocusEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleResetPassword = () => {
    if (newPassword === "") {
      setWarning({ show: true, message: "Please provide a password." });
      return;
    }

    // Testing password regex
    passwordRegex.forEach((reg) => {
      if (!reg.test(newPassword)) {
        setWarning({ show: true, message: "Password is not valid." });
        return;
      }
    });

    fetch(buildPath("api/reset-password"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSubmitted(true);
      })
      .catch((error) => console.error("Error resetting password:", error));
  };

  const submittedPasswordContent = () => {
    return (
      <>
        <div className="relative text-center">
          <span className="font-semibold text-xl text-center">
            Your password has been reset!
          </span>
        </div>

        <div className="mt-6 text-gray-500 text-wrap text-center">
          Sign in again with your new password.
        </div>

        <Link to={"/login"}>
          <div className="mt-8 text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
            Return to Sign in
          </div>
        </Link>
      </>
    );
  };

  return (
    <div className="relative flex flex-col bg-white items-center h-screen w-screen">
      <Link to={"/"}>
        <PiButterflyDuotone className="mt-8 size-24" />
      </Link>

      <div className="mt-8 w-[450px] flex flex-col bg-white py-10 px-16 rounded-lg border shadow-md">
        {!submitted ? (
          <>
            <div className="relative text-center">
              <span className="font-semibold text-xl text-center">
                Reset your password
              </span>
            </div>

            <span className="mt-6 text-gray-500">Your new password must: </span>
            <div className="mt-1 ml-4 flex flex-col gap-y-1">
              {passwordRegexDesc.map((desc, index) => (
                <div key={index} className="flex items-center">
                  <FaCheckCircle
                    className={`${
                      passwordRegex[index].test(newPassword)
                        ? "fill-green-500"
                        : "fill-gray-500"
                    }`}
                  />
                  <span className="ml-2 text-gray-500">{desc}</span>
                </div>
              ))}
            </div>

            {/* Password */}
            <div className="mt-6">
              <span className="font-semibold text-gray-500">
                New password
                {warning.show && <span className="text-red-500">*</span>}
              </span>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  className={`p-2 rounded w-full outline-none border`}
                  onChange={handlePasswordChange}
                  onClick={() => {
                    if (warning.show)
                      setWarning({
                        show: false,
                        message: "Please provide an password.",
                      });
                  }}
                />
                {warning.show && (
                  <>
                    <span className="absolute text-red-500 text-sm top-full left-0">
                      {warning.message}
                    </span>
                    <div className="absolute inset-0 border rounded border-red-500 pointer-events-none"></div>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              className="mt-10 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
              onClick={handleResetPassword}
            >
              Reset
            </button>
          </>
        ) : (
          submittedPasswordContent()
        )}
      </div>
    </div>
  );
};

export default ResetPassPage;
