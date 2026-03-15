import { Router } from "express";
import { prisma } from "./db";
import { authMiddleware, roleMiddleware, AuthRequest, AppRole } from "./authMiddleware";

const router = Router();

// All admin routes require auth + role loading
router.use(authMiddleware, roleMiddleware);

// Only ADMIN can access these routes
function requireAdmin(req: AuthRequest, res: any, next: any) {
    if (req.role !== "ADMIN") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
}

router.use(requireAdmin);

// GET /api/admin/users — list all users (no passwords)
router.get("/users", async (req: AuthRequest, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(users);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to list users" });
    }
});

// PATCH /api/admin/users/:id/role — change a user's role
router.patch("/users/:id/role", async (req: AuthRequest, res) => {
    try {
        const { role } = req.body;
        const validRoles: AppRole[] = ["ADMIN", "MEMBER", "VIEWER"];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be ADMIN, MEMBER, or VIEWER" });
        }

        // Prevent admin from demoting themselves
        if (req.params.id === req.userId) {
            return res.status(400).json({ error: "You cannot change your own role" });
        }

        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update user role" });
    }
});

export default router;
