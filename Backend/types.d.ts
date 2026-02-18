import { Request } from "express";
import { AdminModel } from "./src/models/adminModel";
import { UserModel } from "./src/models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
      admin?: AdminModel;
    }
  }
}