/**
 * Test setup that mocks the database layer using in-memory arrays.
 * No external MongoDB binary needed.
 */

const mongoose = require("mongoose");

// In-memory stores
let events = [];
let volunteers = [];
let shifts = [];

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

// --- Fake document class ---
class FakeDocument {
  constructor(data, collection) {
    Object.defineProperty(this, "_collection", { value: collection, enumerable: false, writable: true });
    if (!data._id) {
      data._id = generateId();
    }
    Object.assign(this, data);
    if (this.volunteers === undefined) this.volunteers = [];
    if (this.admins === undefined) this.admins = [];
  }

  async save() {
    const idx = this._collection.findIndex((item) => String(item._id) === String(this._id));
    if (idx >= 0) {
      this._collection[idx] = this;
    }
    return this;
  }

  toObject() {
    const obj = {};
    for (const key of Object.keys(this)) {
      obj[key] = this[key];
    }
    return obj;
  }

  toJSON() {
    return this.toObject();
  }
}

// --- Fake model factory ---
function createFakeModel(schemaDefinition, collection) {
  const FakeModel = {};

  FakeModel.create = async (data) => {
    for (const [key, def] of Object.entries(schemaDefinition)) {
      if (def && def.required && data[key] === undefined) {
        const err = new Error(`Validation failed: ${key}: Path \`${key}\` is required.`);
        err.name = "ValidationError";
        throw err;
      }
    }
    const doc = new FakeDocument({ ...data }, collection);
    collection.push(doc);
    return doc;
  };

  FakeModel.find = (query) => {
    let result;
    if (!query || Object.keys(query).length === 0) {
      result = [...collection];
    } else {
      result = collection.filter((item) => {
        return Object.entries(query).every(([key, value]) => {
          // Handle $in operator
          if (value && typeof value === "object" && value.$in) {
            return value.$in.includes(item[key]);
          }
          const keys = key.split(".");
          if (keys.length === 1) {
            return String(item[key]) === String(value);
          }
          const arrayField = item[keys[0]];
          if (Array.isArray(arrayField)) {
            return arrayField.some((sub) => String(sub[keys[1]]) === String(value));
          }
          return false;
        });
      });
    }

    return {
      lean: () => result.map((doc) => (doc.toObject ? doc.toObject() : { ...doc })),
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
      catch: (reject) => Promise.resolve(result).catch(reject),
    };
  };

  FakeModel.findById = async (id) => {
    return collection.find((item) => String(item._id) === String(id)) || null;
  };

  FakeModel.findOne = async (query) => {
    if (!query) return null;
    return (
      collection.find((item) => Object.entries(query).every(([key, value]) => String(item[key]) === String(value))) ||
      null
    );
  };

  FakeModel.findByIdAndUpdate = async (id, updates = {}) => {
    const idx = collection.findIndex((item) => String(item._id) === String(id));
    if (idx < 0) return null;
    Object.assign(collection[idx], updates);
    return collection[idx];
  };

  FakeModel.findByIdAndDelete = async (id) => {
    const idx = collection.findIndex((item) => String(item._id) === String(id));
    if (idx < 0) return null;
    const [removed] = collection.splice(idx, 1);
    return removed;
  };

  FakeModel.deleteMany = async () => {
    collection.length = 0;
  };

  return FakeModel;
}

// --- Schema definitions for validation ---
const EventSchemaDefinition = {
  event_name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
};

const VolunteerSchemaDefinition = {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  id: { type: String, required: true },
  userType: { type: String, required: true },
  isAdult: { type: Boolean, required: true },
};

const ShiftSchemaDefinition = {
  eventId: { type: String, required: true },
  volunteerId: { type: String, required: true },
  volunteerEmail: { type: String, required: true },
  shiftType: { type: String, required: true },
  shiftTime: { type: String, required: true },
  date: { type: String, required: true },
};

let Event, Volunteer, Shift;

function setupClerkMock() {
  if (typeof jest === "undefined") return;

  jest.doMock("@clerk/express", () => {
    const buildAuth = (req) => ({
      isAuthenticated: req.headers["x-test-authenticated"] !== "false",
      userId: req.headers["x-test-user-id"] || "test_user",
      sessionClaims: {
        metadata: {
          role: req.headers["x-user-role"] || "mainadmin",
        },
      },
    });

    return {
      clerkMiddleware: () => (req, res, next) => {
        req.auth = () => buildAuth(req);
        next();
      },
      getAuth: (req) => (req.auth ? req.auth() : buildAuth(req)),
    };
  });
}

function setupTestDB() {
  setupClerkMock();

  events = [];
  volunteers = [];
  shifts = [];

  Event = createFakeModel(EventSchemaDefinition, events);
  Volunteer = createFakeModel(VolunteerSchemaDefinition, volunteers);
  Shift = createFakeModel(ShiftSchemaDefinition, shifts);

  // Patch the cached initModels module so getModels() returns our fakes
  const initModels = require("../../../database/initModels");
  initModels.getModels = () => ({ Event, Volunteer, Shift });

  return { Event, Volunteer, Shift };
}

function clearTestDB() {
  events.length = 0;
  volunteers.length = 0;
  shifts.length = 0;
}

function teardownTestDB() {
  events = [];
  volunteers = [];
  shifts = [];
}

module.exports = { setupTestDB, teardownTestDB, clearTestDB };
