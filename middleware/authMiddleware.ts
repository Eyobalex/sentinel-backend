import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

export default function (req: AuthRequest, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header("Authorization");

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
}
