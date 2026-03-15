import { Router } from "express";
import { prisma } from "./db";
import { authMiddleware, roleMiddleware, requireCanMutate, AuthRequest } from "./authMiddleware";

const router = Router();

router.use(authMiddleware, roleMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId! },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { tasks: true } },
      },
    });
    res.json(projects);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list projects" });
  }
});

router.post("/", requireCanMutate, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: req.userId!,
      },
    });
    res.status(201).json(project);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: { tasks: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get project" });
  }
});

router.patch("/:id", requireCanMutate, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const { title, description } = req.body;
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title?.trim() ?? project.title }),
        ...(description !== undefined && { description: description?.trim() ?? null }),
      },
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/:id", requireCanMutate, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
