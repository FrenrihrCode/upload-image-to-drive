const router = require("express").Router();
//importing middleware
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/", ensureGuest, (req, res) => {
  res.render("login");
});

router.get("/dashboard", ensureAuth, async (req, res) => {
  const user = req.user;
  console.log(user);
  res.render("dashboard", {
    email: user.email[0].value,
    avatar: user.avatar[0].value,
    username: user.username,
  });
});

module.exports = router;
