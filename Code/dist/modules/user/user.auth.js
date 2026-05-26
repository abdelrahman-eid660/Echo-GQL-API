"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const enum_1 = require("../../common/enum");
exports.endPoint = {
    SensiveAuth: [enum_1.RoleEnum.ADMIN, enum_1.RoleEnum.SUPERVISER],
    generalAuth: [enum_1.RoleEnum.ADMIN, enum_1.RoleEnum.SUPERVISER, enum_1.RoleEnum.USER]
};
