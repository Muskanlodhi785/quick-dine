import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middlewares/auth.js";

const generateToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "30d" });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user: InstanceType<typeof User>) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  token: generateToken(user._id.toString()),
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Please fill all the fields" });
      return;
    }
    if (!EMAIL_RE.test(String(email))) {
      res.status(400).json({ message: "Please provide a valid email address" });
      return;
    }
    if (String(password).length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" });
      return;
    }

    // Security: never trust a client-supplied role. Public signup can only
    // create a customer or (explicitly requested) an owner - never an admin.
    const requestedRole = req.body.role;
    const role: "user" | "owner" = requestedRole === "owner" ? "owner" : "user";

    const userExists = await User.findOne({ email: String(email).toLowerCase() });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      password: hashedPassword,
      ...(phone ? { phone } : {}),
      role,
    });

    res.status(201).json(publicUser(user));
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Registration failed, please try again" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password" });
      return;
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(String(password), user.password || "");
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.json(publicUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed, please try again" });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    res.json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
