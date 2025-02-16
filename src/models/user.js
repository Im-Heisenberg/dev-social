const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
	{
		firstname: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		lastname: {
			type: String,
			trim: true,
			lowercase: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
			min: [6, "Password must have 6 characters"],
			max: [12, "Password cant have more than 12 characters"],
		},
		age: {
			type: Number,
			required: true,
			min: 18,
			trim: true,
			lowercase: true,
		},
		gender: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		skills: {
			type: [String],
			default: [],
		},
	},
	{
		timestamps: true,
		methods: {
			async encryptPassword(plainPassword) {
				const hashedPassword = await bcrypt.hash(plainPassword, 10);
				return hashedPassword;
			},
			generateJwtToken(email) {
				return jwt.sign({ email }, process.env.JWT_SIGNATURE);
			},
		},
	}
);
const userModel = mongoose.model("User", userSchema);

module.exports = { userModel };
