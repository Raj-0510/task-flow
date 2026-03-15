import { Router } from "express";
import { prisma } from "./db";
import { authMiddleware, roleMiddleware, requireCanMutate, AuthRequest } from "./authMiddleware";

const router = Router();

router.use(authMiddleware, roleMiddleware);

async function ensureProjectOwnership(req: AuthRequest, projectId: string): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: req.userId! },
  });
  return !!project;
}

router.get("/projects/:projectId/tasks", async (req: AuthRequest, res) => {
  try {
    const owned = await ensureProjectOwnership(req, req.params.projectId);
    if (!owned) return res.status(404).json({ error: "Project not found" });
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "asc" },
    });
    res.json(tasks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

router.post("/projects/:projectId/tasks", requireCanMutate, async (req: AuthRequest, res) => {
  try {
    const owned = await ensureProjectOwnership(req, req.params.projectId);
    if (!owned) return res.status(404).json({ error: "Project not found" });
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        projectId: req.params.projectId,
      },
    });
    res.status(201).json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/tasks/:id", requireCanMutate, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!task || task.project.userId !== req.userId) {
      return res.status(404).json({ error: "Task not found" });
    }
    const { title, completed } = req.body;
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title?.trim() ?? task.title }),
        ...(typeof completed === "boolean" && { completed }),
      },
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/tasks/:id", requireCanMutate, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!task || task.project.userId !== req.userId) {
      return res.status(404).json({ error: "Task not found" });
    }
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
