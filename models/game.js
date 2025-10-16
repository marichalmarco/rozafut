import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  date: Date,
  ateam: [String], // Player IDs
  bteam: [String],
  ascore: Number,
  bscore: Number
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
