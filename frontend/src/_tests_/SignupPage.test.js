import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "../pages/SignupPage";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

const renderSignupPage = () => {
  render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  );
};

describe("SignupPage", () => {
  let navigate;

  beforeEach(() => {
    navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {}); // Mock alert globally
  });

  test("clicking 'Login here' navigates to login page", async () => {
    renderSignupPage();

    const loginLink = screen.getByText(/login here/i);
    await userEvent.click(loginLink);

    expect(navigate).toHaveBeenCalledWith("/login");
  });

  test("submits form successfully and shows alert", async () => {
    renderSignupPage();

    await userEvent.type(screen.getByRole("textbox", { name: /username/i }), "testuser");
    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@example.com");
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], "password123");
    await userEvent.type(screen.getAllByLabelText(/password/i)[1], "password123");

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Sign up successful!");
    expect(navigate).toHaveBeenCalledWith("/login");
  });

  test("form submission fails if fields are empty", async () => {
    renderSignupPage();

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("All fields must be filled!");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("form submission fails if passwords do not match", async () => {
    renderSignupPage();

    await userEvent.type(screen.getByRole("textbox", { name: /username/i }), "testuser");
    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@example.com");
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], "password123");
    await userEvent.type(screen.getAllByLabelText(/password/i)[1], "wrongpassword");

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Passwords do not match");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("form submission fails if email is invalid", async () => {
    renderSignupPage();

    await userEvent.type(screen.getByRole("textbox", { name: /username/i }), "testuser");
    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "invalid-email");
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], "password123");
    await userEvent.type(screen.getAllByLabelText(/password/i)[1], "password123");

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Invalid email format");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("form submission fails if password is too short", async () => {
    renderSignupPage();

    await userEvent.type(screen.getByRole("textbox", { name: /username/i }), "testuser");
    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@example.com");
    await userEvent.type(screen.getAllByLabelText(/password/i)[0], "short");
    await userEvent.type(screen.getAllByLabelText(/password/i)[1], "short");

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Password must be at least 8 characters long");
    expect(navigate).not.toHaveBeenCalled();
  });
});