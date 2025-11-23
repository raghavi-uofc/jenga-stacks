import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterForm from "../RegisterForm"; 

// Mock registerUser API
jest.mock("../../../api/authApi", () => ({
  registerUser: jest.fn(),
}));
import { registerUser } from "../../../api/authApi";

function fillForm() {
  fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: "Jane" } });
  fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: "Smith" } });
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "jane@mail.com" } });
  fireEvent.change(screen.getByPlaceholderText(/^password$/i), { target: { value: "abc123" } });
  fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: "abc123" } });
}

test("renders all input fields and buttons", () => {
  const switchToLogin = jest.fn();
  render(<RegisterForm switchToLogin={switchToLogin} />);
  expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /go to login/i })).toBeInTheDocument();
});

test("displays error if passwords do not match and does not call API", () => {
  render(<RegisterForm switchToLogin={jest.fn()} />);
  fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: "Jane" } });
  fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: "Smith" } });
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "jane@mail.com" } });
  fireEvent.change(screen.getByPlaceholderText(/^password$/i), { target: { value: "abc123" } });
  fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: "no-match" } });
  fireEvent.click(screen.getByRole("button", { name: "Register" }));
  expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  expect(registerUser).not.toHaveBeenCalled();
});

test("can toggle admin checkbox", () => {
  render(<RegisterForm switchToLogin={jest.fn()} />);
  const checkbox = screen.getByLabelText(/administrator/i);
  expect(checkbox).not.toBeChecked();
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();
});

test("calls registerUser with correct data and shows success", async () => {
  registerUser.mockResolvedValueOnce({});
  render(<RegisterForm switchToLogin={jest.fn()} />);
  fillForm();
  fireEvent.click(screen.getByLabelText(/administrator/i)); // admin checked
  fireEvent.click(screen.getByRole("button", { name: "Register" }));
  await waitFor(() => expect(registerUser).toHaveBeenCalledWith(expect.objectContaining({
    first_name: "Jane",
    email: "jane@mail.com",
    role: "admin"
  })));
  await waitFor(() =>
    expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
  );
});

test("shows API error message if registration fails", async () => {
  registerUser.mockRejectedValueOnce(new Error("API failed"));
  render(<RegisterForm switchToLogin={jest.fn()} />);
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: "Register" }));
  await waitFor(() =>
    expect(screen.getByText(/API failed/i)).toBeInTheDocument()
  );
});

test("calls switchToLogin when 'Go to Login' is clicked", () => {
  const switchToLogin = jest.fn();
  render(<RegisterForm switchToLogin={switchToLogin} />);
  fireEvent.click(screen.getByRole("button", { name: /go to login/i }));
  expect(switchToLogin).toHaveBeenCalled();
});
