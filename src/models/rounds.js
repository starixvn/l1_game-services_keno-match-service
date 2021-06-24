import mongoose from "mongoose";

const settlementResultSchema = new mongoose.Schema(
    {
        home: { type: Boolean, default: false },
        away: { type: Boolean, default: false },
        over: { type: Boolean, default: false },
        under: { type: Boolean, default: false },
        odd: { type: Boolean, default: false },
        even: { type: Boolean, default: false },
    },
    { _id: false }
);

const resultSchema = new mongoose.Schema(
    {
        home: { type: [Number], required: true },
        away: { type: [Number], required: true },
    },
    { _id: false }
);

const halfSchema = new mongoose.Schema(
    {
        result: resultSchema,
        sum: { type: Number },
        settlementResult: settlementResultSchema,
        time: { type: Date, default: new Date() },
    },
    { _id: false }
);

const schema = new mongoose.Schema({
    id: { type: Number, require: true },
    halfTime: halfSchema,
    fullTime: halfSchema,
    odds: { type: Object },
});

export default (modelName) => {
    return mongoose.model(modelName, schema);
};
