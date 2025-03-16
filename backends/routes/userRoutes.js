const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Get user details
router.get("/", async (req, res) => {
  console.log("🔹 [USER ROUTE] Received Request to /user");

  let token = req.headers.authorization || req.query.token;

  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    console.error("⚠️ [USER ROUTE] Unauthorized: Token missing");
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.error("⚠️ [USER ROUTE] User not found");
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ [USER ROUTE] JWT Error:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});
// Update user profile (for intro form)
router.put("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { linkedin, source } = req.body;
    user.linkedin = linkedin || user.linkedin;
    user.source = source || user.source;
    user.isNewUser = false; // Set isNewUser to false

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user profile" });
  }
});
// Check if user is new (first login)
router.get("/check-first-login", async (req, res) => {
  console.log("🔹 [USER ROUTE] Received Request to Check First Login");

  // Extract token from headers
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.error("⚠️ [USER ROUTE] Unauthorized: Token missing");
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [USER ROUTE] Decoded Token:", decoded);

    // Find the user in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error("⚠️ [USER ROUTE] User not found");
      return res.status(404).json({ error: "User not found" });
    }

    // Return whether it's the first login
    res.json({ firstLogin: user.firstLogin });
  } catch (error) {
    console.error("❌ [USER ROUTE] Error Checking First Login:", error.message);
    res.status(500).json({ error: "Failed to check first login" });
  }
});

module.exports = router;
