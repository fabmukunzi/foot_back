// Routes for team_match_stats
const express = require("express");
const router = express.Router();
const controller = require("../controllers/team_match_stats.controller");

// Basic REST
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;