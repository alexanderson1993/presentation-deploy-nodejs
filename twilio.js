var twilio = require("twilio");
var client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_SECRET);

module.exports = client;
