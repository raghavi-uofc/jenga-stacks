import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProjectForm from "../ProjectForm";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock APIs
jest.mock("../../../api/projectApi", () => ({
  saveProjectDraft: jest.fn(),
  submitProject: jest.fn(),
}));
import { saveProjectDraft, submitProject } from "../../../api/projectApi";

// Mock SuggestionsArea (since it may use react-markdown, which can cause Jest ESM errors)
jest.mock("../SuggestionsArea", () => () => <div data-testid="suggestions-area" />);

function fillBaseFields() {
  fireEvent.change(screen.getByPlaceholderText(/project name/i), { target: { value: "Demo" } });
  fireEvent.change(screen.getByPlaceholderText(/project goal/i), { target: { value: "Improve AI" } });
  fireEvent.change(screen.getByPlaceholderText(/requirements/i), { target: { value: "Fast, Reliable" } });
  fireEvent.change(screen.getByPlaceholderText(/budget floor/i), { target: { value: "5000" } });
  fireEvent.change(screen.getByPlaceholderText(/budget ceiling/i), { target: { value: "10000" } });
  // Dates
  fireEvent.change(screen.getByPlaceholderText(/start date/i), { target: { value: "2025-12-01" } });
  fireEvent.change(screen.getByPlaceholderText(/end date/i), { target: { value: "2026-01-01" } });
  // First team member
  fireEvent.change(screen.getAllByPlaceholderText(/name\/role/i)[0], { target: { value: "Lead Developer" } });
  fireEvent.change(screen.getAllByPlaceholderText(/e.g., Python/i)[0], { target: { value: "Python" } });
  fireEvent.change(screen.getAllByPlaceholderText(/e.g., Django/i)[0], { target: { value: "Django" } });
}

test("renders all main fields and action buttons", () => {
  render(<ProjectForm />);
  expect(screen.getByPlaceholderText(/project name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/project goal/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/requirements/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /save as draft/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  expect(screen.getByTestId("suggestions-area")).toBeInTheDocument();
});

test("can add and remove team member rows", () => {
  render(<ProjectForm />);
  const addBtn = screen.getByRole("button", { name: /\+ add member/i });
  fireEvent.click(addBtn);
  expect(screen.getAllByPlaceholderText(/name\/role/i).length).toBe(2);
  const removeBtns = screen.getAllByRole("button", { name: "X" });
  fireEvent.click(removeBtns[0]);
  expect(screen.getAllByPlaceholderText(/name\/role/i).length).toBe(1);
});

test("handleSaveDraft calls API and navigates", async () => {
  saveProjectDraft.mockResolvedValueOnce({ ok: true, project_id: "123" });
  render(<ProjectForm />);
  fillBaseFields();
  fireEvent.click(screen.getByRole("button", { name: /save as draft/i }));
  await waitFor(() => expect(saveProjectDraft).toHaveBeenCalled());
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/projects/123"));
});

test("shows error alert on draft API failure", async () => {
  window.alert = jest.fn();
  saveProjectDraft.mockResolvedValueOnce({ ok: false, error: "Save failed" });
  render(<ProjectForm />);
  fillBaseFields();
  fireEvent.click(screen.getByRole("button", { name: /save as draft/i }));
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Error: Save failed"));
});

test("handleSubmit calls API and navigates", async () => {
  submitProject.mockResolvedValueOnce({ project_id: "456", llm_response: "LLM" });
  render(<ProjectForm />);
  fillBaseFields();
  fireEvent.click(screen.getByRole("button", { name: /submit/i }));
  await waitFor(() => expect(submitProject).toHaveBeenCalled());
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/projects/456"));
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Project submitted successfully!"));
});
