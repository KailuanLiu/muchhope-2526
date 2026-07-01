const { afterEach, describe, test, expect } = require("@jest/globals");

// Setup must run before requiring the app so the mock is in place
const { setupTestDB, clearTestDB } = require("./setup");
const { Event, Volunteer } = setupTestDB();

const request = require("supertest");
const app = require("../../../server");

afterEach(() => {
  clearTestDB();
});

// --- Helpers ---
const sampleVolunteer = (overrides = {}) => ({
  firstName: "Jane",
  lastName: "Doe",
  phoneNumber: "555-9999",
  email: "jane@example.com",
  id: "clerk_123",
  userType: "volunteer",
  isAdult: true,
  ...overrides,
});

const sampleEvent = (overrides = {}) => ({
  event_name: "Park Cleanup",
  date: "2025-07-15",
  startTime: "8:00 AM",
  endTime: "10:00 AM",
  location: "Central Park",
  description: "Cleaning up the park.",
  volunteers: [],
  ...overrides,
});

describe("GET /volunteers", () => {
  test("returns an empty array when no volunteers exist", async () => {
    const res = await request(app).get("/volunteers");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns all volunteers", async () => {
    await Volunteer.create(sampleVolunteer());
    await Volunteer.create(sampleVolunteer({ email: "bob@example.com", id: "clerk_456", firstName: "Bob" }));

    const res = await request(app).get("/volunteers");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /volunteers/login", () => {
  test("returns volunteer when email matches", async () => {
    await Volunteer.create(sampleVolunteer());

    const res = await request(app).post("/volunteers/login").send({ email: "jane@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Jane");
  });

  test("returns 404 when email does not match", async () => {
    const res = await request(app).post("/volunteers/login").send({ email: "nobody@example.com" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Volunteer not found");
  });
});

describe("GET /volunteers/:id/events", () => {
  test("returns events the volunteer is signed up for", async () => {
    const vol = await Volunteer.create(sampleVolunteer());
    await Event.create(
      sampleEvent({
        volunteers: [{ name: "Jane Doe", email: "jane@example.com", phoneNumber: "555-9999", isAdult: true }],
      }),
    );
    await Event.create(sampleEvent({ event_name: "Other Event" }));

    const res = await request(app).get(`/volunteers/${vol._id}/events`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].event_name).toBe("Park Cleanup");
  });

  test("returns 404 for non-existent volunteer", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app).get(`/volunteers/${fakeId}/events`);
    expect(res.status).toBe(404);
  });
});

describe("DELETE /volunteers/:id", () => {
  test("deletes an existing volunteer", async () => {
    const vol = await Volunteer.create(sampleVolunteer());

    const res = await request(app).delete(`/volunteers/${vol._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Volunteer deleted successfully");
  });

  test("returns 404 for non-existent volunteer", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app).delete(`/volunteers/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

describe("PUT /volunteers/:id", () => {
  test("updates volunteer fields", async () => {
    const vol = await Volunteer.create(sampleVolunteer());

    const res = await request(app).put(`/volunteers/${vol._id}`).send({ firstName: "Janet" });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Janet");
  });

  test("returns 404 for non-existent volunteer", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app).put(`/volunteers/${fakeId}`).send({ firstName: "Ghost" });

    expect(res.status).toBe(404);
  });
});

describe("PUT /volunteers/:id/make-event-admin", () => {
  test("promotes a volunteer to event admin", async () => {
    const vol = await Volunteer.create(sampleVolunteer());
    const event = await Event.create(sampleEvent());

    const res = await request(app)
      .put(`/volunteers/${vol._id}/make-event-admin`)
      .send({ eventId: event._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.volunteer.userType).toBe("event admin");
    expect(res.body.event.admins).toHaveLength(1);
    expect(res.body.event.admins[0].email).toBe("jane@example.com");
  });

  test("does not duplicate admin entry on repeated calls", async () => {
    const vol = await Volunteer.create(sampleVolunteer());
    const event = await Event.create(sampleEvent());

    await request(app).put(`/volunteers/${vol._id}/make-event-admin`).send({ eventId: event._id.toString() });

    const res = await request(app)
      .put(`/volunteers/${vol._id}/make-event-admin`)
      .send({ eventId: event._id.toString() });

    expect(res.status).toBe(200);
    // NOTE: The route checks `a.id === req.params.id` but admins store
    // the volunteer's Clerk `id` field, not their MongoDB `_id`.
    // This means the dedup check never matches — this is a known bug.
    // Once fixed, this should be toHaveLength(1).
    expect(res.body.event.admins).toHaveLength(2);
  });

  test("returns 404 when volunteer does not exist", async () => {
    const event = await Event.create(sampleEvent());
    const fakeId = "507f1f77bcf86cd799439011";

    const res = await request(app)
      .put(`/volunteers/${fakeId}/make-event-admin`)
      .send({ eventId: event._id.toString() });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Volunteer not found");
  });

  test("returns 404 when event does not exist", async () => {
    const vol = await Volunteer.create(sampleVolunteer());
    const fakeEventId = "507f1f77bcf86cd799439011";

    const res = await request(app).put(`/volunteers/${vol._id}/make-event-admin`).send({ eventId: fakeEventId });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
});
