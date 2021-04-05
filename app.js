const express = require("express");
const passport = require("passport");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

require("./config/passport")(passport);
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.set("view engine", "pug");
app.use(express.static("public"));
// Passport
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new FileStore,
    secret: "drive-app-secret",
    resave: false,
    saveUninitialized: false,
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(require("./routes/index"));
app.use("/auth", require("./routes/auth"));

app.listen(port, () => console.log("Aplicación corriendo en puerto: %s", port));
