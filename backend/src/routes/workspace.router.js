const express = require("express");
const { authenticationToken } = require("../middlewares/auth.middleware");
const {
  createWorkspace,
  getUserWorkspace,
  deleteWorkspace,
} = require("../controllers/workspace.controller");
const { createDocument } = require("../controllers/document.controller");

const router = express.Router();

router.post("/", authenticationToken, createWorkspace);
router.get("/", authenticationToken, getUserWorkspace);
router.delete("/:workspaceId", authenticationToken, deleteWorkspace);

router.post("/:workspaceId/documents", authenticationToken, createDocument);

module.exports = router;
