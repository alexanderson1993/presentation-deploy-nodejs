require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const pool = require("./database");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const path = require("path");
const twilio = require("./twilio");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(express.static("html"));

app.post("/signup", async (request, response) => {
  const phone = parsePhoneNumberFromString("+1" + request.body.phoneNumber);
  if (phone && phone.isValid()) {
    pool
      .query("INSERT INTO users (name, phone) VALUES ('person',$1::text)", [
        phone.number
      ])
      .then(res => {
        response.json({ info: "Success" });
      })
      .catch(err => {
        console.error(err);
        response.status(400);
        response.json({ error: "Error accessing database" });
      });
  } else {
    response.status(400);
    response.json({ error: "Invalid phone number" });
  }
});

app.post("/send", async (req, res) => {
  const { password, message } = req.body;
  if (password === process.env.PASSWORD) {
    // Get the numbers
    const numbers = await pool.query("SELECT * FROM users").then(res => {
      return res.rows.map(r => r.phone);
    });
    console.log(numbers);
    // Send the text message
    await Promise.all(
      numbers.map(n => {
        return twilio.messages.create({
          body: message,
          to: n, // Text this number
          from: "+13854484035" // From a valid Twilio number
        });
      })
    ).then(message => console.log(message.sid));
  }
  res.sendFile(path.resolve("html/send.html"));
});
app.get("/send", (req, res) => {
  res.sendFile(path.resolve("html/send.html"));
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
