jest.mock("react-markdown", () => () => <div />);
import { render, screen, waitFor } from "@testing-library/react";
import ProjectsDashboard from "../ProjectsDashboard";
import { AuthContext } from "../../../Router"; 

// Mock getProjectsByUserId API
jest.mock("../../../api/projectApi", () => ({
  getProjectsByUserId: jest.fn(),
}));
import { getProjectsByUserId } from "../../../api/projectApi";

// Mock ProjectCard so we only test dashboard logic
jest.mock("../../../components/projects/ProjectCard", () => ({ project, onDelete }) => (
  <div data-testid="project-card">{project.name}</div>
));

const userMock = { id: "u1", first_name: "Jane" };
function renderWithAuthContext(ui, user = userMock) {
  return render(
    <AuthContext.Provider value={{ user }}>
      {ui}
    </AuthContext.Provider>
  );
}

test("shows loading spinner initially", () => {
  // Block API with unresolved Promise to stay in loading state
  getProjectsByUserId.mockReturnValue(new Promise(() => {}));
  renderWithAuthContext(<ProjectsDashboard />);
  expect(screen.getByText(/loading projects/i)).toBeInTheDocument();
});

test("shows error if user is missing", () => {
  renderWithAuthContext(<ProjectsDashboard />, null);
  expect(screen.getByText(/user id not found/i)).toBeInTheDocument();
});

test("shows error message if API fails", async () => {
  getProjectsByUserId.mockRejectedValueOnce(new Error("API Error"));
  renderWithAuthContext(<ProjectsDashboard />);
  await waitFor(() => expect(screen.getByText(/could not load your projects/i)).toBeInTheDocument());
});

test("shows empty projects message if none exist", async () => {
  getProjectsByUserId.mockResolvedValueOnce([]);
  renderWithAuthContext(<ProjectsDashboard />);
  await waitFor(() =>
    expect(screen.getByText(/not created any projects/i)).toBeInTheDocument()
  );
});

test("renders ProjectCard for each project", async () => {
  getProjectsByUserId.mockResolvedValueOnce([
    { id: "p1", name: "Alpha" },
    { id: "p2", name: "Beta" },
  ]);
  renderWithAuthContext(<ProjectsDashboard />);
  await waitFor(() => expect(screen.getAllByTestId("project-card").length).toBe(2));
  expect(screen.getByText("Alpha")).toBeInTheDocument();
  expect(screen.getByText("Beta")).toBeInTheDocument();
});
