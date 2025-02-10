import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginBody from "../LoginBody"; // Ensure the path is correct

describe("LoginBody", () => {
  test("renders LoginBody with input fields and login button", () => {
    render(<LoginBody />);

    // Check if LoginBody renders correctly with the form elements
    expect(screen.getByTestId("login-body")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("submits form with valid credentials", async () => {
    render(<LoginBody />);

    // Fill in the input fields
    await userEvent.type(screen.getByPlaceholderText(/username or email/i), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "password123");

    // Mock the alert to verify form submission
    jest.spyOn(window, "alert").mockImplementation(() => {});

    // Click the login button
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    // Verify that the alert is triggered with a success message
    expect(window.alert).toHaveBeenCalledWith("Login successful!");
  });

  test("shows alert if fields are empty", async () => {
    render(<LoginBody />);

    const loginButton = screen.getByRole("button", { name: /login/i });

    // Mock the alert
    jest.spyOn(window, "alert").mockImplementation(() => {});

    // Click the login button without filling in the fields
    await userEvent.click(loginButton);

    // Verify that the alert is triggered indicating empty fields
    expect(window.alert).toHaveBeenCalledWith("All fields must be filled!");
  });
});
