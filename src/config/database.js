const mongoose = require("mongoose");

async function connectDatabase() {
	await mongoose.connect(process.env.DB_URI);
}
module.exports = { connectDatabase };
