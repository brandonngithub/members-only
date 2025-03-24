const db = require("../db/queries.js");

async function createMessage(req, res) {
  const { title, text } = req.body;
  const user = req.user;

  try {
    if (!user.member && !user.admin) {
      return res
        .status(403)
        .send("Forbidden: You must be a member to create messages.");
    }
    await db.addMessage(title, text, user.id);
    res.redirect("/");
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function deleteMessage(req, res) {
  const messageId = req.params.id;
  const user = req.user;

  try {
    if (!user.admin) {
      return res
        .status(403)
        .send("Forbidden: Only admins can delete messages.");
    }
    await db.deleteMessage(messageId);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  createMessage,
  deleteMessage,
};
