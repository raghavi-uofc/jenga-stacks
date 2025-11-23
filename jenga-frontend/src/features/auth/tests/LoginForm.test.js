jest.mock("react-markdown", () => () => <div />);
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "../LoginForm";
import { AuthContext } from "../../../Router";

// Mock loginUser API
jest.mock("../../../api/authApi", () => ({
  loginUser: jest.fn(),
}));
import { loginUser } from "../../../api/authApi";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const loginMock = jest.fn();
const contextValue = { login: loginMock };

function renderLoginForm(props = {}) {
  return render(
    <AuthContext.Provider value={contextValue}>
      <LoginForm switchToRegister={props.switchToRegister || jest.fn()} />
    </AuthContext.Provider>
  );
}

test("renders input fields and login button", () => {
  renderLoginForm();
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
});

test("calls loginUser and login on successful login", async () => {
  loginUser.mockResolvedValueOnce({ token: "123", user: { id: 1 } });
  renderLoginForm();
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "user@mail.com" } });
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "secret" } });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));
  await waitFor(() => {
    expect(loginUser).toHaveBeenCalledWith("user@mail.com", "secret");
    expect(loginMock).toHaveBeenCalledWith("123", { id: 1 });
    expect(mockNavigate).toHaveBeenCalledWith("/projects");
  });
});

test("shows error on login failure", async () => {
  loginUser.mockRejectedValueOnce(new Error("Login failed"));
  renderLoginForm();
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "bad@mail.com" } });
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "wrong" } });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));
  await waitFor(() => expect(screen.getByText(/login failed/i)).toBeInTheDocument());
});

test("calls switchToRegister when register button clicked", () => {
  const switchToRegister = jest.fn();
  renderLoginForm({ switchToRegister });
  fireEvent.click(screen.getByText(/register/i));
  expect(switchToRegister).toHaveBeenCalled();
});

test("shows loading indicator when submitting", async () => {
  let resolveLogin;
  loginUser.mockImplementationOnce(() => new Promise((resolve) => { resolveLogin = resolve; }));
  renderLoginForm();
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "user@mail.com" } });
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "test" } });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));
  expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  resolveLogin({ token: "abc", user: {} });
  await waitFor(() => expect(screen.getByText(/login/i)).toBeInTheDocument());
});
