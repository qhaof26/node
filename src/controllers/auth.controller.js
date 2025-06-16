import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import cloudinary from '../lib/cloudinary.js';

let refreshTokens = [];

export const authController = {
    register: async (req, res) => {
        try {
            const { name, username, password, email, phone, avatar } = req.body;

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            let imageUrl;
            if (avatar) {
                const uploadResponse = await cloudinary.uploader.upload(avatar);
                imageUrl = uploadResponse.secure_url;
            }

            const newUser = await new User({
                name,
                username,
                password: hashedPassword,
                email,
                phone,
                avatar: imageUrl || "",
            });
            await newUser.save();
            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            res.status(500).json({ error: "Registration failed" });
        }
    },
    generateAccessToken: (user) => {
        return jwt.sign(
            { id: user.id, admin: user.admin },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '30s' }
        );
    },
    generateRefreshToken: (user) => {
        return jwt.sign(
            { id: user.id, admin: user.admin },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '365d' }
        );
    },
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Invalid password" });
            }
            
            if(user && isPasswordValid) {
                const accessToken = authController.generateAccessToken(user);
                const refreshToken = authController.generateRefreshToken(user);
                refreshTokens.push(refreshToken);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                });
                const { password: _, ...userWithoutPassword } = user._doc;

                return res.status(200).json({ userWithoutPassword, accessToken , refreshToken });
            }
        } catch (error) {
            res.status(500).json({ error: "Login failed" });
        }
    },
    logout: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: "Refresh token is missing" });
        }
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    },
    requestRefreshToken: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: "Refresh token is missing" });
        }
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ error: "Refresh token is invalid" });
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Invalid refresh token" });
            }

            refreshTokens = refreshTokens.filter(token => token !== refreshToken);

            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);

            refreshTokens.push(newRefreshToken);

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
            });
            res.status(200).json({ accessToken: newAccessToken });
        });
    }
};