import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";

// Mock the db connection
vi.mock("lib/db", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock the Volunteer model
const mockFind = vi.fn();
const mockCreate = vi.fn();
const mockFindOneAndUpdate = vi.fn();
const mockFindOneAndDelete = vi.fn();

vi.mock("lib/VolunteerModel", () => ({
  Volunteer: {
    find: (...args: any[]) => ({ lean: () => mockFind(...args) }),
    create: (...args: any[]) => mockCreate(...args),
    findOneAndUpdate: (...args: any[]) => ({ lean: () => mockFindOneAndUpdate(...args) }),
    findOneAndDelete: (...args: any[]) => mockFindOneAndDelete(...args),
  },
}));

function createRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), options as any);
}

describe("GET /api/volunteers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a list of volunteers", async () => {
    mockFind.mockResolvedValue([
      { _id: "abc123", firstName: "Alice", lastName: "Smith", clerkId: "clerk_1", role: "Volunteer" },
      { _id: "def456", firstName: "Bob", lastName: "Jones", clerkId: "", role: "Admin" },
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.volunteers).toHaveLength(2);
    expect(data.volunteers[0].id).toBe("clerk_1"); // uses clerkId when available
    expect(data.volunteers[1].id).toBe("def456"); // falls back to _id
  });

  it("returns empty array when no volunteers exist", async () => {
    mockFind.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.volunteers).toEqual([]);
  });

  it("returns 500 when database fails", async () => {
    mockFind.mockRejectedValue(new Error("DB connection failed"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch volunteers");
  });
});

describe("POST /api/volunteers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a volunteer successfully", async () => {
    const newVolunteer = {
      _id: "new123",
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie@test.com",
      phoneNumber: "",
      clerkId: "clerk_new",
      userType: "Volunteer",
      isAdult: true,
      role: "Volunteer",
      toObject: () => ({
        _id: "new123",
        firstName: "Charlie",
        lastName: "Brown",
        email: "charlie@test.com",
        phoneNumber: "",
        clerkId: "clerk_new",
        userType: "Volunteer",
        isAdult: true,
        role: "Volunteer",
      }),
    };
    mockCreate.mockResolvedValue(newVolunteer);

    const req = createRequest("/api/volunteers", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Charlie",
        lastName: "Brown",
        email: "charlie@test.com",
        clerkId: "clerk_new",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.volunteer.firstName).toBe("Charlie");
    expect(data.volunteer.id).toBe("clerk_new");
  });

  it("returns 400 when firstName is missing", async () => {
    const req = createRequest("/api/volunteers", {
      method: "POST",
      body: JSON.stringify({ lastName: "Brown", email: "test@test.com" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("First name and last name are required.");
  });

  it("returns 400 when lastName is missing", async () => {
    const req = createRequest("/api/volunteers", {
      method: "POST",
      body: JSON.stringify({ firstName: "Charlie", email: "test@test.com" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("First name and last name are required.");
  });

  it("returns 400 when email is missing (skipped - email now optional)", async () => {
    const created = {
      _id: "xyz",
      firstName: "Charlie",
      lastName: "Brown",
      email: "",
      phoneNumber: "",
      clerkId: "",
      userType: "Volunteer",
      isAdult: true,
      role: "Volunteer",
      toObject() {
        return { ...this, toObject: undefined };
      },
    };
    mockCreate.mockResolvedValue(created);

    const req = createRequest("/api/volunteers", {
      method: "POST",
      body: JSON.stringify({ firstName: "Charlie", lastName: "Brown" }),
    });

    const response = await POST(req);
    // Email is optional now, so this should succeed
    expect(response.status).toBe(201);
  });

  it("returns 500 when database create fails", async () => {
    mockCreate.mockRejectedValue(new Error("Duplicate key"));

    const req = createRequest("/api/volunteers", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Charlie",
        lastName: "Brown",
        email: "charlie@test.com",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Duplicate key");
  });

  it("uses default values for optional fields", async () => {
    const created = {
      _id: "xyz",
      firstName: "Diana",
      lastName: "Prince",
      email: "diana@test.com",
      phoneNumber: "",
      clerkId: "",
      userType: "Volunteer",
      isAdult: true,
      role: "Volunteer",
      toObject() {
        return { ...this, toObject: undefined };
      },
    };
    mockCreate.mockResolvedValue(created);

    const req = createRequest("/api/volunteers", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Diana",
        lastName: "Prince",
        email: "diana@test.com",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    expect(mockCreate).toHaveBeenCalledWith({
      firstName: "Diana",
      lastName: "Prince",
      email: "diana@test.com",
      phoneNumber: "",
      clerkId: "",
      userType: "Volunteer",
      isAdult: true,
      role: "Volunteer",
    });
  });
});

describe("PUT /api/volunteers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a volunteer successfully", async () => {
    mockFindOneAndUpdate.mockResolvedValue({
      _id: "abc123",
      firstName: "Alice",
      lastName: "Updated",
      clerkId: "clerk_1",
      role: "Admin",
    });

    const req = createRequest("/api/volunteers?id=clerk_1", {
      method: "PUT",
      body: JSON.stringify({ lastName: "Updated", role: "Admin" }),
    });

    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.volunteer.lastName).toBe("Updated");
    expect(data.volunteer.id).toBe("clerk_1");
  });

  it("returns 400 when id is missing", async () => {
    const req = createRequest("/api/volunteers", {
      method: "PUT",
      body: JSON.stringify({ lastName: "Updated" }),
    });

    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Volunteer id is required.");
  });

  it("returns 404 when volunteer not found", async () => {
    mockFindOneAndUpdate.mockResolvedValue(null);

    const req = createRequest("/api/volunteers?id=nonexistent", {
      method: "PUT",
      body: JSON.stringify({ lastName: "Updated" }),
    });

    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Volunteer not found");
  });

  it("returns 500 when database update fails", async () => {
    mockFindOneAndUpdate.mockRejectedValue(new Error("DB error"));

    const req = createRequest("/api/volunteers?id=clerk_1", {
      method: "PUT",
      body: JSON.stringify({ lastName: "Updated" }),
    });

    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to update volunteer");
  });
});

describe("DELETE /api/volunteers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a volunteer successfully", async () => {
    mockFindOneAndDelete.mockResolvedValue({ _id: "abc123", clerkId: "clerk_1" });

    const req = createRequest("/api/volunteers?id=clerk_1", {
      method: "DELETE",
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Volunteer deleted successfully");
  });

  it("returns 400 when id is missing", async () => {
    const req = createRequest("/api/volunteers", {
      method: "DELETE",
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Volunteer id is required.");
  });

  it("returns 404 when volunteer not found", async () => {
    mockFindOneAndDelete.mockResolvedValue(null);

    const req = createRequest("/api/volunteers?id=nonexistent", {
      method: "DELETE",
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Volunteer not found");
  });

  it("returns 500 when database delete fails", async () => {
    mockFindOneAndDelete.mockRejectedValue(new Error("DB error"));

    const req = createRequest("/api/volunteers?id=clerk_1", {
      method: "DELETE",
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to delete volunteer");
  });
});
