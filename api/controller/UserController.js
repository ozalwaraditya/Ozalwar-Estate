import { ErrorHandler } from "../utils/ErrorHandler.js";
import bcrypt from 'bcryptjs';
import User from '../models/User.Model.js';

export const UpdateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(ErrorHandler(403, "You can update only your account"));

  try {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: "User updated successfully!",
      user: rest,
    });

  } catch (error) {
    next(error);
  }
};

export const DeleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(ErrorHandler(403, "You can delete only your own account"));
  }

  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("access_token");

    return res.status(200).json({
      message: "User deleted successfully!",
    });
    
  } catch (error) {
    next(error);
  }
};
