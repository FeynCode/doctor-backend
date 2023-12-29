import { Request, Response, Router } from "express";
import * as DoctorLoginController from "./login/doctor-login.controller.ts";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.ts";
import { successResFormatter } from "../../middleware/response.middleware.ts";

const doctorRouter = Router();

doctorRouter.post("/send-otp", DoctorLoginController.sendOtp);
doctorRouter.post("/verify-otp", DoctorLoginController.verifyOtp);
doctorRouter.post("/", DoctorLoginController.registerDoctor);
doctorRouter.post(
  "/prot",
  authenticationMiddleware,
  async (_req: Request, _res: Response) => {
    return successResFormatter(
      200,
      "S0001",
      { message: "Protected" },
      _req,
      _res
    );
  }
);

export default doctorRouter;
