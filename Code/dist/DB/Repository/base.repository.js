"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options }) {
        const [doc] = await this.model.create(data, options);
        return doc;
    }
    async find({ filter, projection, options }) {
        return await this.model.find(filter || {}, projection, options);
    }
    async findOne({ filter, projection, options }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async findById({ _id, projection, options }) {
        const doc = this.model.findById(_id, projection);
        if (options?.lean) {
            doc.lean();
        }
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async paginate({ filter, projection, options = {}, page = undefined, size = 5 }) {
        let count;
        if (Number(page) > 0) {
            const skip = (Number(page) - 1) * Number(size);
            options.skip = skip;
            options.limit = Number(size);
            count = await this.model.countDocuments(filter);
        }
        const docs = await this.model.find(filter || {}, projection, options);
        return { docs, currentPage: page ? Number(page) : undefined, totalPages: page ? Math.ceil(Number(count) / Number(size)) : undefined };
    }
    async updateOne({ filter = {}, update, options }) {
        if (Array.isArray(update)) {
            update.push({ $set: { __v: { $add: ["$__v", 1] } } });
            return await this.model.updateOne(filter, update, { ...options, updatePipeline: true });
        }
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async updateMany({ filter = {}, update, options }) {
        return await this.model.updateMany(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter = {}, update, options = { returnDocument: "after" } }) {
        if (Array.isArray(update)) {
            return await this.model.findOneAndUpdate(filter, update, { ...options, updatePipeline: true });
        }
        return await this.model.findOneAndUpdate(filter, update, options);
    }
    async findByIdAndUpdate({ _id, update, options = { returnDocument: "after" } }) {
        if (Array.isArray(update)) {
            return await this.model.findByIdAndUpdate(_id, update, { ...options, updatePipeline: true });
        }
        return await this.model.findByIdAndUpdate(_id, update, options);
    }
    async deleteOne({ filter = {} }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter = {} }) {
        return await this.model.deleteMany(filter);
    }
    async findOneAndDelete({ filter = {}, options }) {
        return await this.model.findOneAndDelete(filter, options);
    }
    async findByIdAndDelete({ _id, options }) {
        return await this.model.findByIdAndDelete(_id, options);
    }
    async aggregate(pipeline, options) {
        const Pipeline = pipeline.length ? pipeline : [{ $match: {} }];
        return this.model.aggregate(Pipeline, options);
    }
    async countDocuments({ filter = {}, options }) {
        return await this.model.countDocuments(filter, options);
    }
}
exports.BaseRepository = BaseRepository;
