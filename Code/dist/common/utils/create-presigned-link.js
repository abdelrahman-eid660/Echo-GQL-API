"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPresignedLink = void 0;
const exception_1 = require("../exception");
const service_1 = require("../service");
const createPresignedLink = async ({ ContentType, OriginalName, path }) => {
    if (!ContentType && !OriginalName) {
        throw new exception_1.BadRequestException("Bad Request check from your Data");
    }
    const { url, Key } = await service_1.s3Service.createPreSignedUploadLink({ ContentType, OriginalName, path });
    return { url, Key };
};
exports.createPresignedLink = createPresignedLink;
