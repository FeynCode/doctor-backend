import morgan, { type StreamOptions } from "morgan";

import Logger from "../utils/logger.js";
import { Request } from "express";

const stream: StreamOptions = {
  write: (message) => Logger.log("trace", message),
};

morgan.token("body", (req: Request) => {
  return JSON.stringify(req.body);
});

morgan.token("header", (req: Request) => {
  return JSON.stringify(req.headers);
});

const skip = (): boolean => {
  const env = process.env.NODE_ENV ?? "development";
  return env !== "development";
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms -- :header :body ",
  { stream, skip }
);

export default morganMiddleware;
