import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserManagementDashboard from "./UserManagementDashboard";

// Mock API functions
jest.mock("../../api/authApi", () => ({
  getAllUsers: jest.fn(),
  deleteUserById: jest.fn(),
}));

import { getAllUsers, deleteUserById } from "../../api/authApi";


// Mock window.confirm
beforeEach(() => {
  global.confirm = jest.fn(() => true); // default is confirmed
  getAllUsers.mockResolvedValue([
    { id: 1, email: "test1@mail.com", firstName: "John", lastName: "Doe" },
    { id: 2, email: "test2@mail.com", firstName: "Jane", lastName: "Smith" },
    // ...add as many users as needed for pagination
  ]);
  deleteUserById.mockResolvedValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders and loads users", async () => {
  render(<UserManagementDashboard />);
  expect(screen.getByText(/Loading users/)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText("test1@mail.com")).toBeInTheDocument());
  expect(screen.getByText("John Doe")).toBeInTheDocument();
  expect(screen.getByText("Jane Smith")).toBeInTheDocument();
});

test("filters users by search", async () => {
  render(<UserManagementDashboard />);
  await waitFor(() => expect(screen.getByText("John Doe")).toBeInTheDocument());
  const searchInput = screen.getByPlaceholderText(/search by name or email/i);
  fireEvent.change(searchInput, { target: { value: "Jane" } });
  expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  expect(screen.getByText("Jane Smith")).toBeInTheDocument();
});

test("shows error on API failure", async () => {
  getAllUsers.mockRejectedValueOnce(new Error("API Failed"));
  render(<UserManagementDashboard />);
  await waitFor(() => expect(screen.getByText(/Failed to load users/)).toBeInTheDocument());
});

test("deletes a user after confirmation", async () => {
  render(<UserManagementDashboard />);
  await waitFor(() => expect(screen.getByText("John Doe")).toBeInTheDocument());
  fireEvent.click(screen.getAllByText("⋮")[0]); // Open menu for first user
  await waitFor(() => expect(screen.getByText("Delete")).toBeInTheDocument());
  fireEvent.click(screen.getByText("Delete"));
  await waitFor(() => {
    expect(deleteUserById).toHaveBeenCalledWith(1);
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });
});

test("pagination controls work", async () => {
  getAllUsers.mockResolvedValue([
    ...Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      email: `user${i+1}@mail.com`,
      firstName: `First${i+1}`,
      lastName: `Last${i+1}`,
    })),
  ]);
  render(<UserManagementDashboard />);
  await waitFor(() => expect(screen.getByText("user1@mail.com")).toBeInTheDocument());
  expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  fireEvent.click(screen.getByText("Next"));
  expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
});
