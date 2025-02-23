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
        <div style={styles.container}>
            <h1 style={styles.heading}>Admin Management</h1>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Full Name</th>
                        <th style={styles.th}>Display Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={{ ...styles.th, ...styles.actionTh }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td style={styles.td}>{user.fullName}</td>
                            <td style={styles.td}>{user.displayName}</td>
                            <td style={styles.td}>{user.email}</td>
                            <td style={{ ...styles.td, ...styles.actionTd }}>
                                {user.isAdmin ? (
                                    "admin"
                                ) : (
                                    <Button style={styles.button} onClick={() => promoteToAdmin(user.id)}>
                                        Promote to Admin
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br />
            <br />
            <Button style={styles.navigateButton} onClick={() => navigate('/tasks')}>
                Go to Dashboard
            </Button>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "80vh",
        padding: "20px",
        boxSizing: "border-box",
    },
    heading: {
        marginBottom: "20px",
    },
    table: {
        width: "100%",
        maxWidth: "800px",
        borderCollapse: "collapse",
        marginTop: "20px",
    },
    th: {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "left",
        backgroundColor: "#f2f2f2",
    },
    actionTh: {
        textAlign: "center",
    },
    td: {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "left",
    },
    actionTd: {
        textAlign: "center",
    },
    button: {
        backgroundColor: "#7000da",
        color: "white",
        padding: "0.75rem",
        border: "none",
        borderRadius: "0.5rem",
        cursor: "pointer",
    },
    navigateButton: {
        backgroundColor: "#7000da",
        color: "white",
        padding: "1rem",
        border: "none",
        borderRadius: "0.5rem",
        cursor: "pointer",
        fontSize: "1.1rem",
    },
};

export default AdminManagement;