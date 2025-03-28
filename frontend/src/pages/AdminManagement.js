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
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Username</th> {/* NEW UPDATE */}
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
                                    <td>{user.display_name}</td>

                                    <td>
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
                                        />
                                    </td>

                                    <td>
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
                                        />
                                    </td>

                                    <td>
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
                                        />
                                    </td>


                                    <td>{user.is_admin ? "Admin" : "User"}</td>
                                    <td>
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

                    {/* Update Button */}
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <Button
                            style={styles.navigateButton}
                            onClick={async () => {
                                for (const userId of Object.keys(editedUsers)) {
                                  const changes = editedUsers[userId];
                                  if (
                                    changes &&
                                    (changes.first_name?.trim() || changes.last_name?.trim() || changes.email?.trim())
                                  ) {
                                    await updateUser(
                                      userId,
                                      changes.first_name?.trim() || users.find(u => u.user_id === parseInt(userId))?.first_name,
                                      changes.last_name?.trim() || users.find(u => u.user_id === parseInt(userId))?.last_name,
                                      changes.email?.trim() || users.find(u => u.user_id === parseInt(userId))?.email
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
                    </div>
                </>
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
        marginTop: "30px",
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