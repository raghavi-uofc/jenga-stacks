import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import './UserManagementDashboard.css';


const mockUsers = [
  { id: 1, email: 'user1@example.com', name: 'Someone' },
  { id: 2, email: 'user2@email.com', name: 'Name 2' },
  { id: 3, email: 'user3@example.com', name: 'Name 3' },
  { id: 4, email: 'user4@me.com', name: 'A Person' },
];

const UserActionsMenu = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action) => {
    alert(`Performing ${action} on user ${userId}`);
    setIsOpen(false);
  };

  return (
    <div className="ellipsis-menu">
      <button className="menu-button" onClick={() => setIsOpen(!isOpen)}>
        ...
      </button>
      {isOpen && (
        <div className="menu-dropdown">
          <button className="menu-item" onClick={() => handleAction('Edit')}>Edit</button>
          <button className="menu-item" onClick={() => handleAction('Change Role')}>Change Role</button>
          <button className="menu-item delete-item" onClick={() => handleAction('Delete')}>Delete</button>
        </div>
      )}
    </div>
  );
};

const UserManagementDashboard = () => {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const currentUser = { isAdmin: true }; 

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin={currentUser.isAdmin} activeLink="manage-accounts" />
      
      <div className="main-content-area">
        <header className="main-header user-header">
            <div className="header-branding">
                <h1>JengaStacks / Users</h1>
            </div>
            <div className="header-actions">
                <button className="new-project-button">New User</button>
                <div className="profile-circle">
                    <span>Profile</span>
                </div>
            </div>
        </header>

        <main className="user-table-container">
            <h2>Users</h2>
            <table className="user-table">
                <thead>
                    <tr>
                        <th className="select-col"></th>
                        <th>Email</th>
                        <th>User Name</th>
                        <th className="actions-col"></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="select-col">
                                <input 
                                    type="checkbox" 
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => handleSelectUser(user.id)}
                                />
                            </td>
                            <td>{user.email}</td>
                            <td>{user.name}</td>
                            <td className="actions-col">
                                <UserActionsMenu userId={user.id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {selectedUsers.length > 0 && (
                <div className="bulk-actions-bar">
                    <span>{selectedUsers.length} user(s) selected</span>
                    <button className="bulk-button">Bulk Delete</button>
                    <button className="bulk-button">Bulk Change Role</button>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default UserManagementDashboard;