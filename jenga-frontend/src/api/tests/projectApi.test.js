import {
  submitProject,
  saveProjectDraft,
  deleteProject,
  getProjectDetailsById,
  getProjectsByUserId
} from "../projectApi";

// Mock fetch and token
beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.setItem("token", "dummy-token");
});
afterEach(() => {
  jest.resetAllMocks();
});

test("submitProject returns data on success", async () => {
  const mockResponse = { success: true, id: 99 };
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse
  });
  const result = await submitProject({ name: "Demo" });
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/projects/submit"),
    expect.objectContaining({ method: "POST" })
  );
  expect(result).toEqual(mockResponse);
});

test("submitProject throws error when not ok", async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Bad request" })
  });
  await expect(submitProject({})).rejects.toThrow("Bad request");
});

test("saveProjectDraft returns ok: true and result", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ draftId: 101 })
  });
  const result = await saveProjectDraft({ name: "Draft" });
  expect(result).toEqual({ ok: true, draftId: 101 });
});

test("saveProjectDraft returns error on failure", async () => {
  fetch.mockRejectedValueOnce(new Error("Network error"));
  const result = await saveProjectDraft({ name: "Draft" });
  expect(result.ok).toBe(false);
  expect(result.error).toMatch(/Network error/);
});

test("deleteProject succeeds when ok", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
  });
  await expect(deleteProject(11)).resolves.toBeUndefined();
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/projects/11"), expect.any(Object));
});

test("deleteProject throws on failure", async () => {
  fetch.mockResolvedValueOnce({
    ok: false
  });
  await expect(deleteProject(11)).rejects.toThrow(/Failed to delete project/);
});

test("getProjectDetailsById returns project data", async () => {
  const mockProject = { project: { id: 1, name: "Proj" } };
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockProject
  });
  const details = await getProjectDetailsById(1);
  expect(details).toEqual(mockProject.project);
});

test("getProjectDetailsById throws on error", async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({})
  });
  await expect(getProjectDetailsById(1)).rejects.toThrow(/Failed to fetch project details/);
});

test("getProjectsByUserId returns projects array", async () => {
  const mockProjects = { projects: [{ id: 1 }, { id: 2 }] };
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockProjects
  });
  const projs = await getProjectsByUserId("u1");
  expect(Array.isArray(projs)).toBe(true);
  expect(projs.length).toBe(2);
});

test("getProjectsByUserId throws on error", async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({})
  });
  await expect(getProjectsByUserId("u1")).rejects.toThrow(/Failed to fetch user projects/);
});
