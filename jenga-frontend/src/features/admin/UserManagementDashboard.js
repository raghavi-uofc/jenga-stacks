import React, { useState, useEffect } from "react";
import { getAllUsers, deleteUserById } from "../../api/authApi"; 
import "./UserManagementDashboard.css";

const UserActionsMenu = ({ userId, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      onDelete(userId);
    }
    setIsOpen(false);
  };

  return (
    <div className="ellipsis-menu">
      <button className="menu-button" onClick={() => setIsOpen(!isOpen)}>
        &#8942;
      </button>
      {isOpen && (
        <div className="menu-dropdown">
          <button className="menu-item delete-item" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const PAGE_SIZE = 5;

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const userList = await getAllUsers(); 
        setUsers(userList);
      } catch (err) {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

 const handleDeleteUser = async (userId) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    await deleteUserById(userId);
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  } catch (error) {
    alert("Failed to delete user. Please try again.");
  }
};

  const pagedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <p className="loading-message">Loading users...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="app-layout">
      <div className="main-content-area">
        <main className="user-table-container">
          <h2>User Management</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>User Name</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.length > 0 ? (
                pagedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.first_name }</td>
                    <td className="actions-col">
                      <UserActionsMenu userId={user.id} onDelete={handleDeleteUser} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination-controls">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagementDashboard;
