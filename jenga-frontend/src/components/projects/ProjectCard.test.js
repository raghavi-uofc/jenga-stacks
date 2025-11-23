import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProjectCard from "./ProjectCard";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock deleteProject API
jest.mock("../../api/projectApi", () => ({
  deleteProject: jest.fn(),
}));
import { deleteProject } from "../../api/projectApi";

// Mock window.confirm
beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = jest.fn(() => true); // default to "OK"
});
afterEach(() => {
  window.confirm.mockReset();
});

const baseProject = {
  id: "101",
  name: "Test Project",
  status: "Draft",
  goalDescription: "Goal of the project is to write robust tests."
};
const onDeleteMock = jest.fn();

function renderCard(projectProps = {}) {
  return render(
    <ProjectCard project={{ ...baseProject, ...projectProps }} onDelete={onDeleteMock} />
  );
}

test("renders initial content and handles navigation", () => {
  renderCard();
  expect(screen.getByText("Test Project")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Test Project"));
  expect(mockNavigate).toHaveBeenCalledWith("/projects/101");
});

test("toggles menu, edits and deletes", async () => {
  renderCard();
  fireEvent.click(screen.getByRole("button", { name: "..." }));
  expect(screen.getByText("Edit")).toBeInTheDocument();
  expect(screen.getByText("Delete")).toBeInTheDocument();

  // Edit triggers navigation
  fireEvent.click(screen.getByText("Edit"));
  expect(mockNavigate).toHaveBeenCalledWith("/projects/101");

  // Delete: confirm shown, API called, callback triggered
  deleteProject.mockResolvedValueOnce({});
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(deleteProject).toHaveBeenCalledWith("101"));
  expect(onDeleteMock).toHaveBeenCalledWith("101");
});

test("shows deleting state when deleting", async () => {
  deleteProject.mockResolvedValueOnce({});
  renderCard();
  fireEvent.click(screen.getByRole("button", { name: "..." }));
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() =>
    expect(screen.getByText('Deleting "Test Project"...')).toBeInTheDocument()
  );
});

test("delete canceled by user", () => {
  window.confirm = jest.fn(() => false);
  renderCard();
  fireEvent.click(screen.getByRole("button", { name: "..." }));
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(deleteProject).not.toHaveBeenCalled();
  expect(onDeleteMock).not.toHaveBeenCalled();
});
