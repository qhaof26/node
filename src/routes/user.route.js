import express from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware.verifyToken,userController.getAllUsers);
router.put("/:id", authMiddleware.verifyTokenAndAdminAuth,userController.updateUser);

router.delete("/:id", authMiddleware.verifyTokenAndAdminAuth,userController.deleteUser);

export default router;