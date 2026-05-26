"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagainationValidation = exports.generalValidationFields = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = __importDefault(require("zod"));
exports.generalValidationFields = {
    id: zod_1.default.string().refine(val => mongoose_1.Types.ObjectId.isValid(val), { message: "Invalid ObjectId" }),
    firstName: zod_1.default.string().min(2).max(20),
    lastName: zod_1.default.string().min(2).max(20),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().regex(/^(?=.*[A-Z]){1,}(?=.*[a-z]){1,}(?=.*[\d]){1,}(?=.*[\W]){1,}[\W\w].{8,25}/),
    confirmPassword: zod_1.default.string(),
    userName: zod_1.default.string().regex(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}/),
    otp: zod_1.default.string().regex(/^\d{6}$/),
    phone: zod_1.default.string().regex(/^(02|2|\+20)?01[0-25]\d{8}$/),
    isTwoFactorEnabled: zod_1.default.boolean(),
    file: function (mimetype) {
        return zod_1.default.strictObject({
            fieldname: zod_1.default.string(),
            originalname: zod_1.default.string(),
            encoding: zod_1.default.string(),
            mimetype: zod_1.default.enum(mimetype),
            buffer: zod_1.default.any().optional(),
            path: zod_1.default.string().optional(),
            size: zod_1.default.number()
        }).superRefine((args, ctx) => {
            if (!args.buffer && !args.path) {
                ctx.addIssue({
                    code: "custom",
                    message: "There is a missing formate file Buffer or Path"
                });
            }
        });
    }
};
exports.pagainationValidation = {
    query: zod_1.default.strictObject({
        page: zod_1.default.coerce.number().optional(),
        size: zod_1.default.coerce.number().optional(),
        search: zod_1.default.string().optional(),
    })
};
