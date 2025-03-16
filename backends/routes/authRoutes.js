const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email", "repo"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    console.log("GitHub callback triggered");
    const { user, token, accessToken } = req.user;
    console.log("User:", user);
    console.log("Token:", token);
    console.log("Access Token:", accessToken);

    if (user.isNewUser) {
      res.redirect(`${process.env.FRONTEND_URL}/intro?token=${token}&accessToken=${accessToken}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}&accessToken=${accessToken}`);
    }
  }
);

module.exports = router;
