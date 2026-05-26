"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOValidation = exports.GraphQLValidation = exports.validation = void 0;
const exception_1 = require("../common/exception");
const graphql_1 = require("graphql");
const validation = (scehma) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(scehma)) {
            if (!scehma[key])
                continue;
            const validationResualt = scehma[key].safeParse(req[key]);
            if (!validationResualt.success) {
                const error = validationResualt.error;
                validationErrors.push({ key, issues: error.issues.map(issue => {
                        return { message: issue.message, path: issue.path };
                    }) });
            }
        }
        if (validationErrors.length) {
            throw new exception_1.BadRequestException("Validation Faild", validationErrors);
        }
        next();
    };
};
exports.validation = validation;
const GraphQLValidation = async (scehma, args) => {
    const validationResualt = scehma.safeParse(args);
    if (!validationResualt.success) {
        throw new graphql_1.GraphQLError("Validation erroe", {
            extensions: {
                statusCode: 400,
                issues: validationResualt.error.issues.map(issue => { return { message: issue.message, path: issue.path }; })
            }
        });
    }
};
exports.GraphQLValidation = GraphQLValidation;
const SocketIOValidation = async (scehma, data) => {
    const validationResualt = scehma.safeParse(data);
    if (!validationResualt.success) {
        throw new exception_1.BadRequestException("Validation erroe", {
            extensions: {
                statusCode: 400,
                issues: validationResualt.error.issues.map(issue => { return { message: issue.message, path: issue.path }; })
            }
        });
    }
    return validationResualt.data;
};
exports.SocketIOValidation = SocketIOValidation;
