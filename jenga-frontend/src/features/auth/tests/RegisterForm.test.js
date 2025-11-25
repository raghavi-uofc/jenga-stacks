import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterForm from "../RegisterForm";
import * as authApi from "../../../api/authApi";

// Mock the registerUser API appropriately
jest.mock("../../../api/authApi", () => ({
  registerUser: jest.fn(),
}));

describe("RegisterForm", () => {
  const mockSwitchToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<RegisterForm switchToLogin={mockSwitchToLogin} isCurrentUserAdmin={true} />);
    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Confirm Password/i)).toBeInTheDocument();
    // Admin checkbox visible because isCurrentUserAdmin=true
    expect(screen.getByLabelText(/Register as Administrator/i)).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    render(<RegisterForm switchToLogin={mockSwitchToLogin} isCurrentUserAdmin={false} />);
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: "Password2!" } });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error if password does not meet complexity", async () => {
    render(<RegisterForm switchToLogin={mockSwitchToLogin} isCurrentUserAdmin={false} />);
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: "abc" } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/Password must be at least 7 characters long/i)).toBeInTheDocument();
  });

  it("calls registerUser on valid submission as admin", async () => {
    authApi.registerUser.mockResolvedValueOnce({});
    render(<RegisterForm switchToLogin={mockSwitchToLogin} isCurrentUserAdmin={true} />);
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: "Password1!" } });
    fireEvent.click(screen.getByLabelText(/Register as Administrator/i));
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => expect(authApi.registerUser).toHaveBeenCalledTimes(1));

    expect(authApi.registerUser).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "Password1!",
        role: "admin",
      })
    );

    expect(await screen.findByText(/Registration successful!/i)).toBeInTheDocument();
  });

  it("calls registerUser on valid submission as regular user", async () => {
    authApi.registerUser.mockResolvedValueOnce({});
    render(<RegisterForm switchToLogin={mockSwitchToLogin} isCurrentUserAdmin={false} />);
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Smith" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: "Password2!" } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: "Password2!" } });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => expect(authApi.registerUser).toHaveBeenCalledTimes(1));

    expect(authApi.registerUser).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        password: "Password2!",
        role: "regular",
      })
    );

    expect(await screen.findByText(/Registration successful!/i)).toBeInTheDocument();
  });

  it("does not show admin checkbox if user is not admin", () => {
    render(<RegisterForm switchToLogin={mockSwitchToLogin} isCurrentUserAdmin={false} />);
    expect(screen.queryByLabelText(/Register as Administrator/i)).not.toBeInTheDocument();
  });

  it("calls switchToLogin on clicking 'Go to Login' button", () => {
    render(<RegisterForm switchToLogin={mockSwitchToLogin} isCurrentUserAdmin={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Go to Login/i }));
    expect(mockSwitchToLogin).toHaveBeenCalledTimes(1);
  });

  it("shows error message if registerUser API throws an error", async () => {
    authApi.registerUser.mockRejectedValueOnce(new Error("API error"));
    render(<RegisterForm switchToLogin={mockSwitchToLogin} isCurrentUserAdmin={false} />);
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "Error" } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "error@test.com" } });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: "Password3!" } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: "Password3!" } });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/API error/i)).toBeInTheDocument();
  });
});
