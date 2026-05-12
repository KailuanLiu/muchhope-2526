const { makeNewConnection } = require("../connection");
const volunteerSchema = require("./volunteerSchema");
const eventSchema = require("./eventSchema");
const shiftSchema = require("./shiftSchema");

let Volunteer, Event, Shift;

function getModels() {
  if (!Volunteer) {
    const volunteerConnection = makeNewConnection(process.env.volunteerDB);
    Volunteer = volunteerConnection.model("Volunteer", volunteerSchema);
  }
  if (!Event) {
    const eventConnection = makeNewConnection(process.env.eventDB);
    Event = eventConnection.model("Event", eventSchema);
  }
  if (!Shift) {
    const shiftConnection = makeNewConnection(process.env.shiftDB);
    Shift = shiftConnection.model("Shift", shiftSchema);
  }
  return { Volunteer, Event, Shift };
}

module.exports = { getModels };
