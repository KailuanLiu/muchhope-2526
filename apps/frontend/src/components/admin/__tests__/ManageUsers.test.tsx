import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminVolunteersPage from "../ManageUsers";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/manage-users",
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Mock @clerk/nextjs
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    isSignedIn: true,
    isLoaded: true,
    sessionClaims: { metadata: { role: "admin" } },
  }),
  useClerk: () => ({ signOut: vi.fn() }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock CSS modules
vi.mock("@/styles/volunteers.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));
vi.mock("@/styles/adminnavbar.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));
vi.mock("@/styles/volunteernavbar.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));
vi.mock("@/styles/sidebar.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));
vi.mock("@/styles/landingPage.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));
vi.mock("@/styles/footer.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));
vi.mock("@/styles/navbar.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));
vi.mock("@/styles/volunteerprofilepopup.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockVolunteers = [
  { id: "1", firstName: "Alice", lastName: "Smith", role: "Admin", isAdult: true, clerkId: "user_alice" },
  { id: "2", firstName: "Bob", lastName: "Jones", role: "Volunteer", isAdult: true, clerkId: "user_bob" },
  { id: "3", firstName: "Charlie", lastName: "Brown", role: "Main Admin", isAdult: true, clerkId: "user_charlie" },
  { id: "4", firstName: "Diana", lastName: "Prince", role: "Volunteer", isAdult: false, clerkId: "user_diana" },
];

describe("ManageUsers (AdminVolunteersPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ volunteers: mockVolunteers }),
      text: async () => JSON.stringify({ volunteers: mockVolunteers }),
    });
  });

  it("renders the page title and subtitle", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Manage Users" })).toBeInTheDocument();
    });
    expect(screen.getByText("Manage members profiles, roles, and contact information.")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<AdminVolunteersPage />);
    expect(screen.getByText("Loading volunteers...")).toBeInTheDocument();
  });

  it("renders volunteers after loading", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
    expect(screen.getByText("Diana Prince")).toBeInTheDocument();
  });

  it("displays correct initials for volunteers", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("AS")).toBeInTheDocument(); // Alice Smith
    });
    expect(screen.getByText("BJ")).toBeInTheDocument(); // Bob Jones
    expect(screen.getByText("CB")).toBeInTheDocument(); // Charlie Brown
  });

  it("shows empty state when no volunteers exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ volunteers: [] }),
      text: async () => JSON.stringify({ volunteers: [] }),
    });

    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("No volunteers yet.")).toBeInTheDocument();
    });
  });

  it("renders the Add Member button", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Add Member")).toBeInTheDocument();
    });
  });

  it("renders breadcrumb navigation", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Manage Users" })).toBeInTheDocument();
    });

    const breadcrumbLink = screen.getByRole("link", { name: "Admin" });
    expect(breadcrumbLink).toHaveAttribute("href", "/admin");
  });

  it("renders role filter dropdown", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("All Roles")).toBeInTheDocument();
    });
  });

  it("renders age filter dropdown", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("All Age Group")).toBeInTheDocument();
    });
  });

  it("filters by role when role filter changes", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    const roleSelect = screen.getByDisplayValue("All Roles");
    fireEvent.change(roleSelect, { target: { value: "Admin" } });

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
    expect(screen.queryByText("Diana Prince")).not.toBeInTheDocument();
  });

  it("renders View Info button for each volunteer", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      const viewButtons = screen.getAllByText("View Info");
      expect(viewButtons.length).toBe(4);
    });
  });

  it("renders Delete button for each volunteer", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText("Delete");
      expect(deleteButtons.length).toBe(4);
    });
  });

  it("calls delete API when Delete button is clicked", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volunteers: mockVolunteers }),
        text: async () => JSON.stringify({ volunteers: mockVolunteers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ message: "Deleted" }),
      });

    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/volunteers?id=3", { method: "DELETE" });
    });
  });

  it("displays total member count", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      // The total count badge shows the number of all filtered members
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  it("renders a Promote button for volunteers", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });

    const promoteButtons = screen.getAllByText("Promote");
    // Bob and Diana are both regular volunteers
    expect(promoteButtons.length).toBe(2);
  });

  it("renders a Demote button for admins", async () => {
    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    // Only Alice is a regular Admin (Charlie is Main Admin and shouldn't have a demote button)
    const demoteButtons = screen.getAllByText("Demote");
    expect(demoteButtons.length).toBe(1);
  });

  it("calls promote API when Promote button is clicked", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volunteers: mockVolunteers }),
        text: async () => JSON.stringify({ volunteers: mockVolunteers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, promoted: "user_bob" }),
      });

    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });

    const promoteButtons = screen.getAllByText("Promote");
    fireEvent.click(promoteButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_bob" }),
      });
    });
  });

  it("calls demote API when Demote button is clicked", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volunteers: mockVolunteers }),
        text: async () => JSON.stringify({ volunteers: mockVolunteers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, demoted: "user_alice" }),
      });

    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    const demoteButtons = screen.getAllByText("Demote");
    fireEvent.click(demoteButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/admin/demote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_alice" }),
      });
    });
  });

  it("shows an error when trying to change role of a user without clerkId", async () => {
    const volunteersWithoutClerkId = [
      { id: "5", firstName: "Eve", lastName: "Adams", role: "Volunteer", isAdult: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ volunteers: volunteersWithoutClerkId }),
      text: async () => JSON.stringify({ volunteers: volunteersWithoutClerkId }),
    });

    render(<AdminVolunteersPage />);

    await waitFor(() => {
      expect(screen.getByText("Eve Adams")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Promote"));

    await waitFor(() => {
      expect(screen.getByText(/has not signed in yet/i)).toBeInTheDocument();
    });
  });
});
