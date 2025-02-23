import React from "react";
import AdminManagement from "../pages/AdminManagement";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

describe("AdminManagement", () => {
    let navigate;

    // set up for each test
    beforeEach(() => {
        navigate = jest.fn();
        useNavigate.mockReturnValue(navigate);
        jest.clearAllMocks();
    });

    test("renders admin management page with users", () => {
        renderAdminManagement();

        expect(screen.getByText(/Admin Management/i)).toBeInTheDocument();
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
        expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });

    test("promotes user to admin", async () => {
        renderAdminManagement();

        // find the first "Promote to Admin" button (for a specific user)
        const promoteButtons = screen.getAllByText(/Promote to Admin/i);
        const firstPromoteButton = promoteButtons[0]; // Promote the first user

        await userEvent.click(firstPromoteButton);

        // wait until this specific button is removed
        await waitFor(() => {
            expect(firstPromoteButton).not.toBeInTheDocument();
        });

        // Ensure that at least one "admin" label exists
        expect(screen.getAllByText(/admin/i).length).toBeGreaterThan(0);
    });

    test("navigates to dashboard on button click", async () => {
        renderAdminManagement();

        const dashboardButton = screen.getByText(/Go to Dashboard/i);
        await userEvent.click(dashboardButton);

        // wait for navigation to be triggered
        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith("/tasks");
        });
    });
});