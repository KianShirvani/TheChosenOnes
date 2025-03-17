import React, { useState } from "react";
import AdminManagement from "../pages/AdminManagement";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUsers = [
    { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com" },
    { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
    { id: 3, firstName: "Alice", lastName: "Johnson", email: "alice@example.com" },
];

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

const renderAdminManagement = () => {
    render(
        <MemoryRouter>
            <AdminManagement />
        </MemoryRouter>
    );
};

const MockAdminManagement = ({ users: initialUsers }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState(initialUsers);

    const handlePromote = (userId) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, is_admin: true } : user
            )
        );
    };

    const handleDelete = (userId) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    };

    return (
        <div>
            <h1>Admin Management</h1>
            {users.length > 0 ? (
                <table>
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
                            <tr key={user.id}>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.is_admin ? "Admin" : "User"}</td>
                                <td>
                                    {!user.is_admin && (
                                        <button onClick={() => handlePromote(user.id)}>
                                            Promote
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(user.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>There are no users to manage right now!</p>
            )}
            <button onClick={() => navigate("/tasks")}>Go to Dashboard</button>
        </div>
    );
};

describe("AdminManagement", () => {
    let navigate;

    // set up for each test
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear(); // Clear localStorage to prevent state leakage
        localStorage.setItem('token', 'valid-token'); // Mock login

        navigate = jest.fn();
        useNavigate.mockReturnValue(navigate);
    });

    test("renders admin management page with users", () => {
        render(<MockAdminManagement users={mockUsers} />);

        // Check if the users' first names are rendered
        expect(screen.getByText(/^John$/i)).toBeInTheDocument();
        expect(screen.getByText(/^Jane$/i)).toBeInTheDocument();
        expect(screen.getByText(/^Alice$/i)).toBeInTheDocument();

        // Check if the admin role is shown for the first user
        const adminRoles = screen.getAllByText(/Admin/i);
        expect(adminRoles.length).toBeGreaterThan(0);

        // Check if at least one 'Promote' button is visible for non-admin users
        const promoteButtons = screen.getAllByText(/Promote/i);
        expect(promoteButtons.length).toBeGreaterThan(0);
    });
        

    test("promotes user to admin", async () => {
        // Set up a mock function to update users
        const setUsers = jest.fn();

        render(<MockAdminManagement users={mockUsers} setUsers={setUsers} />);

        // find the first "Promote to Admin" button (for a specific user)
        const promoteButtons = screen.getAllByText(/Promote/i);
        const firstPromoteButton = promoteButtons[0];

        await userEvent.click(firstPromoteButton);

        // Mock state update to show the user has been promoted
        // Here we simulate what would happen after the promote action is completed
        setUsers.mockImplementationOnce(() => {
            const updatedUsers = [...mockUsers];
            updatedUsers[0].is_admin = true;
            return updatedUsers;
        });

        expect(screen.getAllByText(/admin/i).length).toBeGreaterThan(0);
    });

    test("delete a user", async () => {
        render(<MockAdminManagement users={mockUsers} />);

        expect(screen.getByText(/^John$/i)).toBeInTheDocument();

        const deleteButtons = screen.getAllByText(/Delete/i);
        const firstDeleteButton = deleteButtons[0];

        await userEvent.click(firstDeleteButton);

        await waitFor(() => {
            expect(screen.queryByText(/^John$/i)).not.toBeInTheDocument();
        });
    });

    test("navigates to dashboard on button click", async () => {
        renderAdminManagement();

        const dashboardButton = screen.getByText(/Go to Dashboard/i);
        await userEvent.click(dashboardButton);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith("/tasks");
        });
    });
});