const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { requireMember, requireAdmin } = require('../middleware/rbac');

const prisma = new PrismaClient();

// GET /api/projects — list projects I belong to
router.get('/', auth, async (req, res) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      include: {
        project: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { tasks: true, members: true } }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });
    const projects = memberships.map(m => ({ ...m.project, myRole: m.role }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects — create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.userId,
        members: { create: { userId: req.userId, role: 'ADMIN' } }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } }
      }
    });
    res.status(201).json({ ...project, myRole: 'ADMIN' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id — get project detail
router.get('/:id', auth, requireMember, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json({ ...project, myRole: req.membership.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:id — update project
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description }
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id — delete project (owner only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (project.ownerId !== req.userId)
      return res.status(403).json({ error: 'Only the owner can delete this project' });

    await prisma.task.deleteMany({ where: { projectId: req.params.id } });
    await prisma.projectMember.deleteMany({ where: { projectId: req.params.id } });
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/members — invite member
router.post('/:id/members', auth, requireAdmin, async (req, res) => {
  try {
    const { userId, role = 'MEMBER' } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: req.params.id } }
    });
    if (existing) return res.status(400).json({ error: 'User is already a member' });

    const member = await prisma.projectMember.create({
      data: { userId, projectId: req.params.id, role },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:id/members/:userId — change role
router.put('/:id/members/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER'].includes(role))
      return res.status(400).json({ error: 'Role must be ADMIN or MEMBER' });
    const member = await prisma.projectMember.update({
      where: { userId_projectId: { userId: req.params.userId, projectId: req.params.id } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id/members/:userId — remove member
router.delete('/:id/members/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (project.ownerId === req.params.userId)
      return res.status(400).json({ error: 'Cannot remove the project owner' });

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId: req.params.userId, projectId: req.params.id } }
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
