import jwt from "jsonwebtoken";

export const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.token;

      if (token) {
        const accessToken = token.split(" ")[1];
        if (!accessToken) {
          return res.status(401).json({ message: "Access token is missing" });
        }
        jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
          if (err) {
            return res.status(403).json({ message: "Invalid access token" });
          }
          req.user = user;
          next();
        });

      }else {
        return res.status(401).json({ message: "Access token is missing" });
      }
    } catch (error) {
      console.log("Error in protectRoute middleware: ", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  verifyTokenAndAdminAuth: async (req, res, next) => {
    authMiddleware.verifyToken(req, res, () => {
      if (req.user.id == req.params.id || req.user.admin) {
        next();
      } else {
        return res.status(403).json({ message: "You are not allowed to perform this action" });
      }
    });
  }
}