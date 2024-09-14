import React, { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import APTitleBar from "../components/APTitleBar";
import { useNavigate } from 'react-router-dom';
import { CiLock } from "react-icons/ci";
import { BsArrowRight, BsThreeDotsVertical } from "react-icons/bs";
import { VscGlobe } from "react-icons/vsc";
import { IoMdEye, IoMdEyeOff, IoMdSearch } from "react-icons/io";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { FaPencil, FaTrash } from "react-icons/fa6";

interface Password {
  id: number;
  url: string;
  username: string;
  password: string;
  desc: string;
}

const PasswordManagerPage: React.FC = () => {
  // Page states: [-1: Not Logged In, 0: Locked, 1: Unlocked, 2: New PIN needed]
  const [pageState, setPageState] = useState(0);

  const [PIN, setPIN] = useState("");
  const [input, setInput] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [newPIN, setNewPIN] = useState("");

  const [userId, setUserId] = useState(-1);

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return 'https://' + process.env.REACT_APP_PROD_API_ENVIRONMENT + '/' + route;
    } else {
      return  "http://localhost:3001/" + route;
    }
  }

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    let id = -1;

    if (user) {
      id = JSON.parse(user).user.id;
      setUserId(id);
    } else {
      setPageState(-1);
      navigate('/');
      return;
    }

    fetch(buildPath("api/get-PIN"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.hasPIN) {
          setPIN(data.PIN);
        } else {
          setPageState(2);
        }
      })
      .catch((error) => console.error("Error fetching PIN:", error));
  }, []);

  const handleNewPIN = () => {
    fetch(buildPath("api/new-PIN"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, PIN: newPIN }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPageState(1);
      })
      .catch((error) => console.error("Error sending email:", error));
  };

  const handleChangeInput = (event: React.FocusEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };
  const handleChangeNewPIN = (event: React.FocusEvent<HTMLInputElement>) => {
    setNewPIN(event.target.value);
  };

  const handleEnterPIN = () => {
    if (input === PIN) setPageState(1);
    else setShowWarning(true);
  };

  const passwordLockPage = () => {
    return (
      <div className="w-full h-screen flex justify-center bg-neutral-100">
        <div className="my-auto pb-24 flex flex-col items-center">
          <CiLock className="size-12" />

          <span className="mt-4 text-4xl">This content is protected.</span>

          <div className="mt-4 text-gray-500">
            To view, please enter your PIN.
          </div>

          <div className="mt-12">
            <div className="relative">
              <input
                type="text"
                name="pin"
                placeholder="Enter PIN"
                className="w-80 max-w-80 border-0 shadow text-gray-600 placeholder:text-gray-400 focus:ring-0"
                onBlur={handleChangeInput}
              />
              <BsArrowRight
                onClick={handleEnterPIN}
                className="absolute size-5 fill-gray-500 right-3 top-2.5 cursor-pointer transition hover:trangreen-x-0.5"
              />
              {showWarning && (
                <div className="absolute pt-1 left-1 text-red-500 font-sm">
                  PIN is incorrect.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const newPINPage = () => {
    return (
      <div className="w-full h-screen flex justify-center">
        <div className="my-auto pb-24 flex flex-col items-center">
          <CiLock className="size-12" />

          <span className="mt-4 text-4xl">Enter a New PIN</span>

          <div className="mt-4 w-[500px] text-gray-500 text-wrap text-center">
            Please enter a PIN to keep your passwords safe. Forgetting this PIN
            will lose you access to saved passwords.
          </div>

          <div className="mt-12">
            <div className="relative">
              <input
                type="text"
                name="pin"
                placeholder="Enter New PIN"
                className="w-80 max-w-80 border-0 shadow bg-slate-50 text-gray-600 placeholder:text-gray-400 focus:ring-0"
                onBlur={handleChangeNewPIN}
              />
              <BsArrowRight
                onClick={handleNewPIN}
                className="absolute size-5 fill-gray-500 right-3 top-2.5 cursor-pointer transition hover:trangreen-x-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      {pageState === 0 ? (
        passwordLockPage()
      ) : pageState === 1 ? (
        <PasswordPage userId={userId} />
      ) : pageState === 2 ? (
        newPINPage()
      ) : (
        <div className="w-full text-center place-self-center text-3xl">
          Uh oh... you're not logged in!
        </div>
      )}
    </div>
  );
};

export default PasswordManagerPage;

interface PasswordPageProps {
  userId: number;
}

export function PasswordPage({ userId }: PasswordPageProps) {
  const [passwords, setPasswords] = useState<Password[]>([]);

  const [search, setSearch] = useState("");

  const [openAddMenu, setOpenAddMenu] = useState(false);
  const [hideAddPassword, setHideAddPassword] = useState(true);
  const [newPassword, setNewPassword] = useState({
    url: "",
    username: "",
    password: "",
    desc: "",
    userId: userId
  });
  const [isEdited, setIsEdited] = useState(false);
  const [warnings, setWarnings] = useState({ url: false, password: false });

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return "http://localhost:3001/" + route;
    } else {
      return "http://localhost:3001/" + route;
    }
  }

  useEffect(() => {
    fetch(buildPath("api/get-password-objs"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPasswords(data.passwords);
      })
      .catch((error) => console.error("Error fetching passwords:", error));
  }, []);

  const handleEditPassword = (newPassword: Password) => {
    fetch(buildPath("api/edit-password-obj"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPassword),
    })
      .then((response) => response.json())
      .then((data) => {
        for (let i = 0; i < passwords.length; i++) {
          if (newPassword.id === passwords[i].id) {
            setPasswords((prevState) => {
              const updatedPasswords = prevState;
              updatedPasswords[i] = newPassword;
              return updatedPasswords;
            });
          }
        }
      })
      .catch((error) => console.error("Error changing password:", error));
  };

  const handleDeletePassword = (passwordId: number) => {
    fetch(buildPath("api/delete-password-obj"), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passwordId: passwordId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPasswords(
          passwords.filter((password) => password.id !== passwordId)
        );
      })
      .catch((error) => console.error("Error deleting password:", error));
  };

  const handleEdit = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!isEdited) setIsEdited(true);
    const { name, value } = event.target;

    setNewPassword((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClickSave = () => {
    if (newPassword.url === "") {
      setWarnings({ url: true, password: false });
      return;
    }
    if (newPassword.password === "") {
      setWarnings({ url: false, password: true });
      return;
    }

    console.log(newPassword);

    fetch(buildPath("api/password-obj"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPassword),
    })
      .then((response) => response.json())
      .then((data) => {
        passwords.push({ id: data.passwordId, ...newPassword });
        handleClose();
      })
      .catch((error) => console.error("Error changing password:", error));
  };

  const handleClose = () => {
    setOpenAddMenu(false);
    setNewPassword({
      url: "",
      username: "",
      password: "",
      desc: "",
      userId: userId
    });
    setIsEdited(false);
    setWarnings({ url: false, password: false });
    setHideAddPassword(true);
  };

  return (
    <>
      <div className="w-full">
        <APTitleBar title="Password Manager" />
        <div>
          <div className="mb-10 relative mx-auto max-w-4xl">
            <input
              type="text"
              id="search"
              placeholder="Search passwords"
              onChange={handleSearch}
              className={`w-full rounded-full border-0 px-11 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-1 focus:ring-gray-300`}
            />
            <IoMdSearch className="size-5 fill-gray-600 absolute top-2.5 left-3 rounded-full hover:bg-gray-200" />
          </div>
          <div className="px-4 max-w-6xl mx-auto flex flex-col">
            <div className="pb-4 grid grid-cols-[1fr_1fr_1fr_80px] text-gray-500 font-semibold underline underline-offset-4">
              <div>Website</div>
              <div>Username</div>
              <div>Password</div>
              <div>
                <button
                  onClick={() => setOpenAddMenu(true)}
                  className="px-4 py-1 text-gray-700 border-2 border-green-600 rounded-full hover:bg-green-200"
                >
                  Add
                </button>
              </div>
            </div>
            {passwords.map(
              (password, index) =>
                password.url.includes(search) && (
                  <PasswordRow
                    key={index}
                    password={password}
                    handleEditPassword={handleEditPassword}
                    handleDeletePassword={handleDeletePassword}
                  />
                )
            )}
          </div>
          <div className="mt-10 text-center">
            {passwords.length} sites and apps
          </div>
        </div>
      </div>
      <Dialog
        className="relative z-10"
        open={openAddMenu}
        onClose={handleClose}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative w-1/2 max-w-xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:trangreen-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:trangreen-y-0 data-[closed]:sm:scale-95"
            >
              <div className="px-8 pb-4 pt-6 bg-white">
                <div className="text-lg">Add a password</div>
                <div className="mt-4 flex flex-col gap-y-4">
                  <div className="relative">
                    <div className="mb-1 text-gray-600 font-semibold text-sm">
                      Site
                    </div>
                    <input
                      type="text"
                      name="url"
                      id="url"
                      placeholder="example.com"
                      autoComplete="off"
                      onChange={handleEdit}
                      className={`w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300`}
                    />
                    {warnings.url && (
                      <div className="absolute inset-0 top-6 border rounded border-red-500 pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-gray-600 font-semibold text-sm">
                      Username
                    </div>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="off"
                      onChange={handleEdit}
                      className={`w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300`}
                    />
                  </div>
                  <div className="relative">
                    <div className="mb-1 text-gray-600 font-semibold text-sm">
                      Password
                    </div>
                    <input
                      type={hideAddPassword ? "password" : "text"}
                      name="password"
                      id="password"
                      autoComplete="off"
                      onChange={handleEdit}
                      className={`w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300`}
                    />
                    <span
                      onClick={() => setHideAddPassword(!hideAddPassword)}
                      className="absolute right-4 top-[34px]"
                    >
                      {hideAddPassword ? (
                        <IoMdEye className="size-5 fill-gray-600" />
                      ) : (
                        <IoMdEyeOff className="size-5 fill-gray-600" />
                      )}
                    </span>
                    {warnings.password && (
                      <div className="absolute inset-0 top-6 border rounded border-red-500 pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-gray-600 font-semibold text-sm">
                      Description
                    </div>
                    <textarea
                      id="desc"
                      name="desc"
                      placeholder="Enter a description..."
                      onChange={handleEdit}
                      rows={3}
                      className={`w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300`}
                    />
                  </div>
                </div>
                <div>
                  <div className="mt-8 flex flex-row-reverse">
                    <button
                      type="button"
                      className={`${
                        isEdited
                          ? "bg-green-600 hover:bg-green-500"
                          : "bg-gray-300 cursor-default"
                      } inline-flex w-full transition justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto`}
                      onClick={handleClickSave}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 sm:w-auto"
                      onClick={handleClose}
                      data-autofocus
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

interface PasswordRowProps {
  password: Password;
  handleEditPassword: (newPassword: Password) => void;
  handleDeletePassword: (passwordId: number) => void;
}

export function PasswordRow({
  password,
  handleEditPassword,
  handleDeletePassword,
}: PasswordRowProps) {
  const [openModal, setOpenModal] = useState(false);
  const [hide, setHide] = useState(true);
  const [hideModalPassword, setHideModalPassword] = useState(true);

  const [editPassword, setEditPassword] = useState<Password>(password);
  const [isEdited, setIsEdited] = useState(false);

  const [warnings, setWarnings] = useState({ url: false, password: false });

  const getFaviconUrl = (url: string) => {
    return `https://api.faviconkit.com/${url}/144`;
  };

  const handleEdit = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!isEdited) setIsEdited(true);
    const { name, value } = event.target;

    setEditPassword((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleClickSave = () => {
    if (editPassword.url === "") {
      setWarnings({ url: true, password: false });
      return;
    }
    if (editPassword.password === "") {
      setWarnings({ url: false, password: true });
      return;
    }

    handleEditPassword(editPassword);
    setIsEdited(false);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditPassword(password);
    setIsEdited(false);
    setWarnings({ url: false, password: false });
    setHideModalPassword(true);
  };

  return (
    <>
      <div
        onClick={() => setOpenModal(true)}
        className="py-4 border-b grid grid-cols-[1fr_1fr_1fr_80px] hover:bg-green-100"
      >
        <div className="flex items-center gap-x-3 text-ellipsis">
          {password.url.includes(".") ? (
            <img
              src={getFaviconUrl(password.url)}
              alt={password.url}
              className="w-5 h-5"
            />
          ) : (
            <VscGlobe className="w-5 h-5" />
          )}
          <div className="w-52 text-ellipsis">{password.url}</div>
        </div>

        <div className="w-52 text-ellipsis">{password.username}</div>

        <div className="w-52 text-ellipsis">
          {hide ? "•".repeat(password.password.length) : password.password}
        </div>

        <div className="flex gap-x-4">
          <span
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              setHide(!hide);
              event.stopPropagation();
            }}
          >
            {hide ? (
              <IoMdEye className="size-5 fill-gray-600 cursor-pointer hover:fill-gray-500" />
            ) : (
              <IoMdEyeOff className="size-5 fill-gray-600 cursor-pointer hover:fill-gray-500" />
            )}
          </span>
          <div
            onClick={(event: React.MouseEvent<HTMLDivElement>) =>
              event.stopPropagation()
            }
            className="h-[20px]"
          >
            <Menu>
              <MenuButton>
                <BsThreeDotsVertical className="size-5 fill-gray-600 cursor-pointer hover:fill-gray-500" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className="w-40 origin-top-right rounded-xl border border-black/5 bg-green-200 p-1 text-sm/6 text-neutral-600 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                <MenuItem>
                  <button
                    onClick={() => setOpenModal(true)}
                    className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10"
                  >
                    <FaPencil className="size-4 fill-green-700" />
                    Edit
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => handleDeletePassword(password.id)}
                    className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-black/10"
                  >
                    <FaTrash className="size-4 fill-green-700" />
                    Delete
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <Dialog className="relative z-10" open={openModal} onClose={handleClose}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative w-1/2 max-w-xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:trangreen-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:trangreen-y-0 data-[closed]:sm:scale-95"
            >
              <div className="px-8 pb-4 pt-6 bg-white">
                <div className="text-lg">Edit password</div>
                <div className="mt-4 flex flex-col gap-y-4">
                  <div className="relative">
                    <div className="mb-1 text-gray-600 font-semibold text-sm">
                      Site
                    </div>
                    <input
                      type="text"
                      name="url"
                      id="url"
                      placeholder="example.com"
                      autoComplete="off"
                      defaultValue={password.url}
                      onChange={handleEdit}
                      className={`w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300`}
                    />
                    {warnings.url && (
                      <div className="absolute inset-0 top-6 border rounded border-red-500 pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-gray-600 font-semibold text-sm">
                      Username
                    </div>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="off"
                      defaultValue={password.username}
                      onChange={handleEdit}
                      className={`w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300`}
                    />
                  </div>
                  <div className="relative">
                    <div className="mb-1 text-gray-600 font-semibold text-sm">
                      Password
                    </div>
                    <input
                      type={hideModalPassword ? "password" : "text"}
                      name="password"
                      id="password"
                      autoComplete="off"
                      defaultValue={password.password}
                      onChange={handleEdit}
                      className={`w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300`}
                    />
                    <span
                      onClick={() => setHideModalPassword(!hideModalPassword)}
                      className="absolute right-4 top-[34px]"
                    >
                      {hideModalPassword ? (
                        <IoMdEye className="size-5 fill-gray-600" />
                      ) : (
                        <IoMdEyeOff className="size-5 fill-gray-600" />
                      )}
                    </span>
                    {warnings.password && (
                      <div className="absolute inset-0 top-6 border rounded border-red-500 pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-gray-600 font-semibold text-sm">
                      Description
                    </div>
                    <textarea
                      id="desc"
                      name="desc"
                      placeholder="Enter a description..."
                      defaultValue={password.desc}
                      onChange={handleEdit}
                      rows={3}
                      className={`w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300`}
                    />
                  </div>
                </div>
                <div>
                  <div className="mt-8 flex flex-row-reverse">
                    <button
                      type="button"
                      className={`${
                        isEdited
                          ? "bg-green-600 hover:bg-green-500"
                          : "bg-gray-300 cursor-default"
                      } inline-flex w-full transition justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto`}
                      onClick={handleClickSave}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 sm:w-auto"
                      onClick={handleClose}
                      data-autofocus
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        setOpenModal(false);
                        handleDeletePassword(password.id);
                      }}
                      data-autofocus
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
