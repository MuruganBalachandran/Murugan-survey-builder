// region imports
import { Hono } from "hono";
import { login, logout, signup, verify } from "../controllers/authController";
import { authMiddleware, rateLimitMiddleware } from "../middleware";

// endregion

// routes initialization
const authRoutes = new Hono();

// region routes
// section signup - rate limited
authRoutes.post("/signup", rateLimitMiddleware, signup);

// section login - rate limited
authRoutes.post("/login", rateLimitMiddleware, login);

// section verify token — protected by authMiddleware which handles cookie + JWT
authRoutes.get('/verify', authMiddleware, verify)

// section logout - protected and rate limited
authRoutes.post("/logout", rateLimitMiddleware, authMiddleware, logout);
// endregion

// region export
export default authRoutes;
// endregion
