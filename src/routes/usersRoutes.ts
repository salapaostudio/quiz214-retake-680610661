import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest } from "../libs/types.js";

// import authentication middleware
import { authenticateToken } from "../middlewares/authenMiddleware.js";

// import database
import { users } from "../db/db.js";

const router = Router();
const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET ?? "quiz2-development-secret";

// POST /api/vXXX/auth/login
router.post("/login", (req: Request, res: Response) => {
  try { 
    const { username, password } = req.body ?? {};
    const user = users.find((u: User) => u.username === username);
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Username or Password is incorrect",
      });
    }
    const payload = { username: user.username, userId: user.userId };
    const token = jwt.sign(payload, accessTokenSecret, {
      expiresIn: "10m",
    });
    if (!user.tokens) {
      user.tokens = [];
    }
    user.tokens.push(token);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/vXXX/auth/logout
router.post("/logout", authenticateToken, (req: CustomRequest, res: Response) => {
  try {
    const payload = req.user;
    const token = req.token;

    if (!payload || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // find user by payload.username
    const user = users.find((u: User) => u.username === payload.username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // check if token exists in user.tokens
    if (!user.tokens || !user.tokens.includes(token)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // if token exists, remove the token from user.tokens
    user.tokens = user.tokens?.filter((t) => t !== token);
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/vXXX/auth/reset
// router.post("/reset", (req: Request, res: Response) => {
//   try {
//     reset_users();
//     return res.status(200).json({
//       success: true,
//       message: "User database has been reset",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Something is wrong, please try again",
//       error: err,
//     });
//   }
// });

export default router;
