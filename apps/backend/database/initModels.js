const { makeNewConnection } = require("../connection");
const volunteerSchema = require("./volunteerSchema");
const eventSchema = require("./eventSchema");

let Volunteer, Event;

function getModels() {
  if (!Volunteer) {
    const volunteerConnection = makeNewConnection(process.env.volunteerDB);
    Volunteer = volunteerConnection.model("Volunteer", volunteerSchema);
  }
  if (!Event) {
    const eventConnection = makeNewConnection(process.env.eventDB);
    Event = eventConnection.model("Event", eventSchema);
  }
  return { Volunteer, Event };
}

module.exports = { getModels };
