import express, { json } from "express";
import globalRouter from "./src/routes.ts";
import Logger from "./src/utils/logger.ts";
import morganMiddleware from "./src/middleware/morgan.middleware.ts";
import { connectDB } from "./src/utils/database.ts";
import { createLightship } from "lightship";
import cookieParser from "cookie-parser";

// Init HTTP server and other necessary services.
const app = express();
const lightship = await createLightship({
  port: 5000,
  detectKubernetes: false,
});
connectDB(lightship);

// Middlewares
app.use(json());
app.use(cookieParser());
app.use(morganMiddleware);

// v1 Rou
app.use("/v1", globalRouter);

// Start Server
const port = process.env.PORT || 7000;
const server = app
  .listen(port, () => {
    Logger.info("Server Started ⚡ => " + ` http://localhost:${port}`);
    lightship.signalReady();
  })
  .on("error", () => {
    Logger.error("in error");
    lightship.shutdown();
  });

lightship.registerShutdownHandler(() => {
  server.close();
  process.exit();
});

// Error Handling
process.on("SIGTERM", () => {
  Logger.info("SIGTERM signal received: closing HTTP server");
  lightship.shutdown();
});
