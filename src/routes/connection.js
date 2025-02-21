const express = require("express");
const {
	authMiddleware,
	validateConnectionParams,
} = require("../utils/validations");
const {
	LIKE_PASS,
	ACCEPT_REJECT,
	REF_POPULATE,
	EXCLUDED_FIELDS,
} = require("../utils/constants");
const { requestModel } = require("../models/request");
const { userModel } = require("../models/user");
const { default: mongoose } = require("mongoose");
const router = express.Router();

router.post("/depre/:receiverId", authMiddleware, async (req, res) => {
	try {
		const { _id: senderId } = req.loggedUser;
		const { receiverId } = req.params;
		const { state } = req.query;
		validateConnectionParams(receiverId, state);
		const isConnectionDuplicate = await requestModel.findOne({
			$or: [
				{ sender: senderId, receiver: receiverId },
				{ sender: receiverId, receiver: senderId },
			],
		});
		const isReceiverValid = await userModel.findOne({ _id: receiverId });

		if (!isReceiverValid) {
			throw new Error("Invalid request: Invalid receiver");
		}

		if (new mongoose.Types.ObjectId(receiverId).equals(senderId)) {
			throw new Error("Invalid request: sender & reveiver cant be same");
		}

		if (LIKE_PASS.includes(state.toLowerCase())) {
			if (isConnectionDuplicate) {
				throw new Error("Invalid request: Connection already exists");
			}
			// block to handle like or pass state
			const connection = new requestModel({
				sender: senderId,
				receiver: receiverId,
				status: state,
			});
			const data = await connection.save();
			res.json({ message: `connection:${state}`, data });
		}
		if (ACCEPT_REJECT.includes(state.toLowerCase())) {
			// block to handle accepted or rejected state
			const data = await requestModel.findOneAndUpdate(
				{
					$or: [
						{ sender: senderId, receiver: receiverId },
						{ sender: receiverId, receiver: senderId },
					],
				},
				{
					state,
				},
				{ new: true }
			);
			res.json({ message: `connection:${state}`, data });
		}
		throw new Error("Invalid state received");
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
});
// handle like and pass state
router.post(
	"/depre/send/:senderId/:state",
	authMiddleware,
	async (req, res) => {
		try {
			const { userId, state } = req.params;
			const { _id: loggedUser } = req.loggedUser;

			// state check --> like or pass only
			if (!LIKE_PASS.includes(state)) {
				throw new Error("Invalid status received");
			}

			const isUserValid = await userModel.findOne({ _id: userId });

			// userid check --> present in DB
			if (!isUserValid) {
				throw new Error("Invalid userID received");
			}
			const isDuplicateRequest = await requestModel.findOne({
				$or: [
					{
						sender: loggedUser,
						receiver: userId,
						status: { $in: LIKE_PASS },
					},
					{
						sender: userId,
						receiver: loggedUser,
						status: { $in: LIKE_PASS },
					},
				],
			});
			if (isDuplicateRequest) {
				throw new Error("Request already existing");
			}

			const newConnection = new requestModel({
				sender: loggedUser,
				receiver: userId,
				status: state,
			});
			const data = await newConnection.save();
			return res
				.status(201)
				.json({ message: "request updated: " + state, data });
		} catch (error) {
			res.json({ message: error.message });
		}
	}
);
router.post("/send/:state/:id/", authMiddleware, async (req, res) => {
	try {
		const { state, id } = req.params;
		const loggedUser = req.loggedUser;
		const isStateValid = LIKE_PASS.includes(state.toLowerCase());
		const isUserIdValid = await userModel.findOne({ _id: id });
		const isConnectionDuplicate = await requestModel.findOne({
			$or: [
				{ sender: loggedUser._id, receiver: id },
				{ sender: id, receiver: loggedUser._id },
			],
		});
		if (!isStateValid || !isUserIdValid)
			throw new Error("Invalid state or Id received");
		if (isConnectionDuplicate) throw new Error("Duplicate request");
		const newConnection = new requestModel({
			sender: loggedUser._id,
			receiver: id,
			status: state,
		});
		const data = await newConnection.save();
		res.status(201).json({ message: "connection added:" + state, data });
	} catch (error) {
		res.json({ message: error.message });
	}
});
// handle accept and reject state
router.post("/depre/review/:userId/:state", async (req, res) => {
	try {
		const { userId: senderId, state } = req.params;
		const { _id: loggedUser } = req.loggedUser;

		const isReceiverValid = await userModel.findOne({ _id: senderId });

		if (!isReceiverValid) {
			throw new Error("Invalid request: Invalid receiver");
		}
		if (!ACCEPT_REJECT.includes(state)) {
			throw new Error("Invalid request: Connection already exists");
		}
		const isRequestDuplicate = await requestModel.findOne({
			$or: [
				// {
				// 	sender: loggedUser,
				// 	receiver: receiverId,
				// 	state: { $in: ACCEPT_REJECT },
				// },
				{
					sender: receiverId,
					receiver: loggedUser,
					state: { $in: ACCEPT_REJECT },
				},
			],
		});
		if (isRequestDuplicate) {
			throw new Error("Bad Request:Request already updated !");
		}
		const updatedRequest = await findOneAndUpdate(
			{
				receiver: loggedUser,
			},
			{ status: state },
			{ new: true }
		);
		res.json({ data: updatedRequest });
	} catch (error) {
		res.json({ message: error.message });
	}
});
router.patch("/review/:state/:requestId", authMiddleware, async (req, res) => {
	try {
		const loggedUser = req.loggedUser;
		const { state, requestId } = req.params;
		const isStateValid = ACCEPT_REJECT.includes(state.toLowerCase());
		const isRequestValid = await requestModel.findOne({
			_id: requestId,
			// receiver: loggedUser._id,
			status: "like",
		});

		console.log(isRequestValid);
		if (!isStateValid || !isRequestValid) {
			throw new Error("Invalid request");
		}

		if (loggedUser._id.equals(isRequestValid.receiver)) {
			isRequestValid.status = state;
			const data = await isRequestValid.save();
			return res.json({ data });
		}
		if (!loggedUser._id.equals(isRequestValid.receiver)) {
			throw new Error("Sender and receiver cant be same");
		}
		throw new Error("Unexpected error");
	} catch (error) {
		res.json({ message: error.message });
	}
});
// fetch all received requests
router.get("/received", authMiddleware, async (req, res) => {
	try {
		const loggedUser = req.loggedUser;
		const requestsReceived = await requestModel
			.find({
				receiver: loggedUser._id,
				status: "like",
			})
			.populate("sender", REF_POPULATE);
		if (requestsReceived.length <= 0) {
			throw new Error("No request found");
		} else {
			res.json({ data: requestsReceived });
		}
	} catch (error) {
		res.json({ message: error.message });
	}
});
router.get("/connections", authMiddleware, async (req, res) => {
	try {
		const loggedUser = req.loggedUser;
		const connections = await requestModel
			.find({
				$or: [
					{ sender: loggedUser._id, status: "accepted" },
					{ receiver: loggedUser._id, status: "accepted" },
				],
			})
			.select(EXCLUDED_FIELDS)
			.populate("receiver", REF_POPULATE)
			.populate("sender", REF_POPULATE);
		// TODO
		const data = connections.map((connection) => {
			if (String(connection.sender) === String(loggedUser._id)) {
				return connection.receiver;
			}
			return connection.sender;
		});

		res.status(200).json({ data });
	} catch (error) {
		res.status(500).json({ message: "Cant get connections" });
	}
});
module.exports = { router };
