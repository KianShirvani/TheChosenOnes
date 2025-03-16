import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import LoginBody from "../components/LoginBody";
import LoginPage from "../pages/LoginPage";

jest.mock("axios");
jest.spyOn(window, "alert").mockImplementation(() => {});

const renderWithRouter = (ui) => {
  render(<MemoryRouter>{ui}</MemoryRouter>);
};

const fillAndSubmitLoginForm = async (email, password) => {
  fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));
};

describe("LoginBody", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders LoginBody with input fields and login button", () => {
    renderWithRouter(<LoginBody />);

    expect(screen.getByTestId("login-body")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("does not submit if fields are empty", async () => {
    renderWithRouter(<LoginBody />);

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(window.alert).toHaveBeenCalledWith("All fields must be filled!");
  });
});

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls the backend API on form submission with correct credentials", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "Login successful" } });

    renderWithRouter(<LoginPage />);
    await fillAndSubmitLoginForm("test@example.com", "password123");

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
    axios.post.mockRejectedValueOnce(new Error("Login failed"));

    renderWithRouter(<LoginPage />);
    await fillAndSubmitLoginForm("test@example.com", "password123");

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          email: "test@example.com",
          password: "password123",
        }
      );
      expect(window.alert).toHaveBeenCalledWith("Login failed! Please try again later.");
    });
  });
});
