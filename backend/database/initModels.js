const { makeNewConnection } = require("../connection");
const adminSchema = require("./adminSchema");
const volunteerSchema = require("./volunteerSchema");
const eventSchema = require("./eventSchema");

const adminConnection = makeNewConnection(process.env.adminDB);
const Admin = adminConnection.model("Admin", adminSchema);

const volunteerConnection = makeNewConnection(process.env.volunteerDB);
const Volunteer = volunteerConnection.model("Volunteer", volunteerSchema);

const eventConnection = makeNewConnection(process.env.eventDB);
const Event = eventConnection.model("Event", eventSchema);

module.exports = { Admin, Volunteer, Event };
