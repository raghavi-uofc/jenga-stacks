import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "../ResetPassword"; 

// Mock resetPassword API
jest.mock("../../../api/authApi", () => ({
  resetPassword: jest.fn(),
}));
import { resetPassword } from "../../../api/authApi";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ to, ...props }) => <a href={to} {...props} />, // native anchor replacement
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("token", "dummy-token");
});

test("renders form, breadcrumbs, and button", () => {
  render(<ResetPassword />);
  expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  expect(screen.getByText("Profile")).toHaveAttribute("href", "/profile");
});

test("shows loading indicator while submitting", async () => {
  let resolver;
  resetPassword.mockImplementation(() => new Promise((r) => (resolver = r)));
  render(<ResetPassword />);
  fireEvent.change(screen.getByLabelText(/old password/i), { target: { value: "oldpass" } });
  fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "newpass" } });
  fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
  expect(screen.getByText(/resetting/i)).toBeInTheDocument();
  resolver();
  await waitFor(() => expect(screen.getByText(/reset password/i)).toBeInTheDocument());
});

test("successful password reset shows message and navigates", async () => {
  resetPassword.mockResolvedValueOnce({});
  render(<ResetPassword />);
  fireEvent.change(screen.getByLabelText(/old password/i), { target: { value: "oldpass" } });
  fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "newpass" } });
  fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

  await waitFor(() => expect(screen.getByText(/successfully/i)).toBeInTheDocument());
  // wait for navigation after 1.5s
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/projects"), { timeout: 2000 });
});

test("shows error when API fails", async () => {
  resetPassword.mockRejectedValueOnce(new Error("API failure"));
  render(<ResetPassword />);
  fireEvent.change(screen.getByLabelText(/old password/i), { target: { value: "badpass" } });
  fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "badnew" } });
  fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
  await waitFor(() => expect(screen.getByText(/api failure/i)).toBeInTheDocument());
});
