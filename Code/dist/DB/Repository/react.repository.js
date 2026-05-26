"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactRepository = void 0;
const base_repository_1 = require("./base.repository");
const models_1 = require("../models");
class ReactRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(models_1.ReactModel);
    }
}
exports.ReactRepository = ReactRepository;
