import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "../SignupPage";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// ✅ Mock useNavigate()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("SignupPage", () => {
  let navigate;

  beforeEach(() => {
    navigate = jest.fn(); // ✅ 定义 Mock navigate
    useNavigate.mockReturnValue(navigate); // ✅ 确保 useNavigate() 返回 navigate
    jest.clearAllMocks(); // 清除上一个测试的 Mock
  });

  test("clicking 'Login here' navigates to login page", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    const loginLink = screen.getByText(/login here/i);
    await userEvent.click(loginLink);

    expect(navigate).toHaveBeenCalledWith("/login");
  });

  test("submits form successfully and shows alert", async () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>);

    await userEvent.type(screen.getByPlaceholderText(/Username/i), "testuser");
    await userEvent.type(screen.getByPlaceholderText(/Email/i), "test@example.com");
    await userEvent.type(screen.getAllByPlaceholderText(/Password/i)[0], "password123");
    await userEvent.type(screen.getAllByPlaceholderText(/Password/i)[1], "password123");

    jest.spyOn(window, "alert").mockImplementation(() => {});

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Sign up successful!");
    expect(navigate).toHaveBeenCalledWith("/login");
  });

  test("form submission fails if fields are empty", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole("button", { name: /sign up/i });

    jest.spyOn(window, "alert").mockImplementation(() => {});

    await userEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith("All fields must be filled!");
    expect(navigate).not.toHaveBeenCalled(); // ❌ 确保没有跳转
  });

  test("form submission fails if passwords do not match", async () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>);

    await userEvent.type(screen.getByPlaceholderText(/Username/i), "testuser");
    await userEvent.type(screen.getByPlaceholderText(/Email/i), "test@example.com");
    await userEvent.type(screen.getAllByPlaceholderText(/Password/i)[0], "password123");
    await userEvent.type(screen.getAllByPlaceholderText(/Password/i)[1], "wrongpassword");

    jest.spyOn(window, "alert").mockImplementation(() => {});

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(window.alert).toHaveBeenCalledWith("Passwords do not match");
    expect(navigate).not.toHaveBeenCalled();
  });

  test("all input fields should have required attribute", () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>);

    expect(screen.getByPlaceholderText(/Username/i)).toHaveAttribute("required");
    expect(screen.getByPlaceholderText(/Email/i)).toHaveAttribute("required");
    expect(screen.getAllByPlaceholderText(/Password/i)[0]).toHaveAttribute("required");
    expect(screen.getAllByPlaceholderText(/Password/i)[1]).toHaveAttribute("required");
  });
});
