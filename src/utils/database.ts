import mongoose, { connect } from "mongoose";
import { inspect } from "node:util";
import Logger from "./logger.js";

export const connectDB = (lightship?: any): void => {
  try {
    const { MONGO_URI } = process.env;

    const uri = String(MONGO_URI);
    connect(uri)
      .then(() => {
        Logger.log("mongo", "MongoDB Connected. ✅");
      })
      .catch((err) => {
        Logger.log("fatal", "Error conncting Mongo");
        Logger.error(err);
        lightship.shutdown();
      });
    const setDebug = process.env.MONGO_DEBUG === "true";
    if (setDebug) {
      mongoose.set("debug", (collectionName, methodName, ...methodArgs) => {
        const msgMapper = (m: any) => {
          return inspect(m, false, 10, true)
            .replace(/\n/g, "")
            .replace(/\s{2,}/g, " ");
        };
        Logger.log(
          "mongo",
          `${collectionName}.${methodName}` +
            `(${methodArgs.map(msgMapper).join(", ")})`
        );
      });
    }
  } catch (err) {
    Logger.log("fatal", "Something went wrong");
    Logger.error(err);
    lightship.shutdown();
  }
};
