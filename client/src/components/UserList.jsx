import { Modal, Table, Button, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [editUser, setEditUser] = useState({});
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    const now = new Date();
    const options = { month: "long", year: "numeric" };
    setCurrentMonth(now.toLocaleDateString("en-US", options));
  }, []);

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
      // Update the user's details
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

        // If user update is successful, record the monthly refund
        const refundPayment = editUser.refunds?.refundPayment || 0;
        const arrears = editUser.refunds?.arrears || 0;
        await handleRecordMonthlyRefund(editUser._id, refundPayment, arrears);

        setShowEditModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleRefundPaymentChange = (e) => {
    const refundPayment = parseFloat(e.target.value) || 0;
    const amountOfAssistance = parseFloat(editUser.amountOfAssistance) || 0;

    const monthlyDue = parseFloat((amountOfAssistance / 36).toFixed(2));
    const totalRefundPayment = parseFloat(refundPayment.toFixed(2));
    const refundRate = parseFloat(
      ((totalRefundPayment / amountOfAssistance) * 100).toFixed(2)
    );
    const arrears = parseFloat((monthlyDue - refundPayment).toFixed(2));

    setEditUser((prevUser) => ({
      ...prevUser,
      refunds: {
        ...prevUser.refunds,
        refundPayment,
        totalRefundPayment,
        refundRate,
        monthlyDue,
        arrears,
        refundStatus: refundRate >= 100 ? "Paid in Full" : "Ongoing",
      },
    }));
  };

  const handleRecordMonthlyRefund = async (userId, refundPayment, arrears) => {
    try {
      const res = await fetch(`/api/user/recordMonthlyRefund/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refundPayment, arrears }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Monthly refund recorded successfully:", data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">Monitor Refund</h2>
            <span className="text-xl font-medium">{currentMonth}</span>
          </div>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Firm Name</Table.HeadCell>
              <Table.HeadCell>Refund Status</Table.HeadCell>
              <Table.HeadCell>Refund Rate</Table.HeadCell>
              <Table.HeadCell>Payment Date</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            {users.map((user) => (
              <Table.Body className="divide-y" key={user._id}>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{user.firmName || "N/A"}</Table.Cell>
                  <Table.Cell>{user.refunds?.refundStatus || "N/A"}</Table.Cell>
                  <Table.Cell>{user.refunds?.refundRate || "N/A"}%</Table.Cell>
                  <Table.Cell>
                    {new Date(user.changeDate).toLocaleDateString() || "N/A"}
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Firm Name
              </label>
              <TextInput
                id="firmName"
                placeholder="Enter firm name"
                value={editUser.firmName || ""}
                onChange={(e) =>
                  setEditUser({ ...editUser, firmName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Change Date
              </label>
              <DatePicker
                selected={
                  editUser.changeDate ? new Date(editUser.changeDate) : null
                }
                onChange={(date) =>
                  setEditUser({ ...editUser, changeDate: date })
                }
                className="w-full border rounded-md px-3 py-2"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
              />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold">ASSISTANCE DETAILS</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount of Assistance
                  </label>
                  <TextInput
                    id="amountOfAssistance"
                    type="number"
                    placeholder="Amount of assistance"
                    value={editUser.amountOfAssistance || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Refund Rate
                  </label>
                  <TextInput
                    id="refundRate"
                    type="number"
                    placeholder="Enter refund rate"
                    value={editUser.refunds?.refundRate || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Refund Payment
                  </label>
                  <TextInput
                    id="totalRefundPayment"
                    type="number"
                    placeholder="Enter total refund payment"
                    value={editUser.refunds?.totalRefundPayment || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Refund Status
                  </label>
                  <TextInput
                    id="refundStatus"
                    placeholder="Enter refund status"
                    value={editUser.refunds?.refundStatus || ""}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold">MONTHLY REFUND</h3>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Monthly Due
                  </label>
                  <TextInput
                    id="monthlyDue"
                    type="number"
                    placeholder="Enter monthly due"
                    value={editUser.refunds?.monthlyDue || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Refund Payment
                  </label>
                  <TextInput
                    id="refundPayment"
                    type="number"
                    placeholder="Enter refund payment"
                    value={editUser.refunds?.refundPayment || ""}
                    onChange={handleRefundPaymentChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Arrears
                  </label>
                  <TextInput
                    id="arrears"
                    type="number"
                    placeholder="Enter arrears"
                    value={editUser.refunds?.arrears || ""}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={handleUpdateUser}>Save Changes</Button>
              <Button color="gray" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
