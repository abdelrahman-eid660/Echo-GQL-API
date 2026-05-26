"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronJobs = exports.CronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Repository_1 = require("../../DB/Repository");
const service_1 = require("../service");
class CronJobs {
    reactRepository;
    storyRepository;
    s3;
    constructor() {
        this.storyRepository = new Repository_1.StoryRepository();
        this.reactRepository = new Repository_1.ReactRepository();
        this.s3 = service_1.s3Service;
        node_cron_1.default.schedule('* * * * *', async () => {
            const expiredStories = await this.storyRepository.find({ filter: { expiresAt: { $lte: new Date() } } });
            if (!expiredStories.length)
                return;
            const ids = expiredStories.map(id => id._id);
            const imageKeys = expiredStories.flatMap(story => story.attachments?.image?.map(img => ({ Key: img })) || []);
            const videoKeys = expiredStories.flatMap(story => story.attachments?.video?.map(video => ({ Key: video })) || []);
            const allKeys = [...imageKeys, ...videoKeys];
            await Promise.all([
                this.reactRepository.deleteMany({ filter: { targetId: { $in: ids } } }),
                ...(allKeys.length ? [this.s3.deleteAssets({ Keys: allKeys })] : []),
                this.storyRepository.deleteMany({ filter: { _id: { $in: ids } } }),
            ]);
        });
    }
}
exports.CronJobs = CronJobs;
exports.cronJobs = new CronJobs();
