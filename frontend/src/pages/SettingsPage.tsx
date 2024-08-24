import React, { useEffect, useState } from "react";
import APTitleBar from "../components/APTitleBar";
import Sidebar from "../components/Sidebar";
import { MdPassword, MdPerson } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FaCheckCircle } from "react-icons/fa";

interface Local {
  message: string;
  user: User;
}

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const [modal, setModal] = useState({ open: false, state: "" });

  // Password modal
  const initialWarningState = {
    showOld: false,
    showNew: false,
    showConfirm: false,
    messageOld: "Old password isn't valid",
    messageNew: "New password isn't valid",
    messageConfirm: "Passwords must match!",
  };

  const [warning, setWarning] = useState(initialWarningState);
  const [newPassword, setNewPassword] = useState({
    old: "",
    new: "",
    confirm: "",
  });
  const passwordRegex: RegExp[] = [/.{12,}/, /[A-Z]/, /\d/, /[@$!%*?&]/];
  const passwordRegexDesc = [
    "Have at least 12 characters",
    "Contain at least one uppercase letter",
    "Contain at least one number",
    "Contain at least one special character",
  ];

  // Username modal
  const [newUsername, setNewUsername] = useState("");
  const [warningUsername, setWarningUsername] = useState({
    show: false,
    success: false,
    message: "",
  });

  // Email modal
  const [newEmail, setNewEmail] = useState("");
  const [warningEmail, setWarningEmail] = useState({
    show: false,
    success: false,
    message: "",
  });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // PIN modal
  const [warningPIN, setWarningPIN] = useState({ show: false, message: "" });
  const [newPIN, setNewPIN] = useState("");

  // Local storage
  const [local, setLocal] = useState<Local>();

  const [userData, setUserData] = useState<User>({
    id: -1,
    username: "",
    email: "",
    password: "",
    created_at: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setLocal(JSON.parse(data));
      setUserData(JSON.parse(data).user);
    }
  }, []);

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return "http://localhost:3001/" + route;
    } else {
      return "http://localhost:3001/" + route;
    }
  }

  const handleDeleteAccount = () => {
    fetch(buildPath("api/delete-account"), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userData.id }),
    })
      .then((response) => response.json())
      .then((data) => {
        localStorage.clear();
        navigate("/", { replace: true });
      })
      .catch((error) => console.error("Error deleting account:", error));
  };

  const handleSubmitNewUsername = () => {
    if (newUsername.length < 3) {
      if (newUsername.length === 0)
        setWarningUsername({
          show: true,
          success: false,
          message: "Please enter a new username",
        });
      else
        setWarningUsername({
          show: true,
          success: false,
          message: "Username must be at least 3 characters in length",
        });

      return;
    }

    if (newUsername === userData.username) {
      setWarningUsername({
        show: true,
        success: false,
        message: "Cannot use the same username",
      });
      return;
    }

    fetch(buildPath("api/change-account-username"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userData.id, username: newUsername }),
    })
      .then((response) => response.json())
      .then((data) => {
        setWarningUsername({
          show: true,
          success: data.success,
          message: data.message,
        });

        if (data.success) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...local,
              user: { ...userData, username: newUsername },
            })
          );
          setUserData((prevState) => ({ ...prevState, username: newUsername }));
        }
      })
      .catch((error) => console.error("Error changing username:", error));
  };

  const handleSubmitNewEmail = () => {
    if (newEmail.length === 0) {
      setWarningEmail({
        show: true,
        success: false,
        message: "Please enter a new Email",
      });
      return;
    }

    if (!emailRegex.test(newEmail)) {
      setWarningEmail({
        show: true,
        success: false,
        message: "Email is not valid",
      });
      return;
    }

    if (newEmail === userData.email) {
      setWarningEmail({
        show: true,
        success: false,
        message: "Cannot use the same Email",
      });
      return;
    }

    fetch(buildPath("api/change-account-email"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userData.id, email: newEmail }),
    })
      .then((response) => response.json())
      .then((data) => {
        setWarningEmail({
          show: true,
          success: data.success,
          message: data.message,
        });

        if (data.success) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...local,
              user: { ...userData, email: newEmail },
            })
          );
          setUserData((prevState) => ({ ...prevState, email: newEmail }));
        }
      })
      .catch((error) => console.error("Error changing Email:", error));
  };

  const handleSubmitNewPassword = () => {
    setWarning(initialWarningState);

    // Empty Fields Check
    if (newPassword.old === "") {
      setWarning((prevState) => ({
        ...prevState,
        showOld: true,
        messageOld: "Please provide your current password",
      }));
      return;
    }
    if (newPassword.new === "" || newPassword.new === userData.password) {
      setWarning((prevState) => ({
        ...prevState,
        showNew: true,
        messageNew: "Please provide a new password",
      }));
      return;
    }

    // Old Password Check
    if (newPassword.old !== userData.password) {
      setWarning((prevState) => ({
        ...prevState,
        showOld: true,
        messageOld: "Old password isn't valid",
      }));
      return;
    }

    // New Password Regex Check
    passwordRegex.forEach((reg) => {
      if (!reg.test(newPassword.new)) {
        setWarning((prevState) => ({
          ...prevState,
          showNew: true,
          messageNew: "New password isn't valid",
        }));
        return;
      }
    });

    // Confirm Password Check
    if (newPassword.confirm !== newPassword.new) {
      setWarning((prevState) => ({
        ...prevState,
        showConfirm: true,
        messageConfirm: "Passwords must match!",
      }));
      return;
    }

    fetch(buildPath("api/change-account-password"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userData.id, password: newPassword.new }),
    })
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...local,
            user: { ...userData, password: newPassword.new },
          })
        );
        setUserData((prevState) => ({
          ...prevState,
          password: newPassword.new,
        }));

        // Resetting modal
        setModal((prevState) => ({ ...prevState, open: false }));
        setNewPassword({
          old: "",
          new: "",
          confirm: "",
        });
        setWarning(initialWarningState);
      })
      .catch((error) => console.error("Error changing password:", error));
  };

  const handleSubmitNewPIN = () => {
    setWarning(initialWarningState);

    // Empty Fields Check
    if (newPIN === "") {
      setWarningPIN({
        show: true,
        message: "Please provide a new PIN",
      });
      return;
    }

    fetch(buildPath("api/change-account-PIN"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userData.id, PIN: newPIN }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Resetting modal
        setModal((prevState) => ({ ...prevState, open: false }));
        setNewPIN("");
        setWarningPIN({ show: false, message: "" });
      })
      .catch((error) => console.error("Error changing PIN:", error));
  };

  const handlePasswordInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewPassword((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const [selectedTab, setSelectedTab] = useState(0);

  const accountDetails = [
    { label: "Username", data: userData.username },
    { label: "Email", data: userData.email },
    { label: "Password", data: "•".repeat(userData.password.length) },
  ];

  const tabs = [
    { name: "Account", title: "Account Details", icon: <MdPerson /> },
    { name: "PIN", title: "PIN", icon: <MdPassword /> },
  ];

  const modalContent = () => {
    return (
      <>
        {modal.state === "Username" ? (
          <>
            <div className="text-center">
              <span className="font-semibold text-xl text-center">
                Change your Username
              </span>
            </div>

            <div className="mt-2 text-center text-sm text-gray-500">
              Username must be at least 3 characters
            </div>

            <div className="mt-4">
              <span className="font-semibold text-gray-500">New Username</span>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  className={`p-2 rounded w-full outline-none border`}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setNewUsername(event.target.value)
                  }
                />
                {warningUsername.show && (
                  <>
                    <span
                      className={`${
                        warningUsername.success
                          ? "text-green-500"
                          : "text-red-500"
                      } text-sm`}
                    >
                      {warningUsername.message}
                    </span>
                    {!warningUsername.success && (
                      <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none" />
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="mt-8 flex flex-row-reverse">
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-500 inline-flex w-full transition justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                  onClick={handleSubmitNewUsername}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:ml-3 sm:mt-0 sm:w-auto"
                  onClick={() =>
                    setModal((prevState) => ({ ...prevState, open: false }))
                  }
                  data-autofocus
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : modal.state === "Email" ? (
          <>
            <div className="text-center">
              <span className="font-semibold text-xl text-center">
                Change your Email
              </span>
            </div>

            <div className="mt-4">
              <span className="font-semibold text-gray-500">New Email</span>
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  className={`p-2 rounded w-full outline-none border`}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setNewEmail(event.target.value)
                  }
                />
                {warningEmail.show && (
                  <>
                    <span
                      className={`${
                        warningEmail.success ? "text-green-500" : "text-red-500"
                      } text-sm`}
                    >
                      {warningEmail.message}
                    </span>
                    {!warningEmail.success && (
                      <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none" />
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="mt-8 flex flex-row-reverse">
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-500 inline-flex w-full transition justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                  onClick={handleSubmitNewEmail}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:ml-3 sm:mt-0 sm:w-auto"
                  onClick={() =>
                    setModal((prevState) => ({ ...prevState, open: false }))
                  }
                  data-autofocus
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : modal.state === "Password" ? (
          <>
            <div className="text-center">
              <span className="font-semibold text-xl text-center">
                Change your password
              </span>
            </div>

            <div className="mt-4">
              <span className="font-semibold text-gray-500">
                Old password
                {warning.showOld && <span className="text-red-500">*</span>}
              </span>
              <div className="relative">
                <input
                  type="password"
                  name="old"
                  className={`p-2 rounded w-full outline-none border`}
                  onChange={handlePasswordInput}
                />
                {warning.showOld && (
                  <>
                    <span className="text-red-500 text-sm">
                      {warning.messageOld}
                    </span>
                    <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none" />
                  </>
                )}
              </div>
            </div>

            <div className="mt-2">
              <span className="font-semibold text-gray-500">
                New password
                {warning.showNew && <span className="text-red-500">*</span>}
              </span>
              <div className="relative">
                <input
                  type="password"
                  name="new"
                  className={`p-2 rounded w-full outline-none border`}
                  onChange={handlePasswordInput}
                />
                {warning.showNew && (
                  <>
                    <span className="text-red-500 text-sm">
                      {warning.messageNew}
                    </span>
                    <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none" />
                  </>
                )}
              </div>
            </div>

            <div className="mt-2 mb-8">
              <span className="font-semibold text-gray-500">
                Confirm password
                {warning.showConfirm && <span className="text-red-500">*</span>}
              </span>
              <div className="relative">
                <input
                  type="password"
                  name="confirm"
                  className={`p-2 rounded w-full outline-none border`}
                  onChange={handlePasswordInput}
                />
                {warning.showConfirm && (
                  <>
                    <span className="text-red-500 text-sm">
                      {warning.messageConfirm}
                    </span>
                    <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none" />
                  </>
                )}
              </div>
            </div>

            <span className="text-gray-500">Your new password must: </span>
            <div className="mt-1 ml-4 flex flex-col gap-y-1">
              {passwordRegexDesc.map((desc, index) => (
                <div key={index} className="flex items-center">
                  <FaCheckCircle
                    className={`${
                      passwordRegex[index].test(newPassword.new)
                        ? "fill-green-500"
                        : "fill-gray-500"
                    }`}
                  />
                  <span className="ml-2 text-gray-500">{desc}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="mt-8 flex flex-row-reverse">
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-500 inline-flex w-full transition justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                  onClick={handleSubmitNewPassword}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:ml-3 sm:mt-0 sm:w-auto"
                  onClick={() =>
                    setModal((prevState) => ({ ...prevState, open: false }))
                  }
                  data-autofocus
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : (
          modal.state === "PIN" && (
            <>
              <div className="text-center">
                <span className="font-semibold text-xl text-center">
                  Change your PIN
                </span>
              </div>

              <div className="mt-4">
                <span className="font-semibold text-gray-500">New PIN</span>
                <div className="relative">
                  <input
                    type="text"
                    name="email"
                    className={`p-2 rounded w-full outline-none border`}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPIN(event.target.value)
                    }
                  />
                  {warningPIN.show && (
                    <>
                      <span className="text-red-500 text-sm">
                        {warningPIN.message}
                      </span>
                      <div className="absolute inset-0 bottom-6 border rounded border-red-500 pointer-events-none" />
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="mt-8 flex flex-row-reverse">
                  <button
                    type="button"
                    className="bg-green-600 hover:bg-green-500 inline-flex w-full transition justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                    onClick={handleSubmitNewPIN}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200 sm:ml-3 sm:mt-0 sm:w-auto"
                    onClick={() =>
                      setModal((prevState) => ({ ...prevState, open: false }))
                    }
                    data-autofocus
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </>
    );
  };

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="w-full">
          <APTitleBar title="Settings" />
          {userData.id !== -1 ? (
            <div className="flex justify-center gap-x-10">
              <div className="flex flex-col gap-y-2">
                {tabs.map((tab, index) => (
                  <div key={index} className="relative">
                    <div
                      key={index}
                      onClick={() => setSelectedTab(index)}
                      className={`${
                        selectedTab === index
                          ? "bg-gray-300"
                          : "hover:bg-gray-200"
                      } pl-4 pr-16 py-1 flex items-center gap-x-3 text-lg rounded-lg transition cursor-pointer`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </div>
                    {selectedTab === index && (
                      <span className="absolute -left-2 top-1 w-1 h-7 bg-gray-700 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
              <div className="w-[650px]">
                <div className="font-semibold text-2xl">
                  {tabs[selectedTab].title}
                </div>
                <hr className="my-4 border-slate-400" />
                {selectedTab === 0 ? (
                  <>
                    <div className="mb-4">
                      Manage your account and change details.
                    </div>
                    {accountDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="py-2.5 flex gap-x-4 items-center justify-between text-lg"
                      >
                        <div>
                          <span className="text-gray-800 underline underline-offset-4">
                            {detail.label}:
                          </span>
                          <span className="ml-4 font-semibold">
                            {detail.data}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setModal({ open: true, state: detail.label })
                          }
                          className="px-2 py-1 border border-gray-700 text-base rounded transition font-semibold hover:bg-gray-200"
                        >
                          Change {detail.label}
                        </button>
                      </div>
                    ))}
                    <div className="mt-56">
                      <div className="font-semibold text-red-500 text-2xl">
                        Delete Account
                      </div>
                      <hr className="my-4 border-slate-400" />
                      <div className="mb-4">
                        Permanantly delete your account? Once you delete your
                        account all data will be lost.
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-6 py-1 text-red-500 border border-red-500 font-semibold rounded transition hover:bg-red-500 hover:text-white"
                      >
                        Delete your account
                      </button>
                    </div>
                  </>
                ) : selectedTab === 1 ? (
                  <div>
                    <div className="mb-4">
                      Change PIN number for password manager. Forgetting this
                      PIN will lose you access to your saved passwords.
                    </div>
                    <button
                      onClick={() => setModal({ open: true, state: "PIN" })}
                      className="px-6 py-1 border border-gray-700 text-base rounded transition font-semibold hover:bg-gray-200"
                    >
                      Change PIN
                    </button>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-32 text-xl text-center font-semibold">
              You're not logged in!
            </div>
          )}
        </div>
      </div>
      <Dialog
        className="relative z-10"
        open={modal.open}
        onClose={() => setModal((prevState) => ({ ...prevState, open: false }))}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative w-1/2 max-w-xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="px-10 py-6 bg-white">{modalContent()}</div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default SettingsPage;
