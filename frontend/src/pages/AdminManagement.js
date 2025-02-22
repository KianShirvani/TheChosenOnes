import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const AdminManagement = () => {
    const navigate = useNavigate();

    // mock data for users (for UI testing)
    // change this once connected to the database to pull the actual data
    const [users, setUsers] = useState([
        { id: 1, fullName: "John Doe", displayName: "johnd", email: "john@example.com", isAdmin: false },
        { id: 2, fullName: "Jane Smith", displayName: "janes", email: "jane@example.com", isAdmin: true },
        { id: 3, fullName: "Alice Johnson", displayName: "alicej", email: "alice@example.com", isAdmin: false },
    ]);

    const promoteToAdmin = (userId) => {
        // modify this once connected to the backend
        console.log(`Promote user with ID ${userId} to admin`);
        // update the user's isAdmin status in the state
        setUsers(users.map(user => user.id === userId ? { ...user, isAdmin: true } : user));
    };

    return (
        <div className="admin=management-container">
            <h1>Admin Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Display Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.fullName}</td>
                            <td>{user.displayName}</td>
                            <td>{user.email}</td>
                            <td>
                                {user.isAdmin ? (
                                    "admin"
                                ) : (
                                    <Button onClick={() => promoteToAdmin(user.id)}>
                                        Promote to Admin
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {

};

export default AdminManagement;