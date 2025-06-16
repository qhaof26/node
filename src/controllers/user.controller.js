import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import cloudinary from '../lib/cloudinary.js';

export const userController = {
    getAllUsers: async (req, res) => {
        try {
            const user = await User.find();
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve user" });
        }
    },
    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { name, username, password, email, phone, avatar } = req.body;

            if (!userId) {
                return res.status(400).json({ error: "User ID is required" });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const updatedData = {
                name: name || user.name,
                username: username || user.username,
                email: email || user.email,
                phone: phone || user.phone,
                avatar: user.avatar 
            };

            if (avatar && avatar.startsWith('http')) {
                const uploadResponse = await cloudinary.uploader.upload(avatar);
                updatedData.avatar = uploadResponse.secure_url;
            }

            if (password && password.trim() !== '') {
                const salt = await bcrypt.genSalt(10);
                updatedData.password = await bcrypt.hash(password, salt);
            }

            const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

            const { password: _, ...safeUser } = updatedUser._doc;

            res.status(200).json({ message: "User updated successfully", user: safeUser });
        } catch (error) {
            console.error("Update user error:", error.message);
            res.status(500).json({ error: "Failed to update user" });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({ error: "User ID is required" });
            }
            
            const user = await User.findByIdAndUpdate(
                userId,
                { isDeleted: true, deletedAt: new Date() },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: "Failed to delete user" });
        }
    }
};