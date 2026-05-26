"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthorized = exports.isAuthenticated = exports.authentication = void 0;
const exception_1 = require("../common/exception");
const enum_1 = require("../common/enum");
const index_1 = require("../common/service/index");
const authentication = () => {
    return async (req, res, next) => {
        if (!req.headers?.authorization) {
            throw new exception_1.BadRequestException("Missing authorization key");
        }
        const { authorization } = req.headers;
        const [flag, credential] = authorization.split(" ");
        req.token = credential;
        next();
    };
};
exports.authentication = authentication;
const isAuthenticated = async (context, tokenType = enum_1.TokenTypeEnum.ACCESS) => {
    if (!context.token) {
        throw (0, exception_1.GqlError)(new exception_1.UnauthorizedException("Login required"));
    }
    const { user, decode } = await index_1.tokenService.decodedToken({ token: context.token, tokenType });
    return { user, decode };
};
exports.isAuthenticated = isAuthenticated;
const isAuthorized = async (accessRole, user) => {
    if (!user) {
        throw (0, exception_1.GqlError)(new exception_1.UnauthorizedException("Login required"));
    }
    if (!accessRole.includes(user.role)) {
        throw (0, exception_1.GqlError)(new exception_1.ForbiddenException("Not allowed account"));
    }
    else {
        return true;
    }
};
exports.isAuthorized = isAuthorized;
