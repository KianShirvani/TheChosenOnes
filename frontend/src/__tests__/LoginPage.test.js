import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom"; // Use for rendering without navigation
import LoginBody from "../components/LoginBody";

jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock window.alert

describe("LoginBody", () => {
  test("renders LoginBody with input fields and login button", () => {
    render(
      <MemoryRouter>
        <LoginBody />
      </MemoryRouter>
    );

    expect(screen.getByTestId("login-body")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  }); 

  test("does not submit if fields are empty", async () => {
    render(
      <MemoryRouter>
        <LoginBody />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(window.alert).toHaveBeenCalledWith("All fields must be filled!");
  });
});
