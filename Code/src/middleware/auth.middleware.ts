import { NextFunction, Request, Response } from "express";
import { BadRequestException, ForbiddenException, GqlError, UnauthorizedException } from "../common/exception";
import { RoleEnum, TokenTypeEnum } from "../common/enum";
import {tokenService} from '../common/service/index'
import { HydratedDocument } from "mongoose";
import { IUser } from "../common/interface";
import { JwtPayload } from "jsonwebtoken";

export const authentication = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers?.authorization) {
      throw new BadRequestException("Missing authorization key");
    }
    const { authorization } = req.headers;
    const [flag, credential] = authorization.split(" ") as [string, string];
    req.token = credential as string
    next();
  };
};

export const isAuthenticated = async ( context: any, tokenType = TokenTypeEnum.ACCESS):Promise<{user : HydratedDocument<IUser> , decode : JwtPayload}> => {
    if (!context.token) {
      throw GqlError( new UnauthorizedException( "Login required"));
    }
    const {user , decode} = await tokenService.decodedToken({ token: context.token, tokenType})
    return {user , decode};
};

export const isAuthorized = async (accessRole : RoleEnum[] , user : HydratedDocument<IUser>):Promise<boolean>=>{
   if (!user) {
    throw GqlError(new UnauthorizedException("Login required"));
  }
  if (!accessRole.includes(user.role)) {
      throw GqlError(new ForbiddenException("Not allowed account"))
  }else{
      return true
    }
}