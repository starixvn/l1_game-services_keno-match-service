import { Core } from "sc-game-base";
import { decrypt } from "../helpers/crypto-helper";

export class RoundQuery extends Core.QueryApis.RoundQuery {
    async getList(limit, projections = { _id: false, id: true, firstHalf: true, fullTime: true, odds: true }) {
        const rounds = await this.roundsRepository
            .find({ settled: true }, projections, { sort: { _id: -1 }, limit: limit })
            .lean()
            .exec();
        return rounds.map((round) => {
            if (typeof round.firstHalf.resultKey === "string") {
                return {
                    roundId: round.id,
                    firstHalf: round.firstHalf,
                    fullTime: round.fullTime,
                    odds: round.odds,
                };
            } else {
                return {
                    roundId: round.id,
                    firstHalf: { ...round.firstHalf, resultKey: decrypt(round.firstHalf.resultKey) },
                    fullTime: { ...round.fullTime, resultKey: decrypt(round.fullTime.resultKey) },
                    odds: round.odds,
                };
            }
        });
    }

    async getOne(id, projections = { _id: false }) {
        return this.roundsRepository.findOne({ id }, projections).lean().exec();
    }
}
