import bcrypt from 'bcryptjs';
import { ErrorHandler } from '../utils/ErrorHandler.js'; 
import User from '../models/User.Model.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(ErrorHandler(409, "User already exists"));
        }

        const salt = await bcrypt.genSalt(10);  
        const hashedPassword = await bcrypt.hash(password, salt); 

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const userResponse = await User.findById(newUser._id).select('-password');  // Exclude password

        res.status(201).json({
            message: "User created successfully",
            user: userResponse
        });

    } catch (error) {
        return next(ErrorHandler(500, "Error while signing up user: " + error.message));
    }
};


export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return next(ErrorHandler(401, "Invalid credentials"));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next(ErrorHandler(401, "Invalid credentials"));
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email }, 
            process.env.JWT_SECRET_KEY,  
            { expiresIn: '1h' } 
        );

        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email
        };

        res.cookie('access_token', token, {
            httpOnly: true, 
            maxAge: 3600000,
            sameSite: 'strict'
        });
        res.status(200).json({
            message: "User signed in successfully",
            token: token,  
            user: userResponse 
        });

    } catch (error) {
        return next(ErrorHandler(500, "Error during sign-in: " + error.message));
    }
};

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
