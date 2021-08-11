import mongoose from "mongoose";

const schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },
    time: { type: Date },
    odds: { type: Object },

    preHTBlue: { type: Number, default: 0 },
    preHTRed: { type: Number, default: 0 },
    preHTOver: { type: Number, default: 0 },
    preHTUnder: { type: Number, default: 0 },
    preHTOdd: { type: Number, default: 0 },
    preHTEven: { type: Number, default: 0 },
    preFTBlue: { type: Number, default: 0 },
    preFTRed: { type: Number, default: 0 },
    preFTOver: { type: Number, default: 0 },
    preFTUnder: { type: Number, default: 0 },
    preFTOdd: { type: Number, default: 0 },
    preFTEven: { type: Number, default: 0 },
    liveFTBlue: { type: Number, default: 0 },
    liveFTRed: { type: Number, default: 0 },
    liveFTOver: { type: Number, default: 0 },
    liveFTUnder: { type: Number, default: 0 },
    liveFTOdd: { type: Number, default: 0 },
    liveFTEven: { type: Number, default: 0 },

    thanhtoan: { type: Boolean, default: false },
    betwin: { type: Number, default: 0 },
    refund: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    memberId: { type: Number },
    siteId: { type: String },
    freeBet: { type: Boolean, default: false }
});

export default (modelName) => {
    return mongoose.model(modelName, schema);
};
