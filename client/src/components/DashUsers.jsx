import { Modal, Table, Button, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [editUser, setEditUser] = useState({});
  const [newUser, setNewUser] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/user/getusers`);
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
        setShowModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`/api/user/update/${editUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) => (user._id === editUser._id ? data : user))
        );
        setShowEditModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAddUser = async () => {
    try {
      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        // Update users state with the new user including all fields
        setUsers((prev) => [
          ...prev,
          {
            ...data.user,
            firmName: newUser.firmName,
            municipality: newUser.municipality,
            firmOwner: newUser.firmOwner,
            details: newUser.details,
            amountOfAssistance: newUser.amountOfAssistance,
          },
        ]);
        setShowAddModal(false);

        // Navigate back to the Users tab after adding a new user
        window.location.href = "/dashboard?tab=users";
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">Users</h2>
          </div>
          <div className="mb-4">
            <Button onClick={() => setShowAddModal(true)}>Add New User</Button>
          </div>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date created</Table.HeadCell>
              <Table.HeadCell>User image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Firm Name</Table.HeadCell>
              <Table.HeadCell>Municipality</Table.HeadCell>
              <Table.HeadCell>Firm Owner</Table.HeadCell>
              <Table.HeadCell>Details</Table.HeadCell>
              <Table.HeadCell>Amount Of Assistance</Table.HeadCell>
              <Table.HeadCell>Admin</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            {users.map((user) => (
              <Table.Body className="divide-y" key={user._id}>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-10 h-10 object-cover bg-gray-500 rounded-full"
                    />
                  </Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.firmName || "N/A"}</Table.Cell>
                  <Table.Cell>{user.municipality || "N/A"}</Table.Cell>
                  <Table.Cell>{user.firmOwner || "N/A"}</Table.Cell>
                  <Table.Cell>{user.details || "N/A"}</Table.Cell>
                  <Table.Cell>{user.amountOfAssistance || "N/A"}</Table.Cell>
                  <Table.Cell>
                    {user.isAdmin ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setEditUser(user);
                          setShowEditModal(true);
                        }}
                        className="font-medium text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <span
                        onClick={() => {
                          setShowModal(true);
                          setUserIdToDelete(user._id);
                        }}
                        className="font-medium text-red-500 hover:underline cursor-pointer"
                      >
                        Delete
                      </span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-teal-500 self-center text-sm py-7"
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p>You have no users yet!</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        popup
        size="md"
      >
        <Modal.Header>Edit User Information</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              id="firmName"
              label="Firm Name"
              placeholder="Enter firm name"
              value={editUser.firmName || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, firmName: e.target.value })
              }
            />
            <TextInput
              id="municipality"
              label="Municipality"
              placeholder="Enter municipality"
              value={editUser.municipality || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, municipality: e.target.value })
              }
            />
            <TextInput
              id="firmOwner"
              label="Firm Owner"
              placeholder="Enter firm owner"
              value={editUser.firmOwner || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, firmOwner: e.target.value })
              }
            />
            <TextInput
              id="details"
              label="Details"
              placeholder="Enter details"
              value={editUser.details || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, details: e.target.value })
              }
            />
            <TextInput
              id="amountOfAssistance"
              label="Amount Of Assistance"
              placeholder="Enter amount of assistance"
              value={editUser.amountOfAssistance || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, amountOfAssistance: e.target.value })
              }
            />
            <div className="flex justify-center gap-4">
              <Button onClick={handleUpdateUser}>Save Changes</Button>
              <Button color="gray" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        popup
        size="md"
      >
        <Modal.Header>Add New User</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              id="username"
              label="Username"
              placeholder="Enter username"
              value={newUser.username || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />
            <TextInput
              id="email"
              label="Email"
              placeholder="Enter email"
              value={newUser.email || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <TextInput
              id="firmName"
              label="Firm Name"
              placeholder="Enter firm name"
              value={editUser.firmName || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, firmName: e.target.value })
              }
            />
            <TextInput
              id="municipality"
              label="Municipality"
              placeholder="Enter municipality"
              value={editUser.municipality || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, municipality: e.target.value })
              }
            />
            <TextInput
              id="firmOwner"
              label="Firm Owner"
              placeholder="Enter firm owner"
              value={editUser.firmOwner || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, firmOwner: e.target.value })
              }
            />
            <TextInput
              id="details"
              label="Details"
              placeholder="Enter details"
              value={editUser.details || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, details: e.target.value })
              }
            />
            <TextInput
              id="amountOfAssistance"
              label="Amount Of Assistance"
              placeholder="Enter amount of assistance"
              value={editUser.amountOfAssistance || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, amountOfAssistance: e.target.value })
              }
            />
            <TextInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter password"
              value={newUser.password || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <div className="flex justify-center gap-4">
              <Button onClick={handleAddUser}>Add User</Button>
              <Button color="gray" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
