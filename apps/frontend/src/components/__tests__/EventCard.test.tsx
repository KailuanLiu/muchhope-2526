import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EventCard from "../EventCard";

// Mock next/link since it requires Next.js context
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock CSS modules
vi.mock("../../styles/eventCard.module.css", () => ({
  default: new Proxy({}, { get: (_, prop) => prop as string }),
}));

const baseProps = {
  id: "123",
  title: "Beach Cleanup",
  date: "2026-06-01",
  time: "9:00 AM",
  location: "Santa Monica Beach",
  description: "Help clean up the beach!",
};

describe("EventCard", () => {
  it("renders the event title", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText("Beach Cleanup")).toBeInTheDocument();
  });

  it("renders an image when imageUrl is provided", () => {
    render(<EventCard {...baseProps} imageUrl="/event.jpg" />);
    const img = screen.getByAltText("Beach Cleanup");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/event.jpg");
  });

  it("renders a placeholder when no imageUrl is provided", () => {
    const { container } = render(<EventCard {...baseProps} />);
    expect(container.querySelector(".imagePlaceholder")).toBeInTheDocument();
  });

  it("links to the event detail page", () => {
    render(<EventCard {...baseProps} />);
    const link = screen.getByLabelText("View event details");
    expect(link).toHaveAttribute("href", "/Events/123");
  });

  it("calls onMoreInfo when More Info button is clicked", () => {
    const onMoreInfo = vi.fn();
    render(<EventCard {...baseProps} onMoreInfo={onMoreInfo} />);
    fireEvent.click(screen.getByText(/More Info/));
    expect(onMoreInfo).toHaveBeenCalledOnce();
  });

  it("hides More Info button when hideMoreInfo is true", () => {
    render(<EventCard {...baseProps} hideMoreInfo />);
    expect(screen.queryByText(/More Info/)).not.toBeInTheDocument();
  });

  it("shows Edit Event button when showEditButton is true", () => {
    render(<EventCard {...baseProps} showEditButton />);
    expect(screen.getByText("Edit Event")).toBeInTheDocument();
  });

  it("does not show Edit Event button by default", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.queryByText("Edit Event")).not.toBeInTheDocument();
  });

  it("calls onEdit when Edit Event button is clicked", () => {
    const onEdit = vi.fn();
    render(<EventCard {...baseProps} showEditButton onEdit={onEdit} />);
    fireEvent.click(screen.getByText("Edit Event"));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});
