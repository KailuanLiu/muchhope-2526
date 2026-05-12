const { makeNewConnection } = require("../connection");
const volunteerSchema = require("./volunteerSchema");
const eventSchema = require("./eventSchema");
const shiftSchema = require("./shiftSchema");

let Volunteer, Event, Shift;
let eventConnection;

function getModels() {
  if (!Volunteer) {
    const volunteerConnection = makeNewConnection(process.env.volunteerDB);
    Volunteer = volunteerConnection.model("Volunteer", volunteerSchema);
  }
  if (!eventConnection) {
    eventConnection = makeNewConnection(process.env.eventDB);
  }
  if (!Event) {
    Event = eventConnection.model("Event", eventSchema);
  }
  if (!Shift) {
    Shift = eventConnection.model("Shift", shiftSchema);
  }
  return { Volunteer, Event, Shift };
}

module.exports = { getModels };
