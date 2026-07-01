const { afterEach, describe, test, expect } = require("@jest/globals");

// Setup must run before requiring the app so the mock is in place
const { setupTestDB, clearTestDB } = require("./setup");
const { Event } = setupTestDB();

const request = require("supertest");
const app = require("../../../server");

afterEach(() => {
  clearTestDB();
});

// --- Helpers ---
const sampleEvent = (overrides = {}) => ({
  event_name: "Beach Cleanup",
  date: "2025-08-01",
  startTime: "9:00 AM",
  endTime: "11:00 AM",
  location: "Santa Cruz Beach",
  description: "Cleaning up the beach for the community.",
  volunteers: [],
  ...overrides,
});

describe("GET /events", () => {
  test("returns an empty array when no events exist", async () => {
    const res = await request(app).get("/events");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns all events", async () => {
    await Event.create(sampleEvent({ event_name: "Event A" }));
    await Event.create(sampleEvent({ event_name: "Event B" }));

    const res = await request(app).get("/events");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test("filters upcoming events", async () => {
    await Event.create(sampleEvent({ date: "2020-01-01", startTime: "10:00 AM" }));
    await Event.create(sampleEvent({ date: "2099-12-31", startTime: "10:00 AM", event_name: "Future" }));

    const res = await request(app).get("/events?timeframe=upcoming");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].event_name).toBe("Future");
  });

  test("filters past events", async () => {
    await Event.create(sampleEvent({ date: "2020-01-01", startTime: "10:00 AM", event_name: "Past" }));
    await Event.create(sampleEvent({ date: "2099-12-31", startTime: "10:00 AM" }));

    const res = await request(app).get("/events?timeframe=past");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].event_name).toBe("Past");
  });

  test("filters upcoming events using the date even when startTime is not a real time", async () => {
    // Legacy records may only have a display `time` string, so startTime is a
    // non-time value. The filter should fall back to the date alone.
    await Event.create(sampleEvent({ date: "2020-01-01", startTime: "n/a", event_name: "Legacy Past" }));
    await Event.create(sampleEvent({ date: "2099-12-31", startTime: "n/a", event_name: "Legacy Future" }));

    const res = await request(app).get("/events?timeframe=upcoming");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].event_name).toBe("Legacy Future");
  });

  test("returns all events when no timeframe is specified", async () => {
    await Event.create(sampleEvent({ date: "2020-01-01", startTime: "10:00 AM" }));
    await Event.create(sampleEvent({ date: "2099-12-31", startTime: "10:00 AM" }));

    const res = await request(app).get("/events");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /events", () => {
  test("creates an event when requester is mainadmin", async () => {
    const res = await request(app).post("/events").set("x-user-role", "mainadmin").send(sampleEvent());

    expect(res.status).toBe(201);
    expect(res.body.event_name).toBe("Beach Cleanup");
    expect(res.body._id).toBeDefined();
  });

  test("rejects creation without a role header (401)", async () => {
    const res = await request(app).post("/events").send(sampleEvent());
    expect(res.status).toBe(401);
  });

  test("rejects creation from non-admin role (403)", async () => {
    const res = await request(app).post("/events").set("x-user-role", "volunteer").send(sampleEvent());

    expect(res.status).toBe(403);
  });

  test("returns 500 for invalid event data (missing required fields)", async () => {
    const res = await request(app).post("/events").set("x-user-role", "mainadmin").send({ event_name: "Incomplete" });

    expect(res.status).toBe(500);
  });
});

describe("PUT /events/:id", () => {
  test("updates an event when requester is mainadmin", async () => {
    const event = await Event.create(sampleEvent());

    const res = await request(app)
      .put(`/events/${event._id}`)
      .set("x-user-role", "mainadmin")
      .send({ event_name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.event_name).toBe("Updated Name");
  });

  test("returns 404 for non-existent event", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .put(`/events/${fakeId}`)
      .set("x-user-role", "mainadmin")
      .send({ event_name: "Nope" });

    expect(res.status).toBe(404);
  });

  test("rejects update from non-admin role (403)", async () => {
    const event = await Event.create(sampleEvent());

    const res = await request(app)
      .put(`/events/${event._id}`)
      .set("x-user-role", "event admin")
      .send({ event_name: "Hacked" });

    expect(res.status).toBe(403);
  });
});
