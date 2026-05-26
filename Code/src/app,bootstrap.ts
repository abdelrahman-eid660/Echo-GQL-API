import express from "express";
import cors from "cors";
import { globalErrorHandelr } from "./middleware/error.middleware";
import { connectDB } from "./DB";
import { redisService, s3Service } from "./common/service";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import {port} from './config/config'
import { successResponse } from "./common/response";
import { BadRequestException } from "./common/exception";
import { authentication } from "./middleware";
import { createHandler } from "graphql-http/lib/use/express";
import { realTimeGetway, schema } from "./modules";
import helmet from "helmet";
const s3WriteStream = promisify(pipeline);
async function bootstrap() {
  const Port = port || 3000
  const app: express.Express = express();

  //DB
  await connectDB();
  //REDIS
  await redisService.connect();

  // Global Middleware
  app.use(cors() ,express.json());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://sandbox.embed.apollo.dev"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https://sandbox.embed.apollo.dev"],
          frameSrc: ["'self'", "https://sandbox.embed.apollo.dev"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // 3. Health Check Route
  app.get("/api/", (req: express.Request, res: express.Response) => {
    res.send("Echo Server is Live and Secure 🚀");
  });

  // App-GraphQl
  app.all("/api/graphql" , authentication() , createHandler({schema , context : (req)=>({token : req.raw.token , ip: req.raw.ip})}))
  
  // App-routing
  app.post("/api/Echo/create-presigned-link", authentication() ,async (req , res , next)=>{
    const {ContentType , OriginalName , path} = req.body
    if (!ContentType && !OriginalName && !path) {
      throw new BadRequestException("Bad Request check from your Data")
    }
    const {url , Key} =  await s3Service.createPreSignedUploadLink({ContentType , OriginalName , path })
    successResponse({res , data  : {url , Key}})
  })
  app.get("/api/uploads/*path",async (req: express.Request, res: express.Response): Promise<void> => {
      const {download , fileName} = req.query as {download : string , fileName : string}
      const { path } = req.params as { path: string[] };
      const Key = path.join("/");
      const { Body, ContentType } = await s3Service.getAsset({ Key });
      res.setHeader("Content-Type",ContentType || "application/octet-stream")
      res.setHeader("Cache-Control", "public, max-age=31536000") // cashing for 1 year
      res.set("Cross-Origin-Resource-Policy" , "cross-origin")
      if (download === "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
      }
      return await s3WriteStream(Body as NodeJS.ReadableStream, res);
    },
  );
  app.get("/api/pre-signed/*path",async (req: express.Request, res: express.Response): Promise<void> => {
      const {download , fileName} = req.query as {download : string , fileName : string}
      const { path } = req.params as { path: string[] };
      const Key = path.join("/");
      const url = await s3Service.createPreSignedFetchLink({Key , download , fileName})
      successResponse({res , data :url })
    },
  );
  // Invalid route handling
  app.use("/*dummy", ( req: express.Request, res: express.Response,  next: express.NextFunction,) => {
      res.status(404).json({ message: "Not Found" });
    },
  );
  // global error handling
  app.use(globalErrorHandelr);

  const httpService = app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
  });

  // realTime Getway
  realTimeGetway.initalization(httpService)
}
export default bootstrap;
