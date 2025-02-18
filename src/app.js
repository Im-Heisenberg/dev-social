require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

const { connectDatabase } = require("./config/database");
const { router: authRouter } = require("./routes/auth");
const { router: profileRouter } = require("./routes/profile");
const { router: connectionRouter } = require("./routes/connection");

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/request", connectionRouter);

connectDatabase()
	.then(() => {
		console.log("DB Connected");
		app.listen(process.env.PORT, () =>
			console.log("server started on Port:", process.env.PORT)
		);
	})
	.catch((err) => {
		console.log(err.message);
	});
