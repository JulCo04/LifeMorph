import React, { useState } from "react";
import { PiButterflyDuotone } from "react-icons/pi";
import { Link } from "react-router-dom";

const ForgotPassPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [warning, setWarning] = useState({
    show: false,
    message: "Please provide an email.",
  });

  const emailRegex = new RegExp("[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$");

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return process.env.REACT_APP_PROD_API_ENVIRONMENT + '/' + route;
    } else {
      return  "http://localhost:3001/" + route;
    }
  }

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleForgotPassword = () => {
    if (email === "") {
      setWarning({ show: true, message: "Please provide an email." });
      return;
    }
    if (!emailRegex.test(email)) {
      setWarning({ show: true, message: "Email is not valid." });
      return;
    }

    fetch(buildPath("api/forgot-password"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSubmitted(true);
      })
      .catch((error) => console.error("Error sending email:", error));
  };

  const submittedEmailContent = () => {
    return (
      <>
        <div className="relative text-center">
          <span className="font-semibold text-xl text-center">Email sent</span>
        </div>

        <div className="mt-6 text-gray-500 text-wrap text-center">
          A link to reset your password has been sent to you on
          <span className="ml-1 font-semibold">{email}</span>.
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
            <div className="mt-6 text-gray-500 text-wrap text-center">
              Don’t worry, we’ve got your back! Just enter your email address
              and we’ll send you a link to reset your password.
            </div>
            {/* Email */}
            <div className="mt-6">
              <span className="font-semibold text-gray-500">
                Email
                {warning.show && <span className="text-red-500">*</span>}
              </span>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                  className={`p-2 rounded w-full outline-none border`}
                  onBlur={handleInputBlur}
                  onClick={() => {
                    if (warning.show)
                      setWarning({
                        show: false,
                        message: "Please provide an email.",
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
              onClick={handleForgotPassword}
            >
              Submit
            </button>
          </>
        ) : (
          submittedEmailContent()
        )}
      </div>

      {!submitted && (
        <div className="mt-6 flex items-center text-sm">
          Return to
          <Link to={"/login"}>
            <span className="ml-1 font-semibold text-blue-500 hover:underline">
              Sign in
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPassPage;
