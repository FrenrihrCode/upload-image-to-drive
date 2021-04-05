const express = require("express");
const passport = require("passport");
const fs = require("fs");
const multer = require("multer");
const { google } = require("googleapis");

const router = express.Router();

const SCOPES = [
  "profile",
  "email",
  "https://www.googleapis.com/auth/drive.file",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).single("file");

router.get("/google", passport.authenticate("google", { scope: SCOPES }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

router.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

// Upload to Drive
router.post("/upload", (req, res) => {
  console.log("upload");
  console.log(req.user);
  upload(req, res, (err) => {
    console.log(req.file);
    if (err) {
      console.log(err);
      res.json({
        success: false,
        message: err,
      });
    } else {
      const oAuth2Client = new google.auth.OAuth2();

      oAuth2Client.setCredentials({
        access_token: req.user.access_token,
      });

      const drive = google.drive({ version: "v3", auth: oAuth2Client });
      const fileMetadata = {
        name: req.file.filename,
      };
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };
      drive.files.create(
        {
          resource: fileMetadata,
          media: media,
          fields: "id",
        },
        (err, file) => {
          let success = true;
          let message = "";
          if (err) {
            console.error(err);
            success = false;
            message = err.errors[0].message;
          } else {
            success = true;
            message = "Imagen subida exitosamente.";
          }
          fs.unlinkSync(req.file.path);
          res.json({
            success,
            message,
          });
        }
      );
    }
  });
});

module.exports = router;
