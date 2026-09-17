import { type Response, type NextFunction } from "express";
import { type CustomRequest } from "../libs/types.js";
import { users } from "../db/db.js";

export const checkRoleMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // get payload and token from (custom) request
  const payload = req.user;
  const user = users.find((entry) => entry.username === payload?.username);

  if (!user || !payload?.userId || user.userId !== payload.userId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden access",
    });
  }

  if (req.params.userId && req.params.userId !== user.userId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden access",
    });
  }

  next();
};

export default checkRoleMiddleware;
