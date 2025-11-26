import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";
import { AuthContext } from "../../Router";

const mockedNavigate = jest.fn();

// Mock react-router-dom useNavigate and Link
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
  Link: ({ to, ...props }) => <a href={to} {...props} />, // anchor for Link
}));

// Mock RegisterForm since Header renders it conditionally (simulate with simple div)
jest.mock("../../features/auth/RegisterForm", () => ({ switchToLogin, isCurrentUserAdmin }) => (
  <div data-testid="register-form">
    RegisterForm - Admin: {isCurrentUserAdmin ? "Yes" : "No"}
    <button onClick={switchToLogin}>Switch to Login</button>
  </div>
));

const userRegular = {
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  role: "regular",
  firstName: "Jane", // for initials
};
const userAdmin = { ...userRegular, role: "admin" };

const logoutMock = jest.fn();

const renderHeader = (user = userRegular) =>
  render(
    <AuthContext.Provider value={{ user, logout: logoutMock }}>
      <Header />
    </AuthContext.Provider>
  );

describe("Header component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header branding and user initials", () => {
    renderHeader();
    expect(screen.getByText(/JengaStacks \/ Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument(); // Initial from firstName
  });

  test("shows New Project button for non-admin user", () => {
    renderHeader(userRegular);
    expect(screen.getByText(/New Project/i)).toBeInTheDocument();
    expect(screen.queryByText(/Register New User/i)).not.toBeInTheDocument();
  });

  test("shows Register New User button for admin user", () => {
    renderHeader(userAdmin);
    expect(screen.getByText(/Register New User/i)).toBeInTheDocument();
    expect(screen.queryByText(/New Project/i)).not.toBeInTheDocument();
  });

  test("profile dropdown toggles and displays user info", () => {
    renderHeader();
    const profileCircle = screen.getByText("J");
    fireEvent.click(profileCircle);

    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText("(jane@example.com)")).toBeInTheDocument();

    // Dropdown buttons visible
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test("clicking Profile navigates to /profile and closes menu", () => {
    renderHeader();
    fireEvent.click(screen.getByText("J"));
    fireEvent.click(screen.getByText(/Profile/i));
    expect(mockedNavigate).toHaveBeenCalledWith("/profile");
  });

  test("clicking Logout calls logout and navigates to /auth", () => {
    renderHeader();
    fireEvent.click(screen.getByText("J"));
    fireEvent.click(screen.getByText(/Logout/i));
    expect(logoutMock).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith("/auth");
  });

  test("shows RegisterForm on showRegister true and toggles back to login", () => {

    const TestWrapper = () => {
      const [showRegister, setShowRegister] = React.useState(true);
      const user = { ...userAdmin };
      return (
        <AuthContext.Provider value={{ user, logout: logoutMock }}>
          {showRegister ? (
            <div data-testid="register-form">
              RegisterForm - Admin: Yes
              <button onClick={() => setShowRegister(false)}>Switch to Login</button>
            </div>
          ) : (
            <Header />
          )}
        </AuthContext.Provider>
      );
    };

    render(<TestWrapper />);
    expect(screen.getByTestId("register-form")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/switch to login/i));
    // After clicking, RegisterForm disappears, Header re-renders
    expect(screen.queryByTestId("register-form")).not.toBeInTheDocument();
  });
});
