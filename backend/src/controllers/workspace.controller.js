const prisma = require("../lib/prisma");

const getDocumentOwner = async (req, res) => {
  const { documentId } = req.params;
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { workspace: true },
    });
    if (!document) return res.status(404).json({ error: "Not found" });
    res.json({ ownerId: document.workspace.ownerId });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        documents: {
          create: {
            title: "Welcome Document",
            content: "",
          },
        },
      },
    });
    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ error: "Failed to create workspace" });
  }
};

const getUserWorkspace = async (req, res) => {
  const userId = req.user.id;
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        documents: true,
      },
    });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
};

const deleteDocument = async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;

  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { workspace: true },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    if (document.workspace.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this document" });
    }

    await prisma.document.delete({ where: { id: documentId } });
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete document" });
  }
};

const deleteWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
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
    res.json({ message: "Workspace deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete workspace" });
  }
};

const createDocument = async (req, res) => {
  const { workspaceId } = req.params;
  const { title } = req.body;
  const userId = req.user.id;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    if (workspace.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to add documents to this workspace" });
    }

    const document = await prisma.document.create({
      data: {
        title: title?.trim() || "Untitled Document",
        content: "",
        workspaceId,
      },
    });
    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ error: "Failed to create document" });
  }
};

const saveDocument = async (req, res) => {
  const { documentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { workspace: true },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    if (document.workspace.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to save this document" });
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { content },
    });
    res.json({ message: "Document saved successfully", document: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to save document" });
  }
};

const saveDocumentToDashboard = async (req, res) => {
  const { documentId } = req.params;
  const { workspaceId } = req.body;
  const userId = req.user.id;

  try {
    const source = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!source) {
      return res.status(404).json({ error: "Document not found" });
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
        return res
          .status(403)
          .json({ error: "Not authorized to use this workspace" });
      }
    }

    const newDoc = await prisma.document.create({
      data: {
        title: `${source.title} (shared copy)`,
        content: source.content,
        workspaceId: targetWorkspaceId,
      },
    });

    res
      .status(201)
      .json({ message: "Document saved to your dashboard!", document: newDoc });
  } catch (err) {
    res.status(500).json({ error: "Failed to save document to dashboard" });
  }
};

module.exports = {
  createWorkspace,
  getUserWorkspace,
  deleteDocument,
  deleteWorkspace,
  createDocument,
  saveDocument,
  saveDocumentToDashboard,
  getDocumentOwner,
};
