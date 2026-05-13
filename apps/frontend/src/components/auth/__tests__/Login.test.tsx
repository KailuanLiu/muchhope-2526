import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../Login";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock AuthLayout to just render children
vi.mock("@/app/AuthLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-layout">{children}</div>,
}));

// Mock Clerk hooks
const mockSignInCreate = vi.fn();
const mockSetActive = vi.fn();

let mockAuthState = { isSignedIn: false, isLoaded: true };
let mockSignIn: any = { create: mockSignInCreate };

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => mockAuthState,
  useClerk: () => ({ setActive: mockSetActive }),
}));

vi.mock("@clerk/nextjs/legacy", () => ({
  useSignIn: () => ({ signIn: mockSignIn }),
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = { isSignedIn: false, isLoaded: true };
    mockSignIn = { create: mockSignInCreate };

    // Mock window.location
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });
  });

  it("renders the login form", () => {
    render(<Login />);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("renders links to forgot password and signup", () => {
    render(<Login />);

    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("renders nothing when auth is not loaded", () => {
    mockAuthState = { isSignedIn: false, isLoaded: false };

    const { container } = render(<Login />);
    expect(container.innerHTML).toBe("");
  });

  it("redirects to home when already signed in", () => {
    mockAuthState = { isSignedIn: true, isLoaded: true };

    const { container } = render(<Login />);
    expect(container.innerHTML).toBe("");
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows error when signIn is not loaded and form is submitted", async () => {
    mockSignIn = null;

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Authentication is still loading. Please try again.")).toBeInTheDocument();
    });
  });

  it("updates form fields on input change", () => {
    render(<Login />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });

    expect(emailInput.value).toBe("user@test.com");
    expect(passwordInput.value).toBe("mypassword");
  });

  it("calls signIn.create with correct credentials on submit", async () => {
    mockSignInCreate.mockResolvedValue({
      status: "complete",
      createdSessionId: "session_abc",
    });
    mockSetActive.mockResolvedValue({});

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "user@test.com",
        password: "Password123!",
      });
    });
  });

  it("sets active session and redirects on successful login", async () => {
    mockSignInCreate.mockResolvedValue({
      status: "complete",
      createdSessionId: "session_abc",
    });
    mockSetActive.mockResolvedValue({});

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledWith({ session: "session_abc" });
    });

    expect(window.location.href).toBe("/");
  });

  it("shows error when sign-in status is not complete", async () => {
    mockSignInCreate.mockResolvedValue({
      status: "needs_second_factor",
      createdSessionId: null,
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Sign-in could not be completed. Please try again.")).toBeInTheDocument();
    });
  });

  it("shows error message from Clerk on failed login", async () => {
    mockSignInCreate.mockRejectedValue({
      errors: [{ message: "Invalid password" }],
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid password")).toBeInTheDocument();
    });
  });

  it("shows generic error when Clerk error has no message", async () => {
    mockSignInCreate.mockRejectedValue({
      errors: [{}],
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("An error occurred during sign in. Please try again.")).toBeInTheDocument();
    });
  });

  it("redirects to home when user is already signed in (error message)", async () => {
    mockSignInCreate.mockRejectedValue({
      errors: [{ message: "You are already signed in" }],
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
