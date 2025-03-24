const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const db = require("../db/queries.js");

dotenv.config();

async function createNewUser(req, res) {
  const { first_name, last_name, email, password, admin } = req.body;

  try {
    // Check if email already exists
    const existingUser = await db.getUser(email, "email");
    if (existingUser) {
      return res.status(400).render("signup", {
        errors: ["Email already in use"],
        formData: req.body,
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.addUser(
      first_name,
      last_name,
      email,
      hashedPassword,
      admin === "on",
    );

    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).render("signup", {
      errors: ["Internal server error. Please try again later."],
      formData: req.body,
    });
  }
}

async function login(req, res) {
  res.redirect("/");
}

async function displayMembership(req, res) {
  res.render("membership", { error: null, success: null });
}

async function activateMembership(req, res) {
  const { passcode } = req.body;
  const user = req.user;

  try {
    if (user.admin) {
      return res.render("membership", {
        error: null,
        success: "You are already an admin.",
      });
    }

    if (passcode !== process.env.MEMBERSHIP_PASSCODE) {
      return res.render("membership", {
        error: "Invalid passcode",
        success: null,
      });
    }

    await db.updateUser(user.id);

    res.render("membership", {
      error: null,
      success: "Congratulations! You are now a member.",
    });
  } catch (error) {
    console.error("Error updating membership status:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  createNewUser,
  login,
  displayMembership,
  activateMembership,
};
