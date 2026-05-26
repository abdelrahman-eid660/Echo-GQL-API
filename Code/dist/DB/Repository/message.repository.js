"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const base_repository_1 = require("./base.repository");
const models_1 = require("../models");
class MessageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(models_1.MessageModel);
    }
}
exports.MessageRepository = MessageRepository;
