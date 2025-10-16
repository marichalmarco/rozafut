import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: String,
  games: Number,
  wins: Number,
  loses: Number,
  draws: Number,
  last_win: Date
});

const Player = mongoose.model("Player", playerSchema);
export default Player;
