"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthSignInInput = exports.validateAuthSignUpInput = void 0;
const auth_schema_1 = require("../schemas/auth_schema");
const validateAuthSignInInput = async (req, res, next) => {
    try {
        const validatedDaa = await auth_schema_1.auth_signin_schema.parseAsync(req.body);
        console.log(validatedDaa, "check with zod before pass to controller");
        req.body = validatedDaa;
        next();
    }
    catch (error) {
        res.status(400).json({ error: "Validation Failed", details: error.issues });
    }
};
exports.validateAuthSignInInput = validateAuthSignInInput;
const validateAuthSignUpInput = async (req, res, next) => {
    try {
        const validatedDaa = await auth_schema_1.auth_signup_schema.parseAsync(req.body);
        console.log(validatedDaa, "check with zod before pass to controller");
        req.body = validatedDaa;
        next();
    }
    catch (error) {
        res.status(400).json({ error: "Validation Failed", details: error.issues });
    }
};
exports.validateAuthSignUpInput = validateAuthSignUpInput;
