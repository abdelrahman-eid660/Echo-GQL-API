"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realTimeGetway = exports.RealTimeGetway = void 0;
const socket_io_1 = require("socket.io");
const service_1 = require("../../common/service");
const exception_1 = require("../../common/exception");
const realtime_1 = require("../chat/realtime");
const Repository_1 = require("../../DB/Repository");
class RealTimeGetway {
    io;
    tokenService;
    chatRepository;
    redis;
    chatGetway;
    constructor() {
        this.tokenService = service_1.tokenService;
        this.redis = service_1.redisService;
        this.chatRepository = new Repository_1.ChatRepository();
        this.chatGetway = realtime_1.chatGetway;
    }
    authentication = async (socket, next) => {
        try {
            const token = socket.handshake.auth?.authorization ||
                socket.handshake.headers?.authorization;
            if (!token) {
                return next(new exception_1.NotFoundException("Authentication error: Token missing"));
            }
            const { user, decode } = await this.tokenService.decodedToken({ token });
            if (!user?._id) {
                return next(new exception_1.NotFoundException("Authentication error: User not found"));
            }
            socket.data.user = user;
            socket.data.decode = decode;
            await this.redis.addSocktId(user._id.toString(), socket.id, Date.now());
            next();
        }
        catch (error) {
            next(error);
        }
    };
    initalization(httpServer) {
        this.io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
        this.io.use(this.authentication);
        this.io.on("connection", async (socket) => {
            const user = socket.data.user;
            const userIdStr = user._id.toString();
            socket.join(userIdStr);
            const userChats = await this.chatRepository.find({
                filter: { participants: user._id },
            });
            for (const chat of userChats) {
                socket.join(chat._id.toString());
            }
            this.chatGetway.registerEvents(socket, this.io);
            socket.on("disconnect", async () => {
                const userId = socket.data.user._id;
                if (!userId)
                    return;
                const remainingConnections = this.io.sockets.adapter.rooms.get(userIdStr);
                if (!remainingConnections || remainingConnections.size === 0) {
                    this.io.emit("offline_user", { userId });
                    console.log(`🔴 User ${userId} is now completely OFFLINE`);
                }
                else {
                    console.log(`ℹ️ User ${userId} closed a tab, but still has ${remainingConnections.size} tabs open.`);
                }
            });
        });
    }
}
exports.RealTimeGetway = RealTimeGetway;
exports.realTimeGetway = new RealTimeGetway();
