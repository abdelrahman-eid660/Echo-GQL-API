"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const base_repository_1 = require("./base.repository");
const models_1 = require("../models");
class ChatRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(models_1.ChatModel);
    }
}
exports.ChatRepository = ChatRepository;
