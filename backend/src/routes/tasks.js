const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { requireMember, requireAdmin } = require('../middleware/rbac');

const prisma = new PrismaClient();

// GET /api/projects/:id/tasks
router.get('/projects/:id/tasks', auth, requireMember, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/tasks
router.post('/projects/:id/tasks', auth, requireMember, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId: req.params.id } }
      });
      if (!isMember) return res.status(400).json({ error: 'Assignee is not a project member' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.id,
        creatorId: req.userId,
        assigneeId: assigneeId || null
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:id/tasks/:taskId
router.put('/projects/:id/tasks/:taskId', auth, requireMember, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.membership.role !== 'ADMIN' && task.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this task' });
    }

    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/projects/:id/tasks/:taskId/status
router.patch('/projects/:id/tasks/:taskId/status', auth, requireMember, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (
      req.membership.role !== 'ADMIN' &&
      task.assigneeId !== req.userId &&
      task.creatorId !== req.userId
    ) {
      return res.status(403).json({ error: 'Not authorized to update this task status' });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id/tasks/:taskId
router.delete('/projects/:id/tasks/:taskId', auth, requireAdmin, async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
