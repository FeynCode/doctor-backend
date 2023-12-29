import { Router } from "express";
import doctorRouter from "./controller/doctor/doctor.routes.ts";

const globalRouter = Router();

// globalRouter.post('/auth/refresh', )
globalRouter.use("/doctor", doctorRouter);

export default globalRouter;
