const workspaceService = require("../services/workspace.service");

const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const workspace = await workspaceService.createWorkspace({
      name,
      userId,
    });
    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ error: "Failed to create workspace" });
  }
};

const getUserWorkspace = async (req, res) => {
  const userId = req.user.id;

  try {
    const workspaces = await workspaceService.getUserWorkspace(userId);
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
};

const deleteWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
    await workspaceService.deleteWorkspace({ workspaceId, userId });
    res.json({ message: "Workspace deleted successfully" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to delete workspace" });
  }
};

module.exports = { createWorkspace, getUserWorkspace, deleteWorkspace };
