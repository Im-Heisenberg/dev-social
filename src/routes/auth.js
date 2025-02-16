const express = require("express");
const {
	verifyNewUserCreation,
	isEmailValid,
	isPasswordValid,
} = require("../utils/validations");

const { userModel } = require("../models/user");
const { JWT_TOKEN } = require("../utils/constants");
const router = express.Router();

router.post("/sign-up", async (req, res) => {
	const { firstname, lastname, email, password, age, gender, skills } =
		req.body;
	try {
		const isEmailExisitng = await userModel.findOne({ email });
		if (isEmailExisitng) throw new Error("Email already exist");

		const isUserObjectInValid = verifyNewUserCreation(req.body);
		if (isUserObjectInValid) {
			console.error(isUserObjectInValid);
			throw new Error("Validation error");
		}

		const newUser = new userModel({
			firstname,
			lastname,
			email,
			password,
			age,
			gender,
			skills,
		});
		newUser.password = await newUser.encryptPassword(password);
		await newUser.save();
		res.json({ message: "user created" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	// verify email & password & user should exist in DB
	const isUserValid = await userModel.findOne({ email });
	if (isEmailValid(email) && isPasswordValid(password) && isUserValid) {
		// generate jwt
		const token = isUserValid.generateJwtToken(email);
		// add jwt to cookie
		res.cookie(JWT_TOKEN, token);
		res.json({ message: "user logged in" });
	}
});
router.post("/logout", async (req, res) => {
	try {
		res.cookie(JWT_TOKEN, null);
		res.json({ message: "user logged out successfully" });
	} catch (err) {
		res.status(505).json({ message: "Error in logging out" });
	}
});

module.exports = { router };
