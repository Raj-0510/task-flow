import { Router } from "express";
import { prisma } from "./db";
import { authMiddleware, roleMiddleware, AuthRequest } from "./authMiddleware";

const router = Router();

router.get("/", authMiddleware, roleMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const [projects, recentProjects] = await Promise.all([
      prisma.project.findMany({
        where: { userId },
        select: { id: true },
      }),
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { tasks: true } },
        },
      }),
    ]);
    const projectIds = projects.map((p) => p.id);
    const totalTasks = projectIds.length
      ? await prisma.task.count({ where: { projectId: { in: projectIds } } })
      : 0;
    res.json({
      totalProjects: projects.length,
      totalTasks,
      recentProjects: recentProjects.map((p) => ({
        id: p.id,
        title: p.title,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        taskCount: p._count.tasks,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;
