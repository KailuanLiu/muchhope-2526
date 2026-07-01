import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminNavbar from "../AdminNavbar";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/navigation
const mockPathname = vi.fn(() => "/admin");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

// Mock @clerk/nextjs
const mockSignOut = vi.fn();
vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ signOut: mockSignOut }),
}));

// Mock CSS modules
vi.mock("@/styles/adminnavbar.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));
vi.mock("@/styles/sidebar.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));

describe("AdminNavbar", () => {
  const defaultProps = {
    collapsed: false,
    setCollapsed: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/admin");
  });

  it("renders all navigation items", () => {
    render(<AdminNavbar {...defaultProps} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(screen.getByText("Manage Events")).toBeInTheDocument();
    expect(screen.getByText("Manage Users")).toBeInTheDocument();
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("renders correct links for each nav item", () => {
    render(<AdminNavbar {...defaultProps} />);

    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/admin");
    expect(screen.getByText("My Profile").closest("a")).toHaveAttribute("href", "/admin/profile");
    expect(screen.getByText("Manage Users").closest("a")).toHaveAttribute("href", "/admin/manage-users");
    // Manage Events is now a dropdown button, not a link
    expect(screen.getByText("Manage Events")).toBeInTheDocument();
  });

  it("expands Manage Events dropdown and shows sub-links", () => {
    render(<AdminNavbar {...defaultProps} />);
    fireEvent.click(screen.getByText("Manage Events"));
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("Past")).toBeInTheDocument();
    expect(screen.getByText("Upcoming").closest("a")).toHaveAttribute("href", "/Events/Upcoming");
    expect(screen.getByText("Past").closest("a")).toHaveAttribute("href", "/Events/PastEvents");
  });

  it("renders the logo when not collapsed", () => {
    render(<AdminNavbar {...defaultProps} collapsed={false} />);
    expect(screen.getByAltText("Much Hope")).toBeInTheDocument();
  });

  it("hides the logo when collapsed", () => {
    render(<AdminNavbar {...defaultProps} collapsed={true} />);
    expect(screen.queryByAltText("Much Hope")).not.toBeInTheDocument();
  });

  it("calls setCollapsed when toggle button is clicked", () => {
    const setCollapsed = vi.fn();
    render(<AdminNavbar collapsed={false} setCollapsed={setCollapsed} />);

    fireEvent.click(screen.getByLabelText("Toggle sidebar"));
    expect(setCollapsed).toHaveBeenCalledWith(true);
  });

  it("toggles from collapsed to expanded", () => {
    const setCollapsed = vi.fn();
    render(<AdminNavbar collapsed={true} setCollapsed={setCollapsed} />);

    fireEvent.click(screen.getByLabelText("Toggle sidebar"));
    expect(setCollapsed).toHaveBeenCalledWith(false);
  });

  it("renders the Sign Out button", () => {
    render(<AdminNavbar {...defaultProps} />);
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("calls signOut when Sign Out button is clicked", async () => {
    render(<AdminNavbar {...defaultProps} />);
    fireEvent.click(screen.getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/auth/login" });
  });

  it("applies active class to current route", () => {
    mockPathname.mockReturnValue("/admin/profile");
    render(<AdminNavbar {...defaultProps} />);

    const profileLink = screen.getByText("My Profile").closest("a");
    expect(profileLink?.className).toContain("active");
  });
});
