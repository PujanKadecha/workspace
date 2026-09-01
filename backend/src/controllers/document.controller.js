const documentService = require("../services/document.service");

const getDocumentOwner = async (req, res) => {
  const { documentId } = req.params;

  try {
    const result = await documentService.getDocumentOwner(documentId);
    res.json(result);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
};

const createDocument = async (req, res) => {
  const { workspaceId } = req.params;
  const { title } = req.body;
  const userId = req.user.id;

  try {
    const document = await documentService.createDocument({
      workspaceId,
      title,
      userId,
    });
    res.status(201).json(document);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to create document" });
  }
};

const deleteDocument = async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;

  try {
    await documentService.deleteDocument({ documentId, userId });
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to delete document" });
  }
};

const saveDocument = async (req, res) => {
  const { documentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const document = await documentService.saveDocument({
      documentId,
      content,
      userId,
    });
    res.json({ message: "Document saved successfully", document });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to save document" });
  }
};

const saveDocumentToDashboard = async (req, res) => {
  const { documentId } = req.params;
  const { workspaceId } = req.body;
  const userId = req.user.id;

  try {
    const document = await documentService.saveDocumentToDashboard({
      documentId,
      workspaceId,
      userId,
    });
    res
      .status(201)
      .json({ message: "Document saved to your dashboard!", document });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Failed to save document to dashboard" });
  }
};

module.exports = {
  getDocumentOwner,
  createDocument,
  deleteDocument,
  saveDocument,
  saveDocumentToDashboard,
};
