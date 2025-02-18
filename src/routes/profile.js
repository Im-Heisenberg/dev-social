const express = require("express");
const {
	authMiddleware,
	isNameValid,
	isAgeValid,
	isSkillValid,
	isPasswordCorrect,
	isPasswordValid,
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

router.patch("/update-password", authMiddleware, async (req, res) => {
	try {
		const { _id: loggedUser } = req.loggedUser;
		const { newPassword, oldPassword } = req.body;
		// check if old password is correct
		const user = await userModel.findOne({ _id: loggedUser });
		const result = await isPasswordCorrect(oldPassword, user.password);
		if (!result) throw new Error("Wrong password");
		if (!isPasswordValid(newPassword))
			throw new Error("Error in new password");
		const hashedPassword = await user.encryptPassword(newPassword);
		const data = await userModel.findOneAndUpdate(
			{ _id: loggedUser },
			{ password: hashedPassword },
			{ new: true }
		);
		res.json({ data });
	} catch (err) {
		res.json({ message: "Password cant be updated: " + err.message });
	}
});

module.exports = { router };
