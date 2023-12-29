import { Request, Response } from "express";
import Logger from "../../../utils/logger.ts";
import {
  errorResFormatter,
  successResFormatter,
} from "../../../middleware/response.middleware.ts";
import { DoctorModel, IDoctor } from "../../../schemas/doctor.schema.ts";
import { validateEmail } from "../../../utils/validation.ts";
import { generateNumber } from "../doctor.service.ts";
import { DateTime } from "luxon";
import { sendEmail } from "../../../utils/email.ts";
import { emailTemplateIds } from "../../../constants/email.template.ts";
import { getTokens } from "../../../middleware/authentication.middleware.ts";

export const sendOtp = async (_req: Request, _res: Response) => {
  try {
    const { email } = _req.body;
    if (!email) {
      return errorResFormatter(400, "E0004", {}, _req, _res);
    }
    const doctor = await DoctorModel.findOne({ email: email });
    if (!doctor) {
      return errorResFormatter(400, "E0005", {}, _req, _res);
    }
    const otp = generateNumber(6);
    if (doctor!.retryCount >= 3) {
      const now = DateTime.now();
      const lastOtpTime = DateTime.fromJSDate(doctor.lastOtpTime as Date);
      const nextRetry = lastOtpTime.plus({ seconds: 30 });
      const diff = nextRetry.diff(now, ["seconds"]).toObject();
      if ((diff?.seconds || 0) <= 0) {
        sendEmail([email], emailTemplateIds.SEND_OTP, { otp });
        const updateDoctor = await DoctorModel.findOneAndUpdate(
          { email },
          {
            otp,
            lastOtpTime: new Date(),
            retryCount: 1,
          },
          { new: true, lean: true }
        );
        if (updateDoctor) {
          return successResFormatter(
            200,
            "S0002",
            {
              email: updateDoctor.email,
              retryCount: updateDoctor.retryCount,
              retryTime: DateTime.now().plus({ seconds: 5 }).toJSDate(),
            },
            _req,
            _res
          );
        }
        return errorResFormatter(400, "E0004", {}, _req, _res);
      }
      return errorResFormatter(
        429,
        "E0009",
        { retryTime: nextRetry },
        _req,
        _res
      );
    }
    sendEmail([email], emailTemplateIds.SEND_OTP, { otp });
    const updateDoctor = await DoctorModel.findOneAndUpdate(
      { email },
      {
        otp,
        lastOtpTime: new Date(),
        retryCount: (doctor!.retryCount || 0) + 1,
      },
      { new: true, lean: true }
    );
    if (updateDoctor) {
      return successResFormatter(
        200,
        "S0002",
        {
          email: updateDoctor.email,
          retryCount: updateDoctor.retryCount,
          retryTime: DateTime.now().plus({ seconds: 30 }).toJSDate(),
        },
        _req,
        _res
      );
    }
    return errorResFormatter(400, "E0004", {}, _req, _res);
  } catch (err: any) {
    Logger.error("Send OTP API: " + err);
    return errorResFormatter(500, "E0006", {}, _req, _res);
  }
};

export const verifyOtp = async (_req: Request, _res: Response) => {
  try {
    const { email, otp } = _req.body;
    if (!email || !otp) {
      return errorResFormatter(400, "E0004", {}, _req, _res);
    }
    const doctor: IDoctor | null = await DoctorModel.findOne(
      {
        email: email,
        isDeleted: false,
      },
      {
        email: 1,
        firstName: 1,
        lastName: 1,
        lastOtpTime: 1,
        otp: 1,
      }
    ).lean();
    if (!doctor) {
      return errorResFormatter(400, "E0005", {}, _req, _res);
    }
    if (otp === doctor.otp || otp === process.env.MASTER_OTP) {
      const now = DateTime.now();
      const lastOtpTime = DateTime.fromJSDate(doctor.lastOtpTime as Date);
      const expiryTime = lastOtpTime.plus({ minute: 5 });
      const diff = expiryTime.diff(now, ["seconds"]).toObject();
      if (otp !== process.env.MASTER_OTP && (diff?.seconds || 0) <= 0) {
        return errorResFormatter(400, "E0010", {}, _req, _res);
      }
      const updateDoctor: IDoctor | null = await DoctorModel.findOneAndUpdate(
        {
          email: email,
          isDeleted: false,
        },
        {
          retryCount: 0,
        },
        { new: true }
      )
        .select({
          email: 1,
          firstName: 1,
          lastName: 1,
        })
        .lean();

      if (!updateDoctor) {
        return errorResFormatter(400, "E0005", {}, _req, _res);
      }
      const token = await getTokens(updateDoctor);
      _res
        .cookie("refreshToken", token?.refreshToken, {
          httpOnly: true,
          sameSite: "strict",
        })
        .header("Authorization", token?.accessToken);
      return successResFormatter(
        200,
        "S0003",
        { ...token, ...updateDoctor },
        _req,
        _res
      );
    }
    return errorResFormatter(400, "E0003", {}, _req, _res);
  } catch (err) {
    Logger.error("Verify OTP API: " + err);
    return errorResFormatter(500, "E0006", {}, _req, _res);
  }
};

export const registerDoctor = async (_req: Request, _res: Response) => {
  try {
    const { email, firstName, lastName } = _req.body;
    console.log({ email, firstName, lastName, body: _req.accepts() });
    if (!email) {
      return errorResFormatter(400, "E0004", {}, _req, _res);
    }
    if (!validateEmail(email)) {
      return errorResFormatter(400, "E0008", {}, _req, _res);
    }
    const doctor = await DoctorModel.findOne({ email: email });
    if (doctor) {
      return errorResFormatter(400, "E0007", {}, _req, _res);
    }
    const newDoctor = new DoctorModel({
      email,
      firstName,
      lastName,
      retryCount: 0,
    });
    await newDoctor.save();
    return successResFormatter(200, "S0001", {}, _req, _res);
  } catch (err: any) {
    Logger.error("Register API: " + JSON.stringify(err));
    return errorResFormatter(500, "E0006", {}, _req, _res);
  }
};
