const express = require("express");
const { authMiddleware } = require("../utils/validations");
const router = express.Router();

router.get("/view", authMiddleware, async (req, res) => {
	try {
		res.status(200).json({ data: req.loggedUser });
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

module.exports = { router };
