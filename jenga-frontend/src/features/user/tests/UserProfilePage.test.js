jest.mock("react-markdown", () => () => <div />);
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserProfilePage from "../UserProfilePage";
import { AuthContext } from "../../../Router";

// Mock updateUserProfile API
jest.mock("../../../api/authApi", () => ({
  updateUserProfile: jest.fn(),
}));
import { updateUserProfile } from "../../../api/authApi";

// Mock Link component
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ to, ...props }) => <a href={to} {...props} />,
}));

const userMock = {
  email: "jane@mail.com",
  first_name: "Jane",
  last_name: "Doe",
  role: "user",
};

const loginMock = jest.fn();
function renderWithContext(user = userMock) {
  return render(
    <AuthContext.Provider value={{ user, login: loginMock }}>
      <UserProfilePage />
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("token", "abc");
});

test("renders profile page and form fields", () => {
  renderWithContext();
  expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/security verification/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  expect(screen.getByText(/projects dashboard/i)).toHaveAttribute("href", "/projects");
  expect(screen.getByText(/reset password/i)).toHaveAttribute("href", "/reset-password");
});

test("updates form field values", () => {
  renderWithContext();
  const firstNameInput = screen.getByPlaceholderText(/first name/i);
  fireEvent.change(firstNameInput, { target: { value: "Alice" } });
  expect(firstNameInput).toHaveValue("Alice");
});

test("shows error if required fields missing", async () => {
  renderWithContext();
  fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: "" } });
  fireEvent.change(screen.getByPlaceholderText(/security verification/i), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));
  await waitFor(() =>
    expect(screen.getByText(/required/i)).toBeInTheDocument()
  );
  expect(updateUserProfile).not.toHaveBeenCalled();
});

test("shows API error if save fails", async () => {
  updateUserProfile.mockResolvedValueOnce({ error: "Invalid password" });
  renderWithContext();
  fireEvent.change(screen.getByPlaceholderText(/security verification/i), { target: { value: "wrongpass" } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));
  await waitFor(() =>
    expect(screen.getByText(/invalid password/i)).toBeInTheDocument()
  );
});

test("shows success, resets password, updates context on valid save", async () => {
  updateUserProfile.mockResolvedValueOnce({ message: "Profile updated successfully" });
  renderWithContext();
  fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: "Alice" } });
  fireEvent.change(screen.getByPlaceholderText(/security verification/i), { target: { value: "mypassword" } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));
  await waitFor(() =>
    expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument()
  );
  expect(loginMock).toHaveBeenCalledWith(
    "abc",
    expect.objectContaining({ first_name: "Alice" })
  );
  expect(screen.getByPlaceholderText(/security verification/i)).toHaveValue("");
});
