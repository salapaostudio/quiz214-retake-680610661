import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { type CustomRequest, type UserPayload } from "../libs/types.js";
import { users } from "../db/db.js";

const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET ?? "quiz2-development-secret";

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : undefined;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  jwt.verify(
    token,
    accessTokenSecret,
    (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access",
        });
      }
      const payload = user as UserPayload;
      const account = users.find((entry) => entry.username === payload.username);

      // token ที่ logout ไปแล้วจะต้องไม่สามารถใช้เรียก API ต่อได้
      if (!account?.tokens?.includes(token)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access",
        });
      }

      req.user = payload;
      req.token = token;
      next();
    }
  );
};

export default authenticateToken;
