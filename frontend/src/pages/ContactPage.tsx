/*import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const ContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
    birthday: "",
    email: "",
    phoneNumber: "",
    notes: "",
    links: "",
    userId: 2, // Replace with actual user ID
    photo: null as File | null, // Add photo field
  });
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);
  const [relationshipCounts, setRelationshipCounts] = useState<
    Record<string, number>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const perPage = 12; // Number of contacts per page

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return "http://localhost:3001/" + route;
    } else {
      return "http://localhost:3001/" + route;
    }
  }

  useEffect(() => {
    fetchContacts();
    fetchUpcomingBirthdays();
  }, []);

  const fetchContacts = () => {
    fetch(buildPath("api/contacts"))
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched contacts:", data); // Debug log
        setContacts(data);
        updateRelationshipCounts(data);
      })
      .catch((error) => console.error("Error fetching contacts:", error));
  };

  const fetchUpcomingBirthdays = () => {
    fetch(buildPath("api/contacts/upcoming-birthdays"))
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched upcoming birthdays:", data); // Debug log
        setUpcomingBirthdays(data);
      })
      .catch((error) =>
        console.error("Error fetching upcoming birthdays:", error)
      );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target.files;
    if (fileInput && fileInput.length > 0) {
      setNewContact((prev) => ({ ...prev, photo: fileInput[0] }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = selectedContact
      ? buildPath(`api/contacts/${selectedContact.id}`)
      : buildPath("api/contacts");

    const method = selectedContact ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContact),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(
          selectedContact ? "Updated contact:" : "Added contact:",
          data
        ); // Debug log
        if (data.contactId || data.message === "Contact updated successfully") {
          const updatedContacts = selectedContact
            ? contacts.map((contact) =>
                contact.id === selectedContact.id
                  ? { ...newContact, id: selectedContact.id }
                  : contact
              )
            : [...contacts, { ...newContact, id: data.contactId }];

          setContacts(updatedContacts);
          updateRelationshipCounts(updatedContacts);
          setShowFormModal(false);
          setNewContact({
            firstName: "",
            lastName: "",
            relationship: "",
            birthday: "",
            email: "",
            phoneNumber: "",
            notes: "",
            links: "",
            userId: 2,
            photo: null,
          });
          setSelectedContact(null);
        } else {
          setError("Failed to save contact. Please try again.");
        }
      })
      .catch((error) => {
        console.error(
          selectedContact ? "Error updating contact:" : "Error adding contact:",
          error
        );
        setError("Failed to save contact. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCardClick = (contact: any) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const handleEditClick = () => {
    setNewContact(selectedContact);
    setShowDetailModal(false); // Close the detail view modal
    setTimeout(() => setShowFormModal(true), 0); // Open the form modal after a slight delay
  };

  const handleDeleteContact = (contactId: number) => {
    const url = buildPath(`api/contacts/${contactId}`);

    fetch(url, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        const updatedContacts = contacts.filter(
          (contact) => contact.id !== contactId
        );
        setContacts(updatedContacts);
        updateRelationshipCounts(updatedContacts);
        setShowDetailModal(false); // Close the detail view modal if open
      })
      .catch((error) => {
        console.error("Error deleting contact:", error);
        // Handle error deletion
      });
  };

  const updateRelationshipCounts = (contacts: any[]) => {
    const counts: Record<string, number> = {};
    contacts.forEach((contact) => {
      if (contact.relationship in counts) {
        counts[contact.relationship]++;
      } else {
        counts[contact.relationship] = 1;
      }
    });
    setRelationshipCounts(counts);
  };

  const totalPages = Math.ceil(contacts.length / perPage);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col p-4">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Contact Manager</h1>
          <button
            className="bg-green-500 text-white p-2 rounded"
            onClick={() => {
              setSelectedContact(null);
              setNewContact({
                firstName: "",
                lastName: "",
                relationship: "",
                birthday: "",
                email: "",
                phoneNumber: "",
                notes: "",
                links: "",
                userId: 2,
                photo: null,
              });
              setShowFormModal(true);
            }}
          >
            + New
          </button>
        </header>
        <div className="flex items-center mb-4">
          <input
            type="text"
            className="border p-2 flex-grow mr-2"
            placeholder="Type to search..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex">
          <div className="grid grid-cols-4 gap-4 flex-grow">
            {paginatedContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-gray-200 p-4 rounded shadow flex flex-col items-center h-56 w-70 cursor-pointer relative"
                onClick={() => handleCardClick(contact)}
              >
                <div className="flex-grow"></div>
                <div className="bg-gray-300 h-24 w-24 mb-4 rounded-full"></div>
                <div className="flex-grow"></div>
                <h2 className="text-lg font-bold text-center mb-2">
                  {contact.firstName} {contact.lastName}
                </h2>
                <p className="text-sm text-center">{contact.relationship}</p>
                <button
                  className="absolute top-2 right-2 text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteContact(contact.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          <div className="ml-4 space-y-4 w-64">
            <div className="bg-gray-200 p-4 rounded shadow h-56 flex items-center justify-center">
              <div>
                <h2 className="font-bold mb-2 text-center">Total Contacts</h2>
                <p className="text-3xl text-center">{contacts.length}</p>
              </div>
            </div>
            <div className="bg-gray-200 p-4 rounded shadow h-56">
              <h2 className="font-bold mb-2 text-center">Upcoming Birthdays</h2>
              <ul className="text-sm">
                {upcomingBirthdays.map((birthday) => (
                  <li key={birthday.id}>
                    {birthday.firstName} {birthday.lastName} -{" "}
                    {new Date(birthday.birthday).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-200 p-4 rounded shadow h-56">
              <h2 className="font-bold mb-2 text-center">Relationships</h2>
              <ul className="text-sm text-center">
                {Object.entries(relationshipCounts).map(
                  ([relationship, count]) => (
                    <li key={relationship}>
                      {count} {relationship}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <nav className="flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-gray-400 text-white"
                    : "bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">
                {selectedContact.firstName} {selectedContact.lastName}
              </h2>
              <button
                className="text-gray-600"
                onClick={() => setShowDetailModal(false)}
              >
                ✖️
              </button>
            </div>
            <div className="text-center mb-4">
              <div className="bg-gray-300 h-24 w-24 rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-semibold">
                {selectedContact.relationship}
              </p>
              <p className="text-sm">
                Birthday:{" "}
                {new Date(selectedContact.birthday).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="material-icons">Location</span>
                <p className="ml-2">Orlando, Florida, United States</p>
              </div>
              <div className="flex items-center">
                <span className="material-icons">email</span>
                <p className="ml-2">{selectedContact.email}</p>
              </div>
              <div className="flex items-center">
                <span className="material-icons">phone</span>
                <p className="ml-2">{selectedContact.phoneNumber}</p>
              </div>
              <div className="flex items-center">
                <span className="material-icons">link</span>
                <p className="ml-2">{selectedContact.links}</p>
              </div>
              <div className="flex items-center">
                <span className="material-icons">Notes</span>
                <p className="ml-2">{selectedContact.notes}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-400 text-white p-2 rounded"
                onClick={handleEditClick}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed top-0 left-0 z-50 w-full h-full bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">
              {selectedContact ? "Edit Contact" : "Add New Contact"}
            </h2>
            <form onSubmit={handleAddContact}>
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={newContact.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={newContact.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="relationship"
                  className="block text-sm font-medium text-gray-700"
                >
                  Relationship
                </label>
                <input
                  type="text"
                  id="relationship"
                  name="relationship"
                  value={newContact.relationship}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="birthday"
                  className="block text-sm font-medium text-gray-700"
                >
                  Birthday
                </label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={newContact.birthday}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newContact.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newContact.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notes
                </label>
                <input
                  id="notes"
                  name="notes"
                  value={newContact.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="links"
                  className="block text-sm font-medium text-gray-700"
                >
                  Links
                </label>
                <input
                  type="text"
                  id="links"
                  name="links"
                  value={newContact.links}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border p-2 w-full mb-2"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ContactPage;*/

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import APTitleBar from "../components/APTitleBar";
import { RiDeleteBack2Fill } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [userId, setUserId] = useState(-1);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
    birthday: "",
    email: "",
    phoneNumber: "",
    notes: "",
    links: "",
    userId: -1, // Replace with actual user ID
  });
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);
  const [relationshipCounts, setRelationshipCounts] = useState<
    Record<string, number>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const perPage = 12; // Number of contacts per page

  function buildPath(route: string) {
    if (process.env.NODE_ENV === "production") {
      return process.env.REACT_APP_PROD_API_ENVIRONMENT + route;
    } else {
      return  "http://localhost:3001/" + route;
    }
  }

  const navigate = useNavigate();

  useEffect(() => {
    let userId = -1;
    const data = localStorage.getItem("user");
    if (data) {
      const parsedData = JSON.parse(data);
      userId = parsedData.user.id;
      setUserId(parsedData.user.id);
    } else {
      navigate('/');
    }

    fetch(buildPath(`api/contacts/${userId}`))
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched contacts:", data); // Debug log
        setContacts(data);
        updateRelationshipCounts(data);
      })
      .catch((error) => console.error("Error fetching contacts:", error));

    fetch(buildPath(`api/contacts/upcoming-birthdays/${userId}`))
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched upcoming birthdays:", data); // Debug log
        setUpcomingBirthdays(data);
      })
      .catch((error) =>
        console.error("Error fetching upcoming birthdays:", error)
      );
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = selectedContact
      ? buildPath(`api/contacts/${selectedContact.id}`)
      : buildPath("api/contacts");

    const method = selectedContact ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContact),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(
          selectedContact ? "Updated contact:" : "Added contact:",
          data
        ); // Debug log
        if (data.contactId || data.message === "Contact updated successfully") {
          const updatedContacts = selectedContact
            ? contacts.map((contact) =>
                contact.id === selectedContact.id
                  ? { ...newContact, id: selectedContact.id }
                  : contact
              )
            : [...contacts, { ...newContact, id: data.contactId }];

          setContacts(updatedContacts);
          updateRelationshipCounts(updatedContacts);
          setShowFormModal(false);
          setNewContact({
            firstName: "",
            lastName: "",
            relationship: "",
            birthday: "",
            email: "",
            phoneNumber: "",
            notes: "",
            links: "",
            userId: userId,
          });
          setSelectedContact(null);
        } else {
          setError("Failed to save contact. Please try again.");
        }
      })
      .catch((error) => {
        console.error(
          selectedContact ? "Error updating contact:" : "Error adding contact:",
          error
        );
        setError("Failed to save contact. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCardClick = (contact: any) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const handleEditClick = () => {
    setNewContact(selectedContact);
    setShowDetailModal(false); // Close the detail view modal
    setTimeout(() => setShowFormModal(true), 0); // Open the form modal after a slight delay
  };

  const handleDeleteContact = (contactId: number) => {
    const url = buildPath(`api/contacts/${contactId}`);

    fetch(url, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        const updatedContacts = contacts.filter(
          (contact) => contact.id !== contactId
        );
        setContacts(updatedContacts);
        updateRelationshipCounts(updatedContacts);
        setShowDetailModal(false); // Close the detail view modal if open
      })
      .catch((error) => {
        console.error("Error deleting contact:", error);
        // Handle error deletion
      });
  };

  const updateRelationshipCounts = (contacts: any[]) => {
    const counts: Record<string, number> = {};
    contacts.forEach((contact) => {
      if (contact.relationship in counts) {
        counts[contact.relationship]++;
      } else {
        counts[contact.relationship] = 1;
      }
    });
    setRelationshipCounts(counts);
  };

  const totalPages = Math.ceil(contacts.length / perPage);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <APTitleBar title="Contact Manager" />
        <div className="flex-1 flex flex-col p-4">
          
          <header className="flex items-center justify-between mb-4">
            <button
              className="bg-green-500 text-white p-2 rounded"
              onClick={() => {
                setSelectedContact(null);
                setNewContact({
                  firstName: "",
                  lastName: "",
                  relationship: "",
                  birthday: "",
                  email: "",
                  phoneNumber: "",
                  notes: "",
                  links: "",
                  userId: userId,
                });
                setShowFormModal(true);
              }}
            >
              + New
            </button>
          </header>
          <div className="flex items-center mb-4">
            <input
              type="text"
              className="rounded-lg border p-2 flex-grow mr-2"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex">
          <div className="grid grid-cols-4 gap-6 flex-grow">
              {paginatedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-green-100 p-6 rounded-lg shadow-lg flex flex-col items-center h-60 w-72 cursor-pointer relative transition-transform transform hover:scale-105"
                  onClick={() => handleCardClick(contact)}
                >
                  <div className="flex-grow"></div>
                  <div className="bg-green-300 h-24 w-24 mb-4 rounded-full flex items-center justify-center text-green-600 text-4xl font-extrabold">
                    <span>{contact.firstName.charAt(0)}</span>
                  </div>
                  <div className="flex-grow"></div>
                  <h2 className="text-lg font-semibold text-center text-green-800 mb-1">
                    {contact.firstName} {contact.lastName}
                  </h2>
                  <p className="text-sm text-center text-green-600">{contact.relationship}</p>
                  <button
                    className=" text-xl absolute top-3 right-3 text-green-700 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContact(contact.id);
                    }}
                  >
                    <RiDeleteBack2Fill />
                  </button>
                </div>
              ))}
            </div>
            <div className="ml-4 space-y-4 w-64">
              <div className="bg-green-100 p-6 rounded-lg shadow-lg h-40 flex items-center justify-center">
                <div>
                  <h2 className="font-bold mb-2 text-center">Total Contacts</h2>
                  <p className="text-3xl text-center">{contacts.length}</p>
                </div>
              </div>
              <div className="bg-green-100 p-6 rounded-lg shadow-lg h-52 overflow-y-auto">
                <h2 className="font-bold mb-2 text-center">Upcoming Birthdays</h2>
                <ul className="text-sm">
                  {upcomingBirthdays.map((birthday) => (
                    <li key={birthday.id}>
                      {birthday.firstName} {birthday.lastName} -{" "}
                      {new Date(birthday.birthday).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-100 p-6 rounded-lg shadow-lg h-56 overflow-y-auto">
                <h2 className="font-bold mb-2 text-center">Relationships</h2>
                <ul className="text-sm text-center">
                  {Object.entries(relationshipCounts).map(
                    ([relationship, count]) => (
                      <li key={relationship}>
                        {count} {relationship}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <nav className="flex justify-center">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-green-400 text-white"
                      : "bg-green-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {showDetailModal && selectedContact && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h2>
                <button
                  className="text-gray-600"
                  onClick={() => setShowDetailModal(false)}
                >
                  ✖️
                </button>
              </div>
              <div className="text-center mb-4">
                <div className="bg-green-300 text-green-600 h-24 w-24 rounded-full mx-auto mb-4 flex items-center justify-center  text-4xl font-extrabold">

                  <span>{selectedContact.firstName.charAt(0)}</span>
                </div>
                <p className="text-lg font-semibold">
                  {selectedContact.relationship}
                </p>
                <p className="text-sm">
                  Birthday:{" "}
                  {new Date(selectedContact.birthday).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="material-icons">Email:</span>
                  <p className="ml-2">{selectedContact.email}</p>
                </div>
                <div className="flex items-center">
                  <span className="material-icons">Phone Number:</span>
                  <p className="ml-2">{selectedContact.phoneNumber}</p>
                </div>
                <div className="flex items-center">
                  <span className="material-icons">Link:</span>
                  <p className="ml-2">
                    {selectedContact.links ? (
                      <a
                        href={selectedContact.links}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {selectedContact.links}
                      </a>
                    ) : (
                      "No link provided"
                    )}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="material-icons">Notes:</span>
                  <p className="ml-2">{selectedContact.notes}</p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-green-400 hover:bg-green-500 text-white p-2 rounded"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {showFormModal && (
          <div className="fixed top-0 left-0 z-50 w-full h-full bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-lg w-96">
              <h2 className="text-2xl font-semibold mb-4">
                {selectedContact ? "Edit Contact" : "Add New Contact"}
              </h2>
              <form onSubmit={handleAddContact}>
                <div className="mb-4">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={newContact.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={newContact.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="relationship"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Relationship
                  </label>
                  <input
                    type="text"
                    id="relationship"
                    name="relationship"
                    value={newContact.relationship}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="birthday"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Birthday
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={newContact.birthday}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newContact.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={newContact.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>
                  <input
                    id="notes"
                    name="notes"
                    value={newContact.notes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="links"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Links
                  </label>
                  <input
                    type="text"
                    id="links"
                    name="links"
                    value={newContact.links}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-green-400 hover:bg-green-500 text-gray-800 px-4 py-2 rounded mr-2"
                    onClick={() => setShowFormModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-400 hover:bg-green-500 text-gray-800 px-4 py-2 rounded"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </form>
            </div>
          </div>
      )}
      </div>
    </div>
  );
};

export default ContactPage;