import mongoose from "mongoose";

const schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },
    time: { type: Date },

    choice: { type: Number, required: true },
    amount: { type: Number, required: true },

    memberId: { type: Number },
    siteId: { type: String },
});

export default (modelName) => {
    return mongoose.model(modelName, schema);
};
