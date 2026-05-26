"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = exports.UserResolver = void 0;
const user_service_1 = require("./../user.service");
class UserResolver {
    userService;
    constructor() {
        this.userService = user_service_1.userService;
    }
    Profile = async (parent, args) => {
        const data = await this.userService.profile({});
        return { message: "hello Every one", data };
    };
}
exports.UserResolver = UserResolver;
exports.userResolver = new UserResolver();
