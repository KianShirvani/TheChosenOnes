import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "../pages/SignupPage";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

const mock = new MockAdapter(axios);

const renderSignupPage = () => {
  render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  );
};

const fillSignupForm = async (username, email, password, confirmPassword) => {
  await userEvent.type(screen.getByRole("textbox", { name: /username/i }), username);
  await userEvent.type(screen.getByRole("textbox", { name: /email/i }), email);
  await userEvent.type(screen.getAllByLabelText(/password/i)[0], password);
  await userEvent.type(screen.getAllByLabelText(/password/i)[1], confirmPassword);
};

beforeAll(() => {
  process.env.REACT_APP_API_URL = "http://localhost:5000";
});

describe("SignupPage", () => {
  let navigate;

  beforeEach(() => {
    navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {}); // Mock alert globally
    mock.reset();
  });

  test("clicking 'Login here' navigates to login page", async () => {
    renderSignupPage();

    const loginLink = screen.getByText(/login here/i);
    await userEvent.click(loginLink);

    expect(navigate).toHaveBeenCalledWith("/login");
  });

  test("submits form successfully and shows alert", async () => {
    mock.onPost(`${process.env.REACT_APP_API_URL}/register`).reply(200, {
      message: "User created successfully",
    });

    renderSignupPage();
    await fillSignupForm("testuser", "test@example.com", "password123", "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Sign up successful!");
    expect(navigate).toHaveBeenCalledWith("/login");
  });

  test("calls the /register route", async () => {
    mock.onPost(`${process.env.REACT_APP_API_URL}/register`).reply(200, {
      message: "User created successfully",
    });

    renderSignupPage();
    await fillSignupForm("testuser", "test@example.com", "password123", "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mock.history.post[0].url).toBe(`${process.env.REACT_APP_API_URL}/register`);
    });
  });

  test("sends correct data to /register", async () => {
    mock.onPost(`${process.env.REACT_APP_API_URL}/register`).reply(200, {
      message: "User created successfully",
    });

    renderSignupPage();
    await fillSignupForm("testuser", "test@example.com", "password123", "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mock.history.post[0].data).toContain("testuser");
    expect(mock.history.post[0].data).toContain("test@example.com");
  });

  test("form submission fails if fields are empty", async () => {
    renderSignupPage();
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("All fields must be filled!");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("form submission fails if passwords do not match", async () => {
    renderSignupPage();
    await fillSignupForm("testuser", "test@example.com", "password123", "wrongpassword");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Passwords do not match");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("form submission fails if email is invalid", async () => {
    renderSignupPage();
    await fillSignupForm("testuser", "invalid-email", "password123", "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Invalid email format");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("form submission fails if password is too short", async () => {
    renderSignupPage();
    await fillSignupForm("testuser", "test@example.com", "short", "short");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Password must be at least 8 characters long");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("should show alert on error when sign-up fails", async () => {
    mock.onPost(`${process.env.REACT_APP_API_URL}/register`).reply(400, {
      error: "User already exists",
    });

    renderSignupPage();
    await fillSignupForm("testuser", "test@example.com", "password123", "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Sign up failed!");
    });
    expect(navigate).not.toHaveBeenCalled();
  });
});
