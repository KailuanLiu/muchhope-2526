import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminProfile from "../AdminProfile";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

// Mock CSS modules
vi.mock("../../styles/adminprofile.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("AdminProfile", () => {
  const initialData = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phoneNumber: "5551234567",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders view mode by default with personal info", () => {
    render(<AdminProfile initialData={initialData} />);

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("(555) 123-4567")).toBeInTheDocument();
  });

  it("shows Edit button in view mode", () => {
    render(<AdminProfile initialData={initialData} />);
    expect(screen.getAllByText("Edit").length).toBeGreaterThan(0);
  });

  it("switches to edit mode when Edit is clicked", () => {
    render(<AdminProfile initialData={initialData} />);

    // Click the first Edit button (Personal Information section)
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
  });

  it("populates form fields with initial data in edit mode", () => {
    render(<AdminProfile initialData={initialData} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(screen.getByLabelText("First Name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
    expect(screen.getByLabelText("Phone Number")).toHaveValue("(555) 123-4567");
  });

  it("updates field values on input change", () => {
    render(<AdminProfile initialData={initialData} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const input = screen.getByLabelText("First Name");
    fireEvent.change(input, { target: { name: "firstName", value: "John" } });
    expect(input).toHaveValue("John");
  });

  it("formats phone number as user types", () => {
    render(<AdminProfile initialData={initialData} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const input = screen.getByLabelText("Phone Number");
    fireEvent.change(input, { target: { value: "9876543210" } });
    expect(input).toHaveValue("(987) 654-3210");
  });

  it("shows error when submitting with empty fields", async () => {
    render(<AdminProfile initialData={{ ...initialData, firstName: "" }} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const firstNameInput = screen.getByLabelText("First Name");
    fireEvent.change(firstNameInput, { target: { name: "firstName", value: "" } });

    const form = screen.getByText("Save").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    });
  });

  it("shows error for invalid phone number", async () => {
    render(<AdminProfile initialData={{ ...initialData, phoneNumber: "123" }} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const form = screen.getByText("Save").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid 10-digit phone number.")).toBeInTheDocument();
    });
  });

  it("submits form successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success" }),
    });

    render(<AdminProfile initialData={initialData} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const form = screen.getByText("Save").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument();
    });
  });

  it("shows error message on failed submission", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Server error" }),
    });

    render(<AdminProfile initialData={initialData} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const form = screen.getByText("Save").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("resets form to original data on Cancel", () => {
    render(<AdminProfile initialData={initialData} />);

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const input = screen.getByLabelText("First Name");
    fireEvent.change(input, { target: { name: "firstName", value: "Changed" } });
    expect(input).toHaveValue("Changed");

    fireEvent.click(screen.getByText("Cancel"));

    // Should go back to view mode with original data
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("renders About Me section", () => {
    render(<AdminProfile initialData={{ ...initialData, aboutMe: "Hello world" }} />);
    expect(screen.getByText("About Me")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders Security section", () => {
    render(<AdminProfile initialData={initialData} />);
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Change Password")).toBeInTheDocument();
  });
});
