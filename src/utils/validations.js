const validator = require("validator");
const jwt = require("jsonwebtoken");

const {
	ALLOWED_GENDER,
	SKILL_REGEX,
	NAME_REGEX,
	JWT_TOKEN,
} = require("./constants");
const { userModel } = require("../models/user");

const isNameValid = (name) => {
	return typeof name === "string" && NAME_REGEX.test(name);
};

const isEmailValid = (email) => validator.isEmail(email);

const isPasswordValid = (password) => validator.isStrongPassword(password);

const isAgeValid = (age) => validator.isInt(age) && age >= 18 && age < 100;
const isGenderValid = (gender) => {
	return ALLOWED_GENDER.includes(String(gender).toLowerCase());
};
const isSkillValid = (skills) => {
	return (
		Array.isArray(skills) &&
		skills.every(
			(skill) =>
				typeof skill === "string" &&
				skill.trim().length > 0 &&
				SKILL_REGEX.test(skill)
		)
	);
};
function verifyNewUserCreation({
	firstname,
	lastname,
	email,
	password,
	age,
	gender,
	skills,
}) {
	const error = {};
	!isEmailValid(email) ? (error.emailError = "email invalid") : null;
	!isNameValid(firstname)
		? (error.firstnameError = "firstname invalid")
		: null;
	!isNameValid(firstname)
		? (error.firstnameError = "firstname invalid")
		: null;
	!isNameValid(lastname) ? (error.lastnameError = "lastname invalid") : null;
	!isAgeValid(String(age)) ? (error.ageError = "age invalid") : null;
	!isGenderValid(gender) ? (error.genderError = "gender invalid") : null;
	!isSkillValid(skills) ? (error.skillsError = "skills invalid") : null;
	!isPasswordValid(password)
		? (error.passwordError = "password invalid")
		: null;

	return Object.keys(error).length > 0 ? error : false;
}

const authMiddleware = async (req, res, next) => {
	try {
		const token = req.cookies.JWT_TOKEN;
		if (!token) throw new Error("bad auth: invalid jwt token");
		const result = jwt.verify(token, process.env.JWT_SIGNATURE);
		if (!result) throw new Error("auth error");
		const loggedUser = await userModel.findOne({ email: result.email });
		if (!loggedUser) throw new Error("bad auth: user not found");
		req.loggedUser = loggedUser;
		next();
	} catch (err) {
		return res.status(401).json({ message: err.message });
	}
};

module.exports = {
	verifyNewUserCreation,
	isEmailValid,
	isPasswordValid,
	authMiddleware,
};
