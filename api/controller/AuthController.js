import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/ErrorHandler.js'; 
import User from '../models/User.Model.js';

// 🔒 Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      avatar: user.avatar || null,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1h' }
  );
};

// 📤 Format User Response
const formatUserResponse = (user) => {
  const { password, ...userData } = user._doc;
  return userData;
};

// 📝 SIGN UP
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return next(ErrorHandler(409, "User already exists"));

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const savedUser = await User.findById(newUser._id).select('-password');

    const token = generateToken(savedUser);

    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict'
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: savedUser,
    });

  } catch (error) {
    return next(ErrorHandler(500, "Error while signing up user: " + error.message));
  }
};

// 🔐 SIGN IN
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return next(ErrorHandler(401, "Invalid credentials"));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(ErrorHandler(401, "Invalid credentials"));

    const token = generateToken(user);
    const userData = formatUserResponse(user);

    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict'
    });

    res.status(200).json({
      message: "User signed in successfully",
      token,
      user: userData
    });

  } catch (error) {
    return next(ErrorHandler(500, "Error during sign-in: " + error.message));
  }
};

// 🚪 SIGN OUT
export const signout = (req, res, next) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'strict',
    });

    res.status(200).json({
      message: "User signed out successfully"
    });
  } catch (error) {
    return next(ErrorHandler(500, "Error during sign-out: " + error.message));
  }
};

// 🔑 GOOGLE AUTH
export const google = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      const token = generateToken(existingUser);
      const userData = formatUserResponse(existingUser);

      res.cookie('access_token', token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: 'strict'
      });

      return res.status(200).json({
        message: "User signed in successfully via Google",
        token,
        user: userData
      });
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(randomPassword, 10);

    let baseUsername = req.body.email.split('@')[0];
    let finalUsername = baseUsername;
    let counter = 1;

    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${baseUsername}${counter++}`;
    }

    const newUser = new User({
      username: finalUsername,
      email: req.body.email,
      password: hashedPassword,
      avatar: req.body.avatar || null, // Optional avatar from Google
    });

    await newUser.save();
    const token = generateToken(newUser);
    const userData = formatUserResponse(newUser);

    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict'
    });

    return res.status(201).json({
      message: "User signed up and signed in via Google",
      token,
      user: userData
    });

  } catch (error) {
    return next(ErrorHandler(500, "Error during Google auth: " + error.message));
  }
};