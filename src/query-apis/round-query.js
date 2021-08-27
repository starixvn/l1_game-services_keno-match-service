import { Core } from "sc-game-base";

export class RoundQuery extends Core.QueryApis.RoundQuery {
    async getList(limit, projections = { id: true, firstHalf: true, fullTime: true, odds: true }) {
        return this.roundsRepository
            .find({ settled: true }, projections, { sort: { _id: -1 }, limit: limit })
            .lean()
            .exec();
    }

    async getOne(id, projections = { _id: false }) {
        return this.roundsRepository.findOne({ id }, projections).lean().exec();
    }
}
