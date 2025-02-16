const ALLOWED_GENDER = ["male", "female"];
const JWT_TOKEN = "jwt";
const SKILL_REGEX = /^[A-Za-z0-9 ]+$/; // Allows only letters, numbers, and spaces
const NAME_REGEX = /^[A-Za-z ]{2,50}$/;
const EXCLUDED_FIELDS = "-password -__v -createdAt -updatedAt";
module.exports = { ALLOWED_GENDER, JWT_TOKEN, SKILL_REGEX, NAME_REGEX,EXCLUDED_FIELDS };
