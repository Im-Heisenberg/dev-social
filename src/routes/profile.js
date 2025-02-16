const express = require("express");
const {
	authMiddleware,
	isNameValid,
	isAgeValid,
	isSkillValid,
} = require("../utils/validations");
const { userModel } = require("../models/user");
const { EXCLUDED_FIELDS } = require("../utils/constants");
const router = express.Router();

router.get("/view", authMiddleware, async (req, res) => {
	try {
		res.status(200).json({ data: req.loggedUser });
	} catch (error) {
		res.status(403).json({ message: error.message });
	}
});

router.patch("/edit", authMiddleware, async (req, res) => {
	try {
		const loggedUser = req.loggedUser;
		const { firstname, lastname, age, skills } = req.body;
		if (
			isNameValid(firstname) &&
			isNameValid(lastname) &&
			isAgeValid(String(age)) &&
			isSkillValid(skills)
		) {
			const updatedUser = await userModel
				.findOneAndUpdate(
					{ email: loggedUser.email },
					{ firstname, lastname, age, skills },
					{ new: true }
				)
				.select(EXCLUDED_FIELDS);
			res.json({ message: "update success", data: updatedUser });
		}
	} catch (error) {
		res.json({ message: error.message });
	}
});

module.exports = { router };
