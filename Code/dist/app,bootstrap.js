"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middleware/error.middleware");
const DB_1 = require("./DB");
const service_1 = require("./common/service");
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
const config_1 = require("./config/config");
const response_1 = require("./common/response");
const exception_1 = require("./common/exception");
const middleware_1 = require("./middleware");
const express_2 = require("graphql-http/lib/use/express");
const modules_1 = require("./modules");
const helmet_1 = __importDefault(require("helmet"));
const s3WriteStream = (0, node_util_1.promisify)(node_stream_1.pipeline);
async function bootstrap() {
    const Port = config_1.port || 3000;
    const app = (0, express_1.default)();
    await (0, DB_1.connectDB)();
    await service_1.redisService.connect();
    app.use((0, cors_1.default)(), express_1.default.json());
    app.use((0, helmet_1.default)({
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
    }));
    app.get("/", (req, res) => {
        res.send("Echo Server is Live and Secure 🚀");
    });
    app.all("/graphql", (0, middleware_1.authentication)(), (0, express_2.createHandler)({ schema: modules_1.schema, context: (req) => ({ token: req.raw.token, ip: req.raw.ip }) }));
    app.post("/Echo/create-presigned-link", (0, middleware_1.authentication)(), async (req, res, next) => {
        const { ContentType, OriginalName, path } = req.body;
        if (!ContentType && !OriginalName && !path) {
            throw new exception_1.BadRequestException("Bad Request check from your Data");
        }
        const { url, Key } = await service_1.s3Service.createPreSignedUploadLink({ ContentType, OriginalName, path });
        (0, response_1.successResponse)({ res, data: { url, Key } });
    });
    app.get("/uploads/*path", async (req, res) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const { Body, ContentType } = await service_1.s3Service.getAsset({ Key });
        res.setHeader("Content-Type", ContentType || "application/octet-stream");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }
        return await s3WriteStream(Body, res);
    });
    app.get("/pre-signed/*path", async (req, res) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await service_1.s3Service.createPreSignedFetchLink({ Key, download, fileName });
        (0, response_1.successResponse)({ res, data: url });
    });
    app.use("/*dummy", (req, res, next) => {
        res.status(404).json({ message: "Not Found" });
    });
    app.use(error_middleware_1.globalErrorHandelr);
    const httpService = app.listen(Port, () => {
        console.log(`Server is running on port ${Port}`);
    });
    modules_1.realTimeGetway.initalization(httpService);
}
exports.default = bootstrap;
