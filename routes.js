const express = require("express");
const db = require("./db");
const router = express.Router();

// Get all messages
router.get("/messages", (req, res) => {
    const query = "SELECT * FROM messages ORDER BY created_at";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching messages:", err);
            return res.status(500).json({ error: "Database error while fetching messages" });
        }
        res.json(results);
    });
});

// Add a new message and auto-reply
router.post("/messages", (req, res) => {
    const { sender, message } = req.body;

    if (!sender || !message) {
        return res.status(400).json({ error: "Sender and message are required" });
    }

    // Insert user's message
    const query = "INSERT INTO messages (sender, message) VALUES (?, ?)";
    db.query(query, [sender, message], (err, results) => {
        if (err) {
            console.error("Error inserting message:", err);
            return res.status(500).json({ error: "Database error while inserting message" });
        }

        const userMessageId = results.insertId;

        // Generate a bot reply
        const botReply = generateBotReply(message);

        // Insert bot's reply
        const botQuery = "INSERT INTO messages (sender, message) VALUES ('Bot', ?)";
        db.query(botQuery, [botReply], (err, botResults) => {
            if (err) {
                console.error("Error inserting bot reply:", err);
                return res.status(500).json({ error: "Database error while inserting bot reply" });
            }

            res.status(201).json({
                userMessage: { id: userMessageId, sender, message },
                botReply: { id: botResults.insertId, sender: "Bot", message: botReply },
            });
        });
    });
});

// Generate bot response logic
const generateBotReply = (userMessage) => {
    userMessage = userMessage.toLowerCase();

    if (userMessage.includes("hello")) {
        return "Hi there! How can I assist you today?";
    } else if (userMessage.includes("how are you")) {
        return "I'm just a bot, but I'm here to help!";
    } else if (userMessage.includes("time")) {
        return `The current time is ${new Date().toLocaleTimeString()}.`;
    } else {
        return "I'm sorry, I don't understand that. Can you rephrase?";
    }
};

module.exports = router;
