import User, { IUser } from "../models/User";
import RefreshToken from "../models/RefreshToken";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

const generateTokens = async (user: IUser) => {
  const payload = { user: { id: user.id } };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
    expiresIn: "15m",
  });

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await new RefreshToken({
    token: refreshToken,
    user: user.id,
    expiresAt,
  }).save();

  return { accessToken, refreshToken };
};

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

  const tokens = await generateTokens(user);

  return {
    ...tokens,
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

  const tokens = await generateTokens(user);

  return {
    ...tokens,
    user: { id: user.id, username: user.username, email: user.email },
  };
};

export const refreshToken = async (token: string): Promise<string> => {
  const refreshTokenDoc = await RefreshToken.findOne({ token }).populate(
    "user"
  );

  if (!refreshTokenDoc || refreshTokenDoc.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = refreshTokenDoc.user as unknown as IUser;
  const payload = { user: { id: user.id } };

  return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
    expiresIn: "15m",
  });
};

export const logoutUser = async (token: string) => {
  await RefreshToken.findOneAndDelete({ token });
};
