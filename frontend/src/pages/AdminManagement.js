import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const AdminManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [editingUsers, setEditingUsers] = useState({});
    const [editedUsers, setEditedUsers] = useState({});

    useEffect(() => {
        fetchUsers();
        document.title = "Admin Management - Collabium";
        // Dynamically load Toastify-js at run time
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/toastify-js";
        document.body.appendChild(script);
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
    
            console.log("Response URL:", response.url);
            console.log("Response Status:", response.status);
            const data = await response.json();
            console.log("Fetched Users:", data);

            if (!response.ok) {
                console.error("API Error:", data);
                throw new Error("Failed to fetch users");
            }

            console.log("Fetched Users:", data);
    
            setUsers([...data]);
    
        } catch (error) {
            console.error("Error fetching users", error);
            setUsers([]);
        }
    };
    
    
    
    
    
    

    const promoteToAdmin = async (userId) => {
        try {
            const token = localStorage.getItem("token");
    
            await fetch(`${apiUrl}/api/admin/promote`, { 
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

    // Add function demoteAdmin function for admin users to be demoted to user.
    const demoteAdmin = async (userId) => {
        try {
            const token = localStorage.getItem("token");
    
            await fetch(`${apiUrl}/api/admin/demote`, {
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
            console.error("Error demoting user", error);
        }
    };

    // Corrected updateUser to call the backend using apiUrl when user info is updated
    const updateUser = async (userId, firstName, lastName, email) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${apiUrl}/api/admin/update/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ firstName, lastName, email }),
                credentials: "include",
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update user (${response.status}): ${errorText}`);
            }

            fetchUsers();
        } catch (error) {
            console.error("Error updating user", error);
        }
    };


    const deleteUser = async (userId) => {
        try {
            const token = localStorage.getItem("token");
    
            const response= await fetch(`${apiUrl}/api/admin/delete/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,  
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to delete user");
            }
    
            // If deleting self, logout
            const currentUserId = getCurrentUserIdFromToken(token); // Implement this
            if (currentUserId === userId) {
                localStorage.removeItem("token"); 
                navigate('/signup'); // if users has been deleted, logout and go to signup page 
                return;
            }
    
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user", error);
        }
    };
    const getCurrentUserIdFromToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64));
            return JSON.parse(jsonPayload).user_id;
        } catch (e) {
            return null;
        }
    };

    // Get the current user's id from the token so that we can hide self promote/demote buttons.
    const currentUserId = getCurrentUserIdFromToken(localStorage.getItem("token"));

    // handles the input change
    const handleInputChange = (userId, field, value) => {
        setEditedUsers((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value,
            },
        }));
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Admin Management</h1>
    
            {users.length > 0 ? (
                <>
                    <div style={styles.scrollContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Username</th>
                                    <th style={styles.th}>First Name</th>
                                    <th style={styles.th}>Last Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={{ ...styles.th, minWidth: "200px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.user_id}>
                                        <td style={styles.td}>{user.display_name}</td>
                                        <td style={styles.td}>
                                            <input
                                                type="text"
                                                value={editingUsers[user.user_id]?.first_name ?? user.first_name}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setEditingUsers((prev) => ({
                                                        ...prev,
                                                        [user.user_id]: {
                                                            ...prev[user.user_id],
                                                            first_name: value,
                                                        },
                                                    }));
                                                    setEditedUsers((prev) => ({
                                                        ...prev,
                                                        [user.user_id]: {
                                                            ...prev[user.user_id],
                                                            first_name: value,
                                                        },
                                                    }));
                                                }}
                                                onBlur={() => {
                                                    if (!editingUsers[user.user_id]?.first_name?.trim()) {
                                                        setEditingUsers((prev) => ({
                                                            ...prev,
                                                            [user.user_id]: {
                                                                ...prev[user.user_id],
                                                                first_name: user.first_name,
                                                            },
                                                        }));
                                                    }
                                                }}
                                                style={styles.inputField}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input
                                                type="text"
                                                value={editingUsers[user.user_id]?.last_name ?? user.last_name}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setEditingUsers((prev) => ({
                                                        ...prev,
                                                        [user.user_id]: {
                                                            ...prev[user.user_id],
                                                            last_name: value,
                                                        },
                                                    }));
                                                    setEditedUsers((prev) => ({
                                                        ...prev,
                                                        [user.user_id]: {
                                                            ...prev[user.user_id],
                                                            last_name: value,
                                                        },
                                                    }));
                                                }}
                                                onBlur={() => {
                                                    if (!editingUsers[user.user_id]?.last_name?.trim()) {
                                                        setEditingUsers((prev) => ({
                                                            ...prev,
                                                            [user.user_id]: {
                                                                ...prev[user.user_id],
                                                                last_name: user.last_name,
                                                            },
                                                        }));
                                                    }
                                                }}
                                                style={styles.inputField}
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input
                                                type="email"
                                                value={editingUsers[user.user_id]?.email ?? user.email}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setEditingUsers((prev) => ({
                                                        ...prev,
                                                        [user.user_id]: {
                                                            ...prev[user.user_id],
                                                            email: value,
                                                        },
                                                    }));
                                                    setEditedUsers((prev) => ({
                                                        ...prev,
                                                        [user.user_id]: {
                                                            ...prev[user.user_id],
                                                            email: value,
                                                        },
                                                    }));
                                                }}
                                                onBlur={() => {
                                                    if (!editingUsers[user.user_id]?.email?.trim()) {
                                                        setEditingUsers((prev) => ({
                                                            ...prev,
                                                            [user.user_id]: {
                                                                ...prev[user.user_id],
                                                                email: user.email,
                                                            },
                                                        }));
                                                    }
                                                }}
                                                style={styles.inputField}
                                            />
                                        </td>
                                        <td style={styles.td}>{user.is_admin ? "Admin" : "User"}</td>
                                        <td style={{ ...styles.td, ...styles.actionTd }}>
                                            {user.user_id !== currentUserId && user.is_admin && (
                                                <Button onClick={() => demoteAdmin(user.user_id)}>Demote</Button>
                                            )}
                                            {user.user_id !== currentUserId && !user.is_admin && (
                                                <Button onClick={() => promoteToAdmin(user.user_id)}>Promote</Button>
                                            )}
                                            <Button onClick={() => deleteUser(user.user_id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
    
                    <div style={styles.buttonGroup}>
                        <Button
                            style={styles.actionButton}
                            onClick={async () => {
                                for (const userId of Object.keys(editedUsers)) {
                                    const changes = editedUsers[userId];
                                    if (
                                        changes &&
                                        (changes.first_name?.trim() || changes.last_name?.trim() || changes.email?.trim())
                                    ) {
                                        await updateUser(
                                            userId,
                                            changes.first_name?.trim() ||
                                                users.find(u => u.user_id === parseInt(userId))?.first_name,
                                            changes.last_name?.trim() ||
                                                users.find(u => u.user_id === parseInt(userId))?.last_name,
                                            changes.email?.trim() ||
                                                users.find(u => u.user_id === parseInt(userId))?.email
                                        );
                                    }
                                }
                                setEditedUsers({});
                                setEditingUsers({});
    
                                if (window.Toastify) {
                                    window.Toastify({
                                        text: "Update Successful!",
                                        duration: 6000,
                                        gravity: "top",
                                        position: "center",
                                        style: { background: "#4caf50" },
                                    }).showToast();
                                }
                            }}
                            disabled={Object.keys(editedUsers).length === 0}
                        >
                            Update
                        </Button>
                        <Button style={styles.actionButton} onClick={() => navigate('/tasks')}>
                            Go to Dashboard
                        </Button>
                    </div>
                </>
            ) : (
                <p style={styles.noUsersMessage}>
                    There are no users to manage right now! Add them to your team to get started.
                </p>
            )}
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
    // The container for the table now has a fixed max height and auto overflow
    scrollContainer: {
        overflowY: "auto",
        maxHeight: "300px", // or 400px if you prefer
        width: "100%",
        maxWidth: "800px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginTop: "20px",
        padding: "10px",
        backgroundColor: "#fff",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    th: {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "left",
        backgroundColor: "#f2f2f2",
    },
    td: {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "left",
    },
    actionTd: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
        // Provide enough space for multiple buttons to appear side by side
    },
    inputField: {
        width: "90%",
        padding: "4px",
        boxSizing: "border-box",
    },
    buttonGroup: {
        marginTop: "20px",
        display: "flex",
        gap: "16px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    actionButton: {
        backgroundColor: "#7000da",
        color: "white",
        padding: "0.6rem 1rem",
        border: "none",
        borderRadius: "0.5rem",
        cursor: "pointer",
        fontSize: "1rem",
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