import winston from "winston";
import {
  type ConsoleTransportInstance,
  type FileTransportInstance,
} from "winston/lib/winston/transports/index.js";

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  mongo: 4,
  debug: 5,
  trace: 6,
};

const level = (): string => {
  const env = process.env.NODE_ENV ?? "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "trace" : "warn";
};

const colors = {
  fatal: "bold white redBG",
  error: "bold red",
  warn: "bold yellow",
  info: "italic green",
  mongo: "bold magenta",
  debug: "bold white",
  trace: "bold blue",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
  })(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    return `${String(info.timestamp)} ${info.level}: ${String(info.message)}`;
  })
);

const transports: [FileTransportInstance | ConsoleTransportInstance] = [
  new winston.transports.Console(),
];

if (process.env.NODE_ENV === "production") {
  const errorFileTransport = new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  });
  const logFileTransport = new winston.transports.File({
    filename: "logs/all.log",
  });
  transports.push(errorFileTransport);
  transports.push(logFileTransport);
}

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default Logger;
