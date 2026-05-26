"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFilter = exports.fieldValidation = void 0;
const exception_1 = require("../../exception");
exports.fieldValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/avif', 'image/webp', 'image/JPG'],
    video: ['video/mp4', 'video/mkv', 'video/avi'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    pdf: ['application/pdf'],
    attachments: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/avif', 'image/webp', 'image/JPG', 'video/mp4', 'video/mkv', 'video/avi']
};
const fileFilter = (validation) => {
    return function (req, file, cb) {
        if (!validation.includes(file.mimetype)) {
            cb(new exception_1.BadRequestException("Invalid File Format"));
        }
        return cb(null, true);
    };
};
exports.fileFilter = fileFilter;
