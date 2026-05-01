const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/users/search?q=
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ],
        NOT: { id: req.userId }
      },
      select: { id: true, name: true, email: true },
      take: 10
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const now = new Date();

    const myTasks = await prisma.task.findMany({
      where: { assigneeId: req.userId },
      include: {
        project: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      include: {
        project: {
          include: {
            _count: { select: { tasks: true, members: true } },
            tasks: { select: { status: true } }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const overdueTasks = myTasks.filter(
      t => t.dueDate && t.dueDate < now && t.status !== 'DONE'
    );
    const upcomingTasks = myTasks.filter(t => t.status !== 'DONE').slice(0, 6);

    res.json({
      stats: {
        totalProjects: memberships.length,
        totalTasks: myTasks.length,
        completedTasks: myTasks.filter(t => t.status === 'DONE').length,
        inProgressTasks: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
        overdueTasks: overdueTasks.length
      },
      overdueTasks,
      upcomingTasks,
      recentProjects: memberships.slice(0, 4).map(m => ({
        ...m.project,
        myRole: m.role,
        taskStats: {
          total: m.project.tasks.length,
          done: m.project.tasks.filter(t => t.status === 'DONE').length,
          inProgress: m.project.tasks.filter(t => t.status === 'IN_PROGRESS').length
        }
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
