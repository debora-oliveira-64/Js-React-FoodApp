import { renderHook, act } from "@testing-library/react-hooks";
import { useUserDetails } from "../hooks/useUserDetails";
import { useAuth } from "../components/contexts/authContext";

jest.mock("../components/contexts/authContext");

describe("useUserDetails", () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch user details successfully when userId is available", async () => {
    useAuth.mockReturnValue({ userId: "123", loading: false });
    const mockUserData = { id: "123", name: "John Doe", email: "johndoe@example.com" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    const { result, waitForNextUpdate } = renderHook(() => useUserDetails());

    expect(result.current.loadingDetails).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loadingDetails).toBe(false);
    expect(result.current.userDetails).toEqual(mockUserData);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith("/users/123", {
      method: "GET",
      credentials: "include",
    });
  });

  it("should handle fetch errors correctly", async () => {
    useAuth.mockReturnValue({ userId: "123", loading: false });

    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const { result, waitForNextUpdate } = renderHook(() => useUserDetails());

    expect(result.current.loadingDetails).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loadingDetails).toBe(false);
    expect(result.current.userDetails).toBe(null);
    expect(result.current.error).toBe("Could not load user details");
  });

  it("should skip fetch when authLoading is true", () => {
    useAuth.mockReturnValue({ userId: "123", loading: true });

    const { result } = renderHook(() => useUserDetails());

    expect(result.current.userDetails).toBe(null);
    expect(result.current.loadingDetails).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should skip fetch when userId is not available", () => {
    useAuth.mockReturnValue({ userId: null, loading: false });

    const { result } = renderHook(() => useUserDetails());

    expect(result.current.userDetails).toBe(null);
    expect(result.current.loadingDetails).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
