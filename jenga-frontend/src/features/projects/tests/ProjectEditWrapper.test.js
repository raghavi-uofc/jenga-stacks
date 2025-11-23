import { render, screen, waitFor } from "@testing-library/react";
import ProjectEditWrapper from "../ProjectEditWrapper";

// Mock getProjectDetailsById
jest.mock("../../../api/projectApi", () => ({
  getProjectDetailsById: jest.fn(),
}));
import { getProjectDetailsById } from "../../../api/projectApi";

// Mock useParams to provide a project ID
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
}));

// Mock ProjectForm just to show it rendered
jest.mock("../ProjectForm", () => ({ initialData, isEditMode }) => (
  <div data-testid="project-form">
    PROJECT FORM LOADED
    <span data-testid="edit-mode">{isEditMode ? "Edit" : "New"}</span>
    <span data-testid="project-name">{initialData?.name}</span>
  </div>
));

test("shows loading while project is being fetched", async () => {
  getProjectDetailsById.mockReturnValue(new Promise(() => {})); // never resolves, stays loading
  render(<ProjectEditWrapper />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("renders ProjectForm when fetch succeeds", async () => {
  getProjectDetailsById.mockResolvedValueOnce({ id: "123", name: "Test Project" });
  render(<ProjectEditWrapper />);
  await waitFor(() => screen.getByTestId("project-form"));
  expect(screen.getByText(/PROJECT FORM LOADED/i)).toBeInTheDocument();
  expect(screen.getByTestId("edit-mode").textContent).toBe("Edit");
  expect(screen.getByTestId("project-name").textContent).toBe("Test Project");
});

test("shows error message when fetch fails", async () => {
  getProjectDetailsById.mockRejectedValueOnce(new Error("API Error!"));
  render(<ProjectEditWrapper />);
  await waitFor(() => screen.getByText(/api error/i));
  expect(screen.getByText(/api error/i)).toBeInTheDocument();
});
