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
    phoneNumber: "5551234567",
    isAdult: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with initial data", () => {
    render(<AdminProfile initialData={initialData} />);

    expect(screen.getByLabelText("First Name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Phone Number")).toHaveValue("(555) 123-4567");
  });

  it("renders age status radio buttons with correct initial selection", () => {
    render(<AdminProfile initialData={initialData} />);

    const adultRadio = screen.getByLabelText("18 and up") as HTMLInputElement;
    const minorRadio = screen.getByLabelText("Under 18") as HTMLInputElement;

    expect(adultRadio.checked).toBe(true);
    expect(minorRadio.checked).toBe(false);
  });

  it("updates first name on input change", () => {
    render(<AdminProfile initialData={initialData} />);

    const input = screen.getByLabelText("First Name");
    fireEvent.change(input, { target: { name: "firstName", value: "John" } });
    expect(input).toHaveValue("John");
  });

  it("formats phone number as user types", () => {
    render(<AdminProfile initialData={initialData} />);

    const input = screen.getByLabelText("Phone Number");
    fireEvent.change(input, { target: { value: "9876543210" } });
    expect(input).toHaveValue("(987) 654-3210");
  });

  it("shows error when submitting with empty fields", async () => {
    render(<AdminProfile initialData={{ ...initialData, firstName: "" }} />);

    // Clear the field to ensure it's empty (bypass native required)
    const firstNameInput = screen.getByLabelText("First Name");
    fireEvent.change(firstNameInput, { target: { name: "firstName", value: "" } });

    const form = screen.getByRole("button", { name: "Save" }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    });
  });

  it("shows error for invalid phone number", async () => {
    render(<AdminProfile initialData={{ ...initialData, phoneNumber: "123" }} />);

    fireEvent.click(screen.getByText("Save"));

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
    fireEvent.click(screen.getByText("Save"));

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
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("shows generic error on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<AdminProfile initialData={initialData} />);
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Failed to update profile. Please try again later.")).toBeInTheDocument();
    });
  });

  it("resets form to original data on Cancel", () => {
    render(<AdminProfile initialData={initialData} />);

    const input = screen.getByLabelText("First Name");
    fireEvent.change(input, { target: { name: "firstName", value: "Changed" } });
    expect(input).toHaveValue("Changed");

    fireEvent.click(screen.getByText("Cancel"));
    expect(input).toHaveValue("Jane");
  });

  it("disables buttons while submitting", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves

    render(<AdminProfile initialData={initialData} />);
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeDisabled();
      expect(screen.getByText("Cancel")).toBeDisabled();
    });
  });

  it("changes age status when radio button is clicked", () => {
    render(<AdminProfile initialData={initialData} />);

    const minorRadio = screen.getByLabelText("Under 18") as HTMLInputElement;
    fireEvent.click(minorRadio);

    expect(minorRadio.checked).toBe(true);
  });
});
