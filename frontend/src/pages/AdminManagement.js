import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const AdminManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";


    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("Retrieved Token:", token);
    
            if (!token) {
                console.error("No token found, user might not be authenticated.");
                return;
            }
    
            const response = await fetch(`${apiUrl}/api/admin/users`, { 
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
    
            console.log("🔍 Response URL:", response.url);
            console.log("🔍 Response Status:", response.status);
            const responseText = await response.text();
            console.log("🔍 Raw Response Body:", responseText);
    
            if (!response.ok) {
                console.error("API Error:", responseText);
                throw new Error("Failed to fetch users");
            }
    
            const data = JSON.parse(responseText);
            console.log("Fetched Users:", data);
    
            setUsers([...data]);
    
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };
    
    
    
    
    
    

    const promoteToAdmin = async (userId) => {
        try {
            const token = localStorage.getItem("token");
    
            await fetch(`/api/admin/promote`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,  
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
                credentials: "include",
            });
    
            fetchUsers();
        } catch (error) {
            console.error("Error promoting user", error);
        }
    };

    const updateUser = async (userId, firstName, lastName, email) => {
        try {
            const token = localStorage.getItem("token");
    
            await fetch(`/api/admin/update/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,  
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ firstName, lastName, email }),
                credentials: "include",
            });
    
            fetchUsers();
        } catch (error) {
            console.error("Error updating user", error);
        }
    };

    const deleteUser = async (userId) => {
        try {
            const token = localStorage.getItem("token");
    
            await fetch(`/api/admin/delete/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,  
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
    
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user", error);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Admin Management</h1>

            {users.length > 0 ? (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.user_id}>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>{user.email}</td>
                                <td>{user.is_admin ? "Admin" : "User"}</td>
                                <td>
                                    {!user.is_admin && (
                                        <Button onClick={() => promoteToAdmin(user.user_id)}>Promote</Button>
                                    )}
                                    <Button onClick={() => deleteUser(user.user_id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={styles.noUsersMessage}>
                    There are no users to manage right now! Add them to your team to get started.
                </p>
            )}

            <Button style={styles.navigateButton} onClick={() => navigate('/tasks')}>Go to Dashboard</Button>
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
    noUsersMessage: {
        fontSize: "1.2rem",
        fontWeight: "bold",
        color: "#555",
        marginTop: "20px",
        textAlign: "center",
    },
};

export default AdminManagement;
