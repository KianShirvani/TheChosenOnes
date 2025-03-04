import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom"; // Use for rendering without navigation
import LoginBody from "../components/LoginBody";
import axios from "axios";
import LoginPage from "../pages/LoginPage";

jest.mock("axios");
jest.spyOn(window, "alert").mockImplementation(() => {}); // Mock window.alert

const renderLoginBody = () => {
  render(
    <MemoryRouter>
      <LoginBody />
    </MemoryRouter>
  );
};

describe("LoginBody", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to avoid interference
  });

  test("renders LoginBody with input fields and login button", () => {
    renderLoginBody();

    expect(screen.getByTestId("login-body")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("does not submit if fields are empty", async () => {
    renderLoginBody();

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(window.alert).toHaveBeenCalledWith("All fields must be filled!");
  });
});

describe("LoginPage", () => {
  test("calls the backend API on form submission with correct credentials", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "Login successful" } });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i); // Access by label text
    const passwordInput = screen.getByLabelText(/password/i); // Access by label text
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          email: "test@example.com",
          password: "password123",
        }
      );
    });
  });

  test("shows error alert when login fails", async () => {
    // Mocking the axios.post to simulate a failed login
    axios.post.mockRejectedValueOnce(new Error("Login failed"));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          email: "test@example.com",
          password: "password123",
        }
      );
    });

    // Check if the alert for failed login is shown (assuming an alert is shown in case of failure)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Login failed! Please try again later.");
    });
  });

});