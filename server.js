// server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { Pool } = require("pg");

// =======================
// DATABASE CONNECTION
// =======================
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch(err => console.error("❌ Database connection error:", err));


// =======================
// EXPRESS APP SETUP
// =======================
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =======================
// DYNAMIC ROUTE LOADING
// =======================
const routesDir = path.join(__dirname, "src", "routes");

if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir).forEach(file => {
    if (file.endsWith(".routes.js")) {
      const routePath = path.join(routesDir, file);
      const route = require(routePath);
      const base = "/api/" + file.replace(".routes.js", "");
      app.use(base, route);
      console.log("Mounted route:", base);
    }
  });
} else {
  console.warn("⚠️ Routes directory not found:", routesDir);
}

// =======================
// ROOT ROUTES
// =======================
app.get("/", (req, res) => {
  res.send("⚽ Football Stats API (MVC) — routes mounted. Check /api");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// =======================
// ERROR HANDLING
// =======================

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});

// =======================
// HANDLE UNHANDLED PROMISES & EXCEPTIONS
// =======================
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

module.exports = { app, pool };
