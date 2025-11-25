import { Request, Response } from "express";
import * as authService from "../services/authService";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);
    res.json(result);
  } catch (err: any) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh Token is required" });
    }
    const accessToken = await authService.refreshToken(refreshToken);
    res.json({ accessToken });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken);
    res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
