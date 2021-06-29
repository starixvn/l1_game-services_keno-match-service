import mongoose from "mongoose";

const schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true },
    time: { type: Date },
    odds: { type: Object },

    preHTHome: { type: Number, default: 0 },
    preHTAway: { type: Number, default: 0 },
    preHTOver: { type: Number, default: 0 },
    preHTUnder: { type: Number, default: 0 },
    preHTOdd: { type: Number, default: 0 },
    preHTEven: { type: Number, default: 0 },
    preFTHome: { type: Number, default: 0 },
    preFTAway: { type: Number, default: 0 },
    preFTOver: { type: Number, default: 0 },
    preFTUnder: { type: Number, default: 0 },
    preFTOdd: { type: Number, default: 0 },
    preFTEven: { type: Number, default: 0 },
    inRunFTHome: { type: Number, default: 0 },
    inRunFTAway: { type: Number, default: 0 },
    inRunFTOver: { type: Number, default: 0 },
    inRunFTUnder: { type: Number, default: 0 },
    inRunFTOdd: { type: Number, default: 0 },
    inRunFTEven: { type: Number, default: 0 },

    thanhtoan: { type: Boolean, default: false },
    betwin: { type: Number, default: 0 },
    refund: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    memberId: { type: Number },
    siteId: { type: String },
});

export default (modelName) => {
    return mongoose.model(modelName, schema);
};
