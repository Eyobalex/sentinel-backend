import { Request, Response } from "express";
import * as userService from "../services/userService";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
