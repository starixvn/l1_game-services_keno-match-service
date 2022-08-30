import mongoose from "mongoose";

const schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },
    time: { type: Date },

    choice: { type: String, required: true },
    amount: { type: Number, required: true },

    siteId: { type: String },

    currency: { type: String, require: true },
    rate: { type: Number, require: true },

    playerId: { type: Number },
    operatorId: { type: String, require: true },
    roundId: { type: Number, required: true },
});

export default (modelName) => {
    return mongoose.model(modelName, schema);
};
