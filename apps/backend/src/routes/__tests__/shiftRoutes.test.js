const { afterEach, describe, test, expect } = require("@jest/globals");

const { setupTestDB, clearTestDB } = require("./setup");
const { Shift, Volunteer } = setupTestDB();

const request = require("supertest");
const app = require("../../../server");

afterEach(() => {
  clearTestDB();
});

const sampleShift = (overrides = {}) => ({
  eventId: "event_001",
  volunteerId: "vol_001",
  volunteerEmail: "volunteer@example.com",
  shiftType: "Cooking",
  shiftTime: "10:00 AM - 12:00 PM",
  date: "2099-06-15",
  ...overrides,
});

describe("GET /shifts", () => {
  test("returns 400 when neither email nor eventId is provided", async () => {
    const res = await request(app).get("/shifts");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email or eventId/i);
  });

  test("returns shifts filtered by email (upcoming only)", async () => {
    await Shift.create(sampleShift({ date: "2099-12-01" }));
    await Shift.create(sampleShift({ date: "2020-01-01" })); // past — should be excluded
    await Shift.create(sampleShift({ volunteerEmail: "other@example.com", date: "2099-12-01" }));

    const res = await request(app).get("/shifts?email=volunteer@example.com");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].volunteerEmail).toBe("volunteer@example.com");
    expect(res.body[0].date).toBe("2099-12-01");
  });

  test("returns shifts sorted by date ascending", async () => {
    await Shift.create(sampleShift({ date: "2099-12-31" }));
    await Shift.create(sampleShift({ date: "2099-06-01" }));
    await Shift.create(sampleShift({ date: "2099-09-15" }));

    const res = await request(app).get("/shifts?email=volunteer@example.com");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].date).toBe("2099-06-01");
    expect(res.body[1].date).toBe("2099-09-15");
    expect(res.body[2].date).toBe("2099-12-31");
  });

  test("returns all shifts for an event when eventId is provided", async () => {
    await Shift.create(sampleShift({ eventId: "event_A", shiftType: "Setup" }));
    await Shift.create(sampleShift({ eventId: "event_A", shiftType: "Cooking" }));
    await Shift.create(sampleShift({ eventId: "event_B", shiftType: "Serving" }));

    const res = await request(app).get("/shifts?eventId=event_A");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((s) => s.eventId === "event_A")).toBe(true);
  });

  test("enriches shifts with volunteer names when queried by eventId", async () => {
    await Volunteer.create({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phoneNumber: "5551234567",
      id: "vol_jane",
      userType: "volunteer",
      isAdult: true,
    });

    await Shift.create(sampleShift({ eventId: "event_X", volunteerEmail: "jane@example.com" }));

    const res = await request(app).get("/shifts?eventId=event_X");
    expect(res.status).toBe(200);
    expect(res.body[0].volunteerName).toBe("Jane Doe");
  });

  test("falls back to email when volunteer record not found", async () => {
    await Shift.create(sampleShift({ eventId: "event_Y", volunteerEmail: "unknown@example.com" }));

    const res = await request(app).get("/shifts?eventId=event_Y");
    expect(res.status).toBe(200);
    expect(res.body[0].volunteerName).toBe("unknown@example.com");
  });

  test("returns empty array when no shifts exist for eventId", async () => {
    const res = await request(app).get("/shifts?eventId=nonexistent");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /shifts", () => {
  test("creates a shift successfully", async () => {
    const res = await request(app).post("/shifts").send(sampleShift());
    expect(res.status).toBe(201);
    expect(res.body.shiftType).toBe("Cooking");
    expect(res.body._id).toBeDefined();
  });

  test("returns 500 when required fields are missing", async () => {
    const res = await request(app).post("/shifts").send({ eventId: "event_001" });
    expect(res.status).toBe(500);
  });
});

describe("DELETE /shifts/:id", () => {
  test("deletes an existing shift", async () => {
    const shift = await Shift.create(sampleShift());

    const res = await request(app).delete(`/shifts/${shift._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  test("returns 404 for non-existent shift", async () => {
    const res = await request(app).delete("/shifts/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
