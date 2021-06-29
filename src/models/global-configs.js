import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    type: { type: String, required: true },
    configs: { type: Object },
});

export default mongoose.model("global_config", Schema);
