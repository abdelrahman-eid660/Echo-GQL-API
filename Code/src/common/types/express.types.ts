import { HydratedDocument } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../interface/user.interface';
import { Socket } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user: HydratedDocument<IUser>;
      decode: JwtPayload;
      token : string
    }
  }
}

export interface IAuthUser {
  user: HydratedDocument<IUser>;
  decode?: JwtPayload;
}

export interface ISocket extends Socket {
  data : IAuthUser
}