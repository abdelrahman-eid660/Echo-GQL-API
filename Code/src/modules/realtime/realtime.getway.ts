import { Server } from "socket.io";
import { Server as HttpServerType } from "node:http";
import {
  redisService,
  RedisService,
  tokenService,
  TokenService,
} from "../../common/service";
import { ISocket } from "../../common/types";
import { NotFoundException } from "../../common/exception";
import { chatGetway, ChatGetway } from "../chat/realtime";
import { ChatRepository } from "../../DB/Repository";

export class RealTimeGetway {
  private io!: Server;
  private readonly tokenService: TokenService;
  private readonly chatRepository: ChatRepository;
  private readonly redis: RedisService;
  private readonly chatGetway: ChatGetway;
  constructor() {
    this.tokenService = tokenService;
    this.redis = redisService;
    this.chatRepository = new ChatRepository();
    this.chatGetway = chatGetway;
  }
  authentication = async (socket: ISocket, next: any) => {
    try {
      const token =
        socket.handshake.auth?.authorization ||
        socket.handshake.headers?.authorization;
      if (!token) {
        return next(
          new NotFoundException("Authentication error: Token missing"),
        );
      }
      const { user, decode } = await this.tokenService.decodedToken({ token });
      if (!user?._id) {
        return next(
          new NotFoundException("Authentication error: User not found"),
        );
      }
      socket.data.user = user;
      socket.data.decode = decode;
      await this.redis.addSocktId(user._id.toString(), socket.id, Date.now());
      next();
    } catch (error) {
      next(error);
    }
  };
  initalization(httpServer: HttpServerType) {
    this.io = new Server(httpServer, { cors: { origin: "*" } });
    this.io.use(this.authentication);
    this.io.on("connection", async (socket: ISocket) => {
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
        if (!userId) return;
        const remainingConnections =
          this.io.sockets.adapter.rooms.get(userIdStr);
        if (!remainingConnections || remainingConnections.size === 0) {
          this.io.emit("offline_user", { userId });
          console.log(`🔴 User ${userId} is now completely OFFLINE`);
        } else {
          console.log(
            `ℹ️ User ${userId} closed a tab, but still has ${remainingConnections.size} tabs open.`,
          );
        }
      });
    });
  }
}
export const realTimeGetway = new RealTimeGetway();
