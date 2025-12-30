// scripts/generate-mvc.js
const fs = require("fs");
const path = require("path");

const tables = [
  "users","user_preferences","activity_logs",
  "organizations","leagues","seasons",
  "stadiums","teams","team_formations",
  "players","player_contracts","transfers",
  "injuries","fitness_records","medical_records",
  "matches","match_events","match_lineups",
  "match_stats","team_match_stats","standings",
  "training_sessions","training_attendance","training_drills",
  "scouting_reports","transactions","sponsorships",
  "media_gallery","news_articles","notifications",
  "messages","awards","milestones","saved_reports"
];

// helper to camel-case for filenames if needed
function toPascal(s){
  return s.split("_").map(p => p[0].toUpperCase()+p.slice(1)).join("");
}

const baseDir = path.join(process.cwd(), "src");
const modelsDir = path.join(baseDir, "models");
const controllersDir = path.join(baseDir, "controllers");
const routesDir = path.join(baseDir, "routes");

[modelsDir, controllersDir, routesDir].forEach(d => { if(!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const modelTemplate = (tableName) => `
// Auto-generated model for ${tableName}
const pool = require("../../config/db");

function buildInsertQuery(table, data){
  const keys = Object.keys(data);
  const cols = keys.join(", ");
  const placeholders = keys.map((_, i) => "$" + (i+1)).join(", ");
  const values = keys.map(k => data[k]);
  return { text: \`INSERT INTO \${table} (\${cols}) VALUES (\${placeholders}) RETURNING *\`, values };
}

function buildUpdateQuery(table, id, data){
  const keys = Object.keys(data);
  const set = keys.map((k,i)=> \`\${k} = $\${i+1}\`).join(", ");
  const values = keys.map(k=> data[k]);
  values.push(id);
  return { text: \`UPDATE \${table} SET \${set}, updated_at = CURRENT_TIMESTAMP WHERE id = $\${keys.length+1} RETURNING *\`, values };
}

const ${toPascal(tableName)}Model = {
  async findAll(){
    const res = await pool.query(\`SELECT * FROM ${tableName} ORDER BY id DESC\`);
    return res.rows;
  },

  async findById(id){
    const res = await pool.query(\`SELECT * FROM ${tableName} WHERE id = $1\`, [id]);
    return res.rows[0];
  },

  async create(data){
    const q = buildInsertQuery("${tableName}", data);
    const res = await pool.query(q.text, q.values);
    return res.rows[0];
  },

  async update(id, data){
    const q = buildUpdateQuery("${tableName}", id, data);
    const res = await pool.query(q.text, q.values);
    return res.rows[0];
  },

  async remove(id){
    const res = await pool.query(\`DELETE FROM ${tableName} WHERE id = $1 RETURNING *\`, [id]);
    return res.rows[0];
  }
};

module.exports = ${toPascal(tableName)}Model;
`.trim();

const controllerTemplate = (tableName) => `
// Controller for ${tableName}
const Model = require("../models/${tableName}.model");

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
    if(!row) return res.status(404).json({ message: "${tableName} not found" });
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
    if(!updated) return res.status(404).json({ message: "${tableName} not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const removed = await Model.remove(req.params.id);
    if(!removed) return res.status(404).json({ message: "${tableName} not found" });
    res.json({ message: "Deleted", item: removed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
`.trim();

const routesTemplate = (tableName) => `
// Routes for ${tableName}
const express = require("express");
const router = express.Router();
const controller = require("../controllers/${tableName}.controller");

// Basic REST
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
`.trim();

for(const t of tables){
  const modelPath = path.join(modelsDir, `${t}.model.js`);
  const controllerPath = path.join(controllersDir, `${t}.controller.js`);
  const routePath = path.join(routesDir, `${t}.routes.js`);

  if(!fs.existsSync(modelPath)) fs.writeFileSync(modelPath, modelTemplate(t));
  if(!fs.existsSync(controllerPath)) fs.writeFileSync(controllerPath, controllerTemplate(t));
  if(!fs.existsSync(routePath)) fs.writeFileSync(routePath, routesTemplate(t));
  console.log("Created:", t);
}

console.log("\\nAll files created under src/models, src/controllers, src/routes");
console.log("Next: add routes to server.js (see README).");
