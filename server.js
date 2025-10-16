import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";

import Player from "./models/player.js";
import Game from "./models/game.js";

const app = express();

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://mmarichal:tufsaro2025@clusterdev.ynvq74n.mongodb.net/rosafut?retryWrites=true&w=majority&appName=Clusterdev", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set('views', path.join(__dirname, 'views'));
// app.use("/public", express.static(path.join(__dirname, 'public')));

// ROUTES
app.get("/rosafut", (req, res) => res.render("rosafut"));
app.get("/", (req, res) => res.send("home"));

// ... all your other routes remain exactly the same ...

// ✅ Instead of app.listen(), just export app for Vercel
export default app;
