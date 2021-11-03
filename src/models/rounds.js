import mongoose from "mongoose";

const settlementResultSchema = new mongoose.Schema(
    {
        blue: { type: Boolean, default: false },
        red: { type: Boolean, default: false },
        tie: { type: Boolean, default: false },
        over: { type: Boolean, default: false },
        under: { type: Boolean, default: false },
        odd: { type: Boolean, default: false },
        even: { type: Boolean, default: false },
    },
    { _id: false }
);

const resultSchema = new mongoose.Schema(
    {
        blue: { type: [Number], required: true },
        red: { type: [Number], required: true },
    },
    { _id: false }
);

const halfSchema = new mongoose.Schema(
    {
        result: resultSchema,
        sum: { type: Number },
        settlementResult: settlementResultSchema,
        md5: { type: String, require: true },
        resultKey: { type: String, require: true },
        time: { type: Date, default: new Date() },
    },
    { _id: false }
);

const schema = new mongoose.Schema({
    id: { type: Number, require: true },
    firstHalf: halfSchema,
    fullTime: halfSchema,
    odds: { type: Object },
    time: { type: Date, default: new Date() },
    settled: { type: Boolean, default: false },
});

export default (modelName) => {
    return mongoose.model(modelName, schema);
};
