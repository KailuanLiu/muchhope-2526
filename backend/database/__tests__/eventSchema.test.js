// __tests__/eventSchema.test.js

const { beforeAll, afterAll, afterEach, describe, test, expect } = require("@jest/globals");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { EventSchema } = require("../eventSchema.js");

const Event = mongoose.model("Event", EventSchema);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Event.deleteMany({});
});

// --- Valid event helper ---
const validEvent = () => ({
  event_name: "Food Drive",
  date: "2025-06-01",
  time: "10:00 AM",
  location: "San Jose Community Center",
  description: "Distributing meals to the homeless.",
  volunteers: [
    {
      name: "Alice",
      email: "alice@example.com",
      phoneNumber: "555-1234",
      isAdult: true,
    },
  ],
});

// test
describe("EventSchema", () => {
  test("saves a valid event successfully", async () => {
    const event = new Event(validEvent());
    const saved = await event.save();

    expect(saved._id).toBeDefined();
    expect(saved.event_name).toBe("Food Drive");
    expect(saved.volunteers).toHaveLength(1);
    expect(saved.volunteers[0].name).toBe("Alice");
  });

  test("saves an event with no volunteers (empty array)", async () => {
    const event = new Event({ ...validEvent(), volunteers: [] });
    const saved = await event.save();
    expect(saved.volunteers).toHaveLength(0);
  });

  test("saves an event with multiple volunteers", async () => {
    const event = new Event({
      ...validEvent(),
      volunteers: [
        { name: "Alice", email: "a@x.com", phoneNumber: "111", isAdult: true },
        { name: "Bob", email: "b@x.com", phoneNumber: "222", isAdult: false },
      ],
    });
    const saved = await event.save();
    expect(saved.volunteers).toHaveLength(2);
    expect(saved.volunteers[1].isAdult).toBe(false);
  });

  // --- Required field validation ---
  const requiredFields = ["event_name", "date", "time", "location", "description"];

  requiredFields.forEach((field) => {
    test(`rejects event missing required field: ${field}`, async () => {
      const data = validEvent();
      delete data[field];
      await expect(new Event(data).save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  // --- Required volunteer sub-fields ---
  const volunteerRequiredFields = ["name", "email", "phoneNumber", "isAdult"];

  volunteerRequiredFields.forEach((field) => {
    test(`rejects volunteer missing required field: ${field}`, async () => {
      const data = validEvent();
      delete data.volunteers[0][field];
      await expect(new Event(data).save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });
});
