const express = require("express");
const { authenticationToken } = require("../middlewares/auth.middleware");
const authRoutes = require("../routes/auth.routes");
const workspaceRoutes = require("../routes/workspace.router");
const documentRoutes = require("../routes/document.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/documents", documentRoutes);

router.get("/protected", authenticationToken, (req, res) => {
  res.json({ message: `Access Granted For ID : ${req.user.id}` });
});

module.exports = router;
