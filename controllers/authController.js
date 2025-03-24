async function displaySignup(req, res) {
  res.render("signup");
}

async function displayLogin(req, res) {
  res.render("login", { error: null });
}

async function logout(req, res) {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/");
  });
}

module.exports = {
  displaySignup,
  displayLogin,
  logout,
};
