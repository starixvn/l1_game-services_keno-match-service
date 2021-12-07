import mongoose from "mongoose";

const schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },
    time: { type: Date },
    odds: { type: Object },

    fhBlue: { type: Number, default: 0 },
    fhRed: { type: Number, default: 0 },
    fhOver: { type: Number, default: 0 },
    fhUnder: { type: Number, default: 0 },
    fhEven: { type: Number, default: 0 },
    fhOdd: { type: Number, default: 0 },
    ftBlue: { type: Number, default: 0 },
    ftRed: { type: Number, default: 0 },
    ftOver: { type: Number, default: 0 },
    ftUnder: { type: Number, default: 0 },
    ftEven: { type: Number, default: 0 },
    ftOdd: { type: Number, default: 0 },
    liveFTBlue: { type: Number, default: 0 },
    liveFTRed: { type: Number, default: 0 },
    liveFTOver: { type: Number, default: 0 },
    liveFTUnder: { type: Number, default: 0 },
    liveFTEven: { type: Number, default: 0 },
    liveFTOdd: { type: Number, default: 0 },

    thanhtoan: { type: Boolean, default: false },
    betwin: { type: Number, default: 0 },
    refund: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    memberId: { type: Number },
    siteId: { type: String },
    freeBet: { type: Boolean, default: false },

    currency: { type: String, require: true },
    rate: { type: Number, require: true },
    partnerId: { type: String, require: true },
});

export default (modelName) => {
    return mongoose.model(modelName, schema);
};
