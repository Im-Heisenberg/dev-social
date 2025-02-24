const express = require("express");
const {
	verifyNewUserCreation,
	isPasswordCorrect,
	isSkillValid,
	isNameValid,
	isUrlValid,
} = require("../utils/validations");

const { userModel } = require("../models/user");
const { JWT_TOKEN } = require("../utils/constants");
const router = express.Router();

router.post("/sign-up", async (req, res) => {
	const {
		firstname,
		lastname,
		email,
		password,
		age,
		gender,
		skills,
		photoUrl,
	} = req.body;
	try {
		const isEmailExisitng = await userModel.findOne({ email });
		if (isEmailExisitng) throw new Error("Email already exist");

		const isUserObjectInValid = verifyNewUserCreation(req.body);
		if (isUserObjectInValid) {
			throw new Error("Validation error");
		}

		let newUser = new userModel({
			firstname,
			email,
			password,
			age,
			gender,
		});
		if (skills && isSkillValid(skills)) {
			newUser.skills = skills;
		}
		if (lastname && isNameValid(lastname)) {
			newUser.lastname = lastname;
		}
		if (photoUrl && isUrlValid(photoUrl)) {
			newUser.photoUrl = photoUrl;
		}
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
	const passwordCheck = await isPasswordCorrect(
		password,
		isUserValid?.password
	);
	if (isUserValid && passwordCheck) {
		// generate jwt
		const token = isUserValid.generateJwtToken(email);
		// add jwt to cookie
		res.cookie(JWT_TOKEN, token);
		res.json({ message: "user logged in", data: isUserValid });
	} else {
		res.status(501).json({ message: "Login failed" });
	}
});
router.post("/logout", async (req, res) => {
	try {
		res.cookie(JWT_TOKEN, null, { expires: new Date(0) });
		res.json({ message: "user logged out successfully" });
	} catch (err) {
		res.json({ message: "Error in logging out" });
	}
});

module.exports = { router };
