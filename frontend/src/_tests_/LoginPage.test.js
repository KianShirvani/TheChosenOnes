import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom"; // Use for rendering without navigation
import LoginBody from "../components/LoginBody";

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
