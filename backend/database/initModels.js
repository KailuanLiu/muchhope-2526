const { makeNewConnection } = require("../connection");
const volunteerSchema = require("./volunteerSchema");
const eventSchema = require("./eventSchema");

const volunteerConnection = makeNewConnection(process.env.volunteerDB);
const Volunteer = volunteerConnection.model("Volunteer", volunteerSchema);

const eventConnection = makeNewConnection(process.env.eventDB);
const Event = eventConnection.model("Event", eventSchema);

module.exports = { Volunteer, Event };
