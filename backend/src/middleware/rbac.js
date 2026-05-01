const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requireMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.userId, projectId } }
    });
    if (!membership) return res.status(403).json({ error: 'Not a project member' });
    req.membership = membership;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.userId, projectId } }
    });
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.membership = membership;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { requireMember, requireAdmin };
