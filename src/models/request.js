const mongoose = require("mongoose");
const { ALLOWED_STATUS } = require("../utils/constants");

const requestSchema = mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		receiver: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref:"User",
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

const requestModel = mongoose.model("requests", requestSchema);
module.exports = { requestModel };
