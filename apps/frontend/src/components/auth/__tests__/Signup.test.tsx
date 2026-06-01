import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Signup from "../Signup";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock fetch for the POST /api/volunteers call after signup
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({}),
}) as any;

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
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
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

    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Password123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockSignUp.create).toHaveBeenCalledWith({
        emailAddress: "john@example.com",
        password: "Password123!",
        firstName: "John",
        lastName: "Smith",
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

    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
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
    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
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
    expect(mockPush).toHaveBeenCalledWith("/");
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
    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
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

  describe("full account creation and verification flow", () => {
    const userData = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      password: "SecurePass123!",
    };

    beforeEach(() => {
      mockSignUp.create.mockResolvedValue({});
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});
    });

    it("creates account with correct user data and sends verification email", async () => {
      render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

      fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: userData.firstName } });
      fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: userData.lastName } });
      fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: userData.email } });
      fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: userData.password } });
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: userData.password } });

      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      await waitFor(() => {
        expect(mockSignUp.create).toHaveBeenCalledTimes(1);
        expect(mockSignUp.create).toHaveBeenCalledWith({
          emailAddress: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
        });
      });

      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledTimes(1);
      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: "email_code",
      });
    });

    it("completes full flow: create account → verify email → activate session → redirect to home", async () => {
      const createdSessionId = "sess_new_user_abc123";
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: "complete",
        createdSessionId,
      });
      mockSetActive.mockResolvedValue({});

      render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

      // Step 1: Fill out signup form
      fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: userData.firstName } });
      fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: userData.lastName } });
      fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: userData.email } });
      fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: userData.password } });
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: userData.password } });
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      // Step 2: Verify account was created
      await waitFor(() => {
        expect(mockSignUp.create).toHaveBeenCalledWith({
          emailAddress: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
        });
      });

      // Step 3: Verify email verification was initiated
      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: "email_code",
      });

      // Step 4: Verification form appears
      await waitFor(() => {
        expect(screen.getByText("Verify your email")).toBeInTheDocument();
      });

      // Step 5: Submit verification code
      fireEvent.change(screen.getByPlaceholderText("Enter 6-digit code"), { target: { value: "789012" } });
      fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

      // Step 6: Verify the code was submitted
      await waitFor(() => {
        expect(mockSignUp.attemptEmailAddressVerification).toHaveBeenCalledTimes(1);
        expect(mockSignUp.attemptEmailAddressVerification).toHaveBeenCalledWith({ code: "789012" });
      });

      // Step 7: Session is activated with the new account's session
      expect(mockSetActive).toHaveBeenCalledTimes(1);
      expect(mockSetActive).toHaveBeenCalledWith({ session: createdSessionId });

      // Step 8: User is redirected to login page
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("account creation is called before verification — correct order of operations", async () => {
      const callOrder: string[] = [];
      mockSignUp.create.mockImplementation(() => {
        callOrder.push("create");
        return Promise.resolve({});
      });
      mockSignUp.prepareEmailAddressVerification.mockImplementation(() => {
        callOrder.push("prepareVerification");
        return Promise.resolve({});
      });
      mockSignUp.attemptEmailAddressVerification.mockImplementation(() => {
        callOrder.push("attemptVerification");
        return Promise.resolve({ status: "complete", createdSessionId: "sess_123" });
      });
      mockSetActive.mockImplementation(() => {
        callOrder.push("setActive");
        return Promise.resolve({});
      });

      render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

      fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: userData.firstName } });
      fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: userData.lastName } });
      fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: userData.email } });
      fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: userData.password } });
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: userData.password } });
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter 6-digit code")).toBeInTheDocument();
      });

      // Verify create happened before verification
      expect(callOrder).toEqual(["create", "prepareVerification"]);

      // Now verify
      fireEvent.change(screen.getByPlaceholderText("Enter 6-digit code"), { target: { value: "111111" } });
      fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

      await waitFor(() => {
        expect(callOrder).toEqual(["create", "prepareVerification", "attemptVerification", "setActive"]);
      });
    });

    it("verification fails but account was still created", async () => {
      mockSignUp.attemptEmailAddressVerification.mockRejectedValue({
        errors: [{ code: "form_code_incorrect", longMessage: "", message: "" }],
      });

      render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

      fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: userData.firstName } });
      fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: userData.lastName } });
      fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: userData.email } });
      fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: userData.password } });
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: userData.password } });
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      // Account was created successfully
      await waitFor(() => {
        expect(mockSignUp.create).toHaveBeenCalledWith({
          emailAddress: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
        });
      });

      // Verification email was sent
      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalled();

      // Enter wrong code
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter 6-digit code")).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText("Enter 6-digit code"), { target: { value: "000000" } });
      fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

      // Verification failed but account creation was still called
      await waitFor(() => {
        expect(screen.getByText("The verification code is incorrect. Try again.")).toBeInTheDocument();
      });

      // Account was created (create was called) even though verification failed
      expect(mockSignUp.create).toHaveBeenCalledTimes(1);
      // Session was NOT activated since verification failed
      expect(mockSetActive).not.toHaveBeenCalled();
      // User was NOT redirected
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("verification status is not complete — session is not activated", async () => {
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: "missing_requirements",
        createdSessionId: null,
      });

      render(<Signup signUp={mockSignUp} setActive={mockSetActive} isLoaded={true} />);

      fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: userData.firstName } });
      fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: userData.lastName } });
      fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: userData.email } });
      fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: userData.password } });
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: userData.password } });
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter 6-digit code")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText("Enter 6-digit code"), { target: { value: "123456" } });
      fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

      await waitFor(() => {
        expect(screen.getByText("Verification could not be completed. Please try again.")).toBeInTheDocument();
      });

      // Account was created
      expect(mockSignUp.create).toHaveBeenCalledTimes(1);
      // But session was not activated
      expect(mockSetActive).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
