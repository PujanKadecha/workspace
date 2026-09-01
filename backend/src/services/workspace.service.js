const prisma = require("../lib/prisma");

const createWorkspace = async ({ name, userId }) => {
  return prisma.workspace.create({
    data: {
      name,
      ownerId: userId,
      documents: {
        create: {
          title: "Welcome Document",
          content: "Welcome to the First Document",
        },
      },
    },
  });
};

const getUserWorkspace = async (userId) => {
  return prisma.workspace.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      documents: true,
    },
  });
};

const deleteWorkspace = async ({ workspaceId, userId }) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }
  if (workspace.ownerId !== userId) {
    return res
      .status(403)
      .json({ error: "Not authorized to delete this workspace" });
  }

  await prisma.document.deleteMany({ where: { workspaceId } });
  await prisma.workspace.delete({ where: { id: workspaceId } });
};

module.exports = { createWorkspace, getUserWorkspace, deleteWorkspace };



