const prisma = require("../lib/prisma");

const getDocumentOwner = async (documentId) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { workspace: true },
  });

  if (!document) {
    const error = new Error("Not found");
    error.status = 404;
    throw error;
  }

  return { ownerId: document.workspace.ownerId };
};

const createDocument = async ({ workspaceId, title, userId }) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    const error = new Error("Workspace not found");
    error.status = 404;
    throw error;
  }
  if (workspace.ownerId !== userId) {
    const error = new Error(
      "Not authorized to add documents to this workspace",
    );
    error.status = 403;
    throw error;
  }

  return prisma.document.create({
    data: {
      title: title?.trim() || "Untitled Document",
      content: "",
      workspaceId,
    },
  });
};

const deleteDocument = async ({ documentId, userId }) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { workspace: true },
  });

  if (!document) {
    const error = new Error("Document not found");
    error.status = 404;
    throw error;
  }
  if (document.workspace.ownerId !== userId) {
    const error = new Error("Not authorized to delete this document");
    error.status = 403;
    throw error;
  }

  await prisma.document.delete({ where: { id: documentId } });
};

const saveDocument = async ({ documentId, content, userId }) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { workspace: true },
  });

  if (!document) {
    const error = new Error("Document not found");
    error.status = 404;
    throw error;
  }
  if (document.workspace.ownerId !== userId) {
    const error = new Error("Not authorized to save this document");
    error.status = 403;
    throw error;
  }

  return prisma.document.update({
    where: { id: documentId },
    data: { content },
  });
};

const saveDocumentToDashboard = async ({ documentId, workspaceId, userId }) => {
  const source = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!source) {
    const error = new Error("Document not found");
    error.status = 404;
    throw error;
  }

  let targetWorkspaceId = workspaceId;

  if (!targetWorkspaceId) {
    let workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
    });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "My Workspace", ownerId: userId },
      });
    }
    targetWorkspaceId = workspace.id;
  } else {
    const workspace = await prisma.workspace.findUnique({
      where: { id: targetWorkspaceId },
    });
    if (!workspace || workspace.ownerId !== userId) {
      const error = new Error("Not authorized to use this workspace");
      error.status = 403;
      throw error;
    }
  }

  return prisma.document.create({
    data: {
      title: `${source.title} (shared copy)`,
      content: source.content,
      workspaceId: targetWorkspaceId,
    },
  });
};

module.exports = {
  getDocumentOwner,
  createDocument,
  deleteDocument,
  saveDocument,
  saveDocumentToDashboard,
};
