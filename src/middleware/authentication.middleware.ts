import { sign, verify } from "jsonwebtoken";
import Logger from "../utils/logger.ts";
import { IDoctor } from "./../schemas/doctor.schema";
import UserToken from "../schemas/user-token.schema.ts";
import { NextFunction, Request, Response } from "express";
import { errorResFormatter } from "./response.middleware.ts";

const secret = process.env.JWT_SECRET as string;
const refresh_secret = process.env.REFRESH_SECRET as string;
export const getTokens = async (doctor: IDoctor) => {
  try {
    const accessToken = sign({ doctor }, secret, { expiresIn: "15m" });
    const refreshToken = sign({ doctor }, refresh_secret, { expiresIn: "90d" });

    const userToken = await UserToken.findOne({ doctorId: doctor._id });
    if (userToken) await userToken.deleteOne({ doctorId: doctor._id });

    await new UserToken({ doctorId: doctor._id, token: refreshToken }).save();

    return { accessToken, refreshToken };
  } catch (err) {
    Logger.error("SignToken: " + err);
  }
};

export const verifyToken = (token: string, type: string = "auth") => {
  try {
    const { doctor } = verify(
      token,
      type === "refresh" ? refresh_secret : secret
    ) as unknown as { doctor: IDoctor };
    return doctor;
  } catch (err) {
    Logger.error("SignToken: " + err);
    return null;
  }
};

export const authenticationMiddleware = async (
  _req: Request,
  _res: Response,
  _next: NextFunction
) => {
  try {
    console.log("hi", _req.cookies["refreshToken"]);
    const accessToken = _req.headers["authorization"];
    const refreshToken = _req.cookies["refreshToken"];

    if (!accessToken || !refreshToken) {
      return errorResFormatter(401, "E0013", {}, _req, _res);
    }

    // console.log(accessToken, refreshToken);

    try {
      if (!accessToken) {
        return errorResFormatter(401, "E0014", {}, _req, _res);
      }
      const doctor = verifyToken(accessToken);
      _req.doctor = doctor;
      _next();
    } catch (error) {
      if (!refreshToken) {
        return errorResFormatter(401, "E0015", {}, _req, _res);
      }

      try {
        const doctor = verifyToken(refreshToken, "refresh");
        const accessToken = sign({ doctor }, secret, { expiresIn: "15m" });

        return _res
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
          })
          .header("Authorization", accessToken);
      } catch (error) {
        return errorResFormatter(401, "E0011", {}, _req, _res);
      }
    }
  } catch (error) {
    Logger.error("Authentication Middleware: ");
    Logger.error(error);
    return errorResFormatter(500, "E0006", {}, _req, _res);
  }
};
