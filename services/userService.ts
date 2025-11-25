import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";

interface UserResponse {
  id: string;
  username: string;
  email: string;
}

export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find().select("-password");
};

export const createUser = async (userData: any): Promise<UserResponse> => {
  const { username, email, password } = userData;

  let user = await User.findOne({ email });
  if (user) {
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();
  return { id: user.id, username: user.username, email: user.email };
};

export const deleteUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
