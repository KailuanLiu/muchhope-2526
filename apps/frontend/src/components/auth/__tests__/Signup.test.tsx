import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Signup from "../Signup";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock AuthLayout to just render children
vi.mock("@/app/AuthLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-layout">{children}</div>,
}));

describe("Signup", () => {
  const mockSignUp = {
    create: vi.fn(),
    prepareEmailAddressVerification: vi.fn(),
    attemptEmailAddressVerification: vi.fn(),
  };
  const mockSetActive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the signup form", () => {
    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

    expect(screen.getByText("Sign up")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("button is not disabled when isLoaded is false", () => {
    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={false} />);

    const button = screen.getByRole("button", { name: "Sign Up" });
    expect(button).not.toBeDisabled();
  });

  it("shows error when isLoaded is false and form is submitted", async () => {
    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={false} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Password123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText("Auth is still loading. Please try again in a moment.")).toBeInTheDocument();
    });

    expect(mockSignUp.create).not.toHaveBeenCalled();
  });

  it("shows error when passwords do not match", async () => {
    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Different456!" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });

    expect(mockSignUp.create).not.toHaveBeenCalled();
  });

  it("calls signUp.create and prepareEmailAddressVerification on successful submit", async () => {
    mockSignUp.create.mockResolvedValue({});
    mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Password123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockSignUp.create).toHaveBeenCalledWith({
        emailAddress: "john@example.com",
        password: "Password123!",
        firstName: "John",
      });
    });

    expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
      strategy: "email_code",
    });
  });

  it("shows verification code form after successful signup", async () => {
    mockSignUp.create.mockResolvedValue({});
    mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Password123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText("Verify your email")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("Enter 6-digit code")).toBeInTheDocument();
    expect(screen.getByText(/A verification code has been sent to/)).toBeInTheDocument();
  });

  it("handles email verification successfully", async () => {
    mockSignUp.create.mockResolvedValue({});
    mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});
    mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
      status: "complete",
      createdSessionId: "session_123",
    });
    mockSetActive.mockResolvedValue({});

    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

    // Fill and submit signup form
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    // Wait for verification form
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter 6-digit code")).toBeInTheDocument();
    });

    // Enter 6-digit code and verify
    fireEvent.change(screen.getByPlaceholderText("Enter 6-digit code"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

    await waitFor(() => {
      expect(mockSignUp.attemptEmailAddressVerification).toHaveBeenCalledWith({ code: "123456" });
    });

    expect(mockSetActive).toHaveBeenCalledWith({ session: "session_123" });
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("shows error when signUp.create fails with known error code", async () => {
    mockSignUp.create.mockRejectedValue({
      errors: [{ code: "form_identifier_exists", longMessage: "", message: "" }],
    });

    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "existing@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Password123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(
        screen.getByText("An account with this email already exists. Try signing in instead."),
      ).toBeInTheDocument();
    });
  });

  it("shows error when verification code is incorrect", async () => {
    mockSignUp.create.mockResolvedValue({});
    mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});
    mockSignUp.attemptEmailAddressVerification.mockRejectedValue({
      errors: [{ code: "form_code_incorrect", longMessage: "", message: "" }],
    });

    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

    // Submit signup
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    // Wait for verification form
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter 6-digit code")).toBeInTheDocument();
    });

    // Submit wrong code
    fireEvent.change(screen.getByPlaceholderText("Enter 6-digit code"), { target: { value: "000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

    await waitFor(() => {
      expect(screen.getByText("The verification code is incorrect. Try again.")).toBeInTheDocument();
    });
  });

  it("shows submitting state while form is processing", async () => {
    // Make create hang so we can observe the loading state
    mockSignUp.create.mockImplementation(() => new Promise(() => {}));

    render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Password123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Submitting..." })).toBeDisabled();
    });
  });
});
