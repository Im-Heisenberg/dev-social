const mongoose = require("mongoose");
const { ALLOWED_STATUS } = require("../utils/constants");

const connectionSchema = mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		receiver: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: ALLOWED_STATUS,
		},
	},
	{
		timestamps: true,
	}
);

const connectionModel = mongoose.model("connection", connectionSchema);
module.exports = { connectionModel };
