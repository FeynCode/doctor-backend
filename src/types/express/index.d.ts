import { IDoctor } from "../../schemas/doctor.schema.ts";

// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      doctor: IDoctor | null | undefined;
    }
  }
}
