import React, { useState, useEffect } from "react";

const HomePage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return "http://localhost:3001/" + route;
    } else {
      return "http://localhost:3001/" + route;
    }
  }

  useEffect(() => {
    fetch(buildPath("api/users"))
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleAddUser = () => {
    fetch(buildPath("api/users"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers([...users, data]); // Add the new user to the users state
        setNewUser({ username: "", email: "", password: "" }); // Reset the new user state
      })
      .catch((error) => console.error("Error adding user:", error));
  };

  const handleRemoveUser = (userId: number) => {
    fetch(buildPath(`api/users/${userId}`), {
      method: "DELETE",
    })
      .then(() => {
        setUsers(users.filter((user) => user.id !== userId)); // Remove the user from the users state
      })
      .catch((error) => console.error("Error removing user:", error));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <div className="container">
      <h1>Home Page</h1>
      <div className="row">
        <div className="col-md-6">
          <h2>Add User:</h2>
          <form>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Username"
                value={newUser.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={newUser.password}
                onChange={handleChange}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddUser}
            >
              Add User
            </button>
          </form>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h2>Users:</h2>
          <ul className="list-group">
            {users.map((user) => (
              <li key={user.id} className="list-group-item">
                {user.username} - {user.email}
                <button
                  type="button"
                  className="btn btn-danger ms-2"
                  onClick={() => handleRemoveUser(user.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
