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
app.get("/", (req, res) => res.render("home"));

// Games list
app.get("/games", async (req, res) => {
  try {
    const partidos = await Game.find({});
    res.render("indexgames", { games: partidos });
  } catch (error) {
    console.error("Error fetching games:", error);
  }
});

// Match entry form
app.get("/matchentry", async (req, res) => {
  try {
    const jugadores = await Player.find({});
    res.render("game", { players: jugadores });
  } catch (error) {
    console.error(error);
  }
});

// Maintenance
app.get("/maintenance", async (req, res) => {
  try {
    const jugadores = await Player.find({});
    res.render("index", { players: jugadores });
  } catch (error) {
    console.error(error);
  }
});

// Create player form
app.get("/new", (req, res) => {
  res.render("new");
});

// Test view
app.get("/test", (req, res) => {
  res.render("test");
});

// Player profile
app.get("/profile/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    res.render("player", { player });
  } catch (error) {
    console.error(error);
  }
});

// Game detail view
app.get("/game/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    const ea = await Promise.all(game.ateam.map(id => Player.findById(id)));
    const eb = await Promise.all(game.bteam.map(id => Player.findById(id)));

    const resultado = game.ascore === game.bscore
      ? "Empate"
      : game.ascore > game.bscore
        ? "Equipo A"
        : "Equipo B";

    res.render("partido", {
      game,
      ea: ea.map(j => j.name),
      eb: eb.map(j => j.name),
      resultado
    });
  } catch (error) {
    console.error("Error loading game:", error);
  }
});

// Create new player
app.post("/", async (req, res) => {
  try {
    const defaultDate = new Date("2023-12-31");
    const newPlayer = {
      name: req.body.name,
      games: 0,
      wins: 0,
      loses: 0,
      draws: 0,
      last_win: defaultDate
    };
    await Player.create(newPlayer);
    res.redirect("/maintenance");
  } catch (error) {
    console.error("Error creating player:", error);
    res.redirect("/");
  }
});

// Delete player
app.delete("/:id", async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    res.redirect("/maintenance");
  } catch (error) {
    console.error("Error deleting player:", error);
  }
});

// Edit player form
app.get("/:id/edit", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    res.render("edit", { player });
  } catch (error) {
    console.error(error);
  }
});

// Update player
app.put("/:id/edit", async (req, res) => {
  try {
    await Player.findByIdAndUpdate(req.params.id, req.body.player);
    const updatedPlayer = await Player.findById(req.params.id);
    res.render("edit", { player: updatedPlayer });
  } catch (error) {
    console.error(error);
  }
});

// Submit match result
app.post("/submitx", async (req, res) => {
  
  const Ateam = req.body.Ateam;
  const Bteam = req.body.Bteam;
  const Ascore = Number(req.body.Ascore);
  const Bscore = Number(req.body.Bscore);

  const result = Ascore === Bscore ? "tied" : Ascore > Bscore ? "A" : "B";

  const updatePlayers = async (team, win = 0, lose = 0, draw = 0) => {
    await Promise.all(team.map(id =>
      Player.findByIdAndUpdate(id, {
        $inc: { games: 1, wins: win, loses: lose, draws: draw },
        ...(win ? { last_win: new Date() } : {})
      })
    ));
  };

  try {
    if (result === "tied") {
      await updatePlayers(Ateam, 0, 0, 1);
      await updatePlayers(Bteam, 0, 0, 1);
    } else if (result === "A") {
      await updatePlayers(Ateam, 1, 0, 0);
      await updatePlayers(Bteam, 0, 1, 0);
    } else {
      await updatePlayers(Bteam, 1, 0, 0);
      await updatePlayers(Ateam, 0, 1, 0);
    }

    await Game.create({
      date: new Date(),
      ateam: Ateam,
      bteam: Bteam,
      ascore: Ascore,
      bscore: Bscore
    });

    res.redirect("/matchentry");
  } catch (error) {
    console.error("Error processing match:", error);
  }
});

app.post("/games/deleteAll", async (req, res) => {
  try {
    await Game.deleteMany({});
    res.redirect("/rosafut");
  } catch (error) {
    console.error("Failed to delete games:", error);
    res.status(500).send("Error deleting games");
  }
});

//new post match
app.post("/submit", async (req, res) => {
  const Ateam = req.body.Ateam;
  const Bteam = req.body.Bteam;
  const Ascore = Number(req.body.Ascore);
  const Bscore = Number(req.body.Bscore);

  // Get date from form (user input)
 let matchDate;
if (req.body.date) {
  const [year, month, day] = req.body.date.split("-").map(Number);
  matchDate = new Date(year, month - 1, day); // Local date at midnight
} else {
  matchDate = new Date();
}


  const result = Ascore === Bscore ? "tied" : Ascore > Bscore ? "A" : "B";

  const updatePlayers = async (team, win = 0, lose = 0, draw = 0) => {
    await Promise.all(
      (Array.isArray(team) ? team : [team]).map(id =>
        Player.findByIdAndUpdate(id, {
          $inc: { games: 1, wins: win, loses: lose, draws: draw },
          ...(win ? { last_win: matchDate } : {})
        })
      )
    );
  };

  try {
    if (result === "tied") {
      await updatePlayers(Ateam, 0, 0, 1);
      await updatePlayers(Bteam, 0, 0, 1);
    } else if (result === "A") {
      await updatePlayers(Ateam, 1, 0, 0);
      await updatePlayers(Bteam, 0, 1, 0);
    } else {
      await updatePlayers(Bteam, 1, 0, 0);
      await updatePlayers(Ateam, 0, 1, 0);
    }

    await Game.create({
      date: matchDate,  // <-- now using the form value
      ateam: Ateam,
      bteam: Bteam,
      ascore: Ascore,
      bscore: Bscore
    });

    res.redirect("/matchentry");
  } catch (error) {
    console.error("Error processing match:", error);
    res.status(500).send("Error processing match");
  }
});



app.post("/players/resetAll", async (req, res) => {
  try {
    const defaultDate = new Date("December 31, 2023 00:00:00");
    await Player.updateMany({}, {
      $set: {
        games: 0,
        wins: 0,
        loses: 0,
        draws: 0,
        last_win: defaultDate
      }
    });
    res.redirect("/rosafut");
  } catch (error) {
    console.error("Failed to reset player stats:", error);
    res.status(500).send("Error resetting player stats");
  }
});


app.get("/leaderboardX", async (req, res) => {
  try {
    const topPlayers = await Player.find()
      .sort({ wins: -1, draws: -1, games: 1 }) // best players first
      .limit(10);

    res.render("leaderboard", { topPlayers });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).send("Error loading leaderboard");
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    let topPlayers = await Player.find().lean();

    // Sort players by: more games → fewer losses → more draws
    topPlayers.sort((a, b) => {
      if (b.games !== a.games) return b.games - a.games;  // More games first
      if (b.wins !== a.wins) return b.wins - a.wins;      // More wins next
      return b.draws - a.draws;                           // More draws last
    });

    res.render("leaderboard", { topPlayers });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ Instead of app.listen(), just export app for Vercel
export default app;
