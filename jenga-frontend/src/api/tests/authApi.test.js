import { loginUser, registerUser, updateUserProfile, getAllUsers, deleteUserById } from '../authApi';

// Mock global fetch
beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.setItem("token", "fake-token"); // for functions that use token
});
afterEach(() => {
  jest.resetAllMocks();
});

test('loginUser returns data on success', async () => {
  const mockResponse = { id: 1, email: "test@mail.com" };
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse
  });
  const data = await loginUser("test@mail.com", "123");
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/login"), expect.any(Object));
  expect(data).toEqual(mockResponse);
});

test('loginUser throws error on failure', async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Invalid login" })
  });

  await expect(loginUser("wrong@mail.com", "bad")).rejects.toThrow("Invalid login");
});


test('registerUser throws error when not ok', async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Registration error" })
  });
  await expect(registerUser({})).rejects.toThrow(/Registration error/);
});

test('updateUserProfile handles raw text error', async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    text: async () => "Some plain error"
  });
  await expect(updateUserProfile({})).rejects.toThrow(/Some plain error/);
});

test('getAllUsers returns user array', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ users: [{ id: 1 }] })
  });
  const users = await getAllUsers();
  expect(Array.isArray(users)).toBe(true);
  expect(users[0].id).toBe(1);
});

test('deleteUserById throws error on failure', async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Delete failed" })
  });
  await expect(deleteUserById(123)).rejects.toThrow("Delete failed");
});
