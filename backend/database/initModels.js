const { makeNewConnection } = require("../connection");
const volunteerSchema = require("./volunteerSchema");
const eventSchema = require("./eventSchema");

// const adminConnection = makeNewConnection(process.env.adminDB);
// const Admin = adminConnection.model("Admin", adminSchema);

const connection = makeNewConnection(process.env.MONGO_URI);

const Volunteer = connection.model("Volunteer", volunteerSchema);
const Event = connection.model("Event", eventSchema);

// module.exports = { Admin, Volunteer, Event };
module.exports = { Volunteer, Event };
