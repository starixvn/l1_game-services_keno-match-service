import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    type: { type: String, required: true },
    adjRate: { type: Object },
    blueRed: { type: Object },
    overUnder: { type: Object },
});

export default mongoose.model("global_config", Schema);
