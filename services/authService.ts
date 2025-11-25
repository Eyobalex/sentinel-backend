import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const registerUser = async (userData: any): Promise<AuthResponse> => {
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

  const payload = { user: { id: user.id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
    expiresIn: "1h",
  });

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  let user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }

  const payload = { user: { id: user.id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
    expiresIn: "1h",
  });

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
};
