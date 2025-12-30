// Controller for team_match_stats
const Model = require("../models/team_match_stats.model");

exports.getAll = async (req, res) => {
  try {
    const data = await Model.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const row = await Model.findById(req.params.id);
    if(!row) return res.status(404).json({ message: "team_match_stats not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const newRow = await Model.create(req.body);
    res.status(201).json(newRow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Model.update(req.params.id, req.body);
    if(!updated) return res.status(404).json({ message: "team_match_stats not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const removed = await Model.remove(req.params.id);
    if(!removed) return res.status(404).json({ message: "team_match_stats not found" });
    res.json({ message: "Deleted", item: removed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};