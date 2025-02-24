const ALLOWED_GENDER = ["male", "female"];
const JWT_TOKEN = "jwt";
const SKILL_REGEX = /^[A-Za-z0-9 ]+$/; // Allows only letters, numbers, and spaces
const NAME_REGEX = /^[A-Za-z ]{2,50}$/;
const EXCLUDED_FIELDS = "-password -__v -createdAt -updatedAt";
const ALLOWED_UPDATE_FIELDS = ["firstname", "lastname", "age", "skills"];
const ALLOWED_STATUS = ["like", "pass", "accepted", "rejected"];
const LIKE_PASS = ["like", "pass"];
const ACCEPT_REJECT = ["accepted", "rejected"];
const MAX_SKILLS = 5;
const REF_POPULATE = ["firstname", "lastname", "age", "gender"];
const PAGE_LIMIT = 2;
module.exports = {
	ALLOWED_GENDER,
	JWT_TOKEN,
	SKILL_REGEX,
	NAME_REGEX,
	EXCLUDED_FIELDS,
	ALLOWED_UPDATE_FIELDS,
	ALLOWED_STATUS,
	LIKE_PASS,
	ACCEPT_REJECT,
	MAX_SKILLS,
	REF_POPULATE,
	PAGE_LIMIT
};
