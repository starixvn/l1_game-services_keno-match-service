import { Core } from "sc-game-base";

export class HistoryQuery extends Core.QueryApis.HistoryQuery {
    async queryHistory(player, page, pageSize) {
        if (page < 1 || !player) {
            return {};
        }

        const filter = { uid: player.UID, thanhtoan: true };
        const numberOfSkippedBets = (page - 1) * pageSize;
        const total = await this.betsRepository.countDocuments(filter).exec();
        const betProjection = {
            _id: false,
            uid: false,
            thanhtoan: false,
            siteId: false,
            memberId: false,
            __v: false,
            __archive: false,
        };
        const bets = await this.betsRepository
            .find(filter, betProjection, { sort: { _id: -1 }, skip: numberOfSkippedBets, limit: pageSize })
            .lean()
            .exec();
        let betLogs = [];

        if (bets && bets.length > 0) {
            betLogs = await Promise.all(
                bets.map(async (bet) => {
                    const round = await this.roundQuery.getOne(bet.phien, { _id: false });
                    const betLogDetails = this.betLogsRepository ? await this.getBetLogDetails(player, bet.phien) : [];

                    return {
                        ...this.convertBet(bet),
                        firstHalf: round.firstHalf,
                        fullTime: round.fullTime,
                        odds: round.odds,
                        betLogDetails: this.convertBetLogs(betLogDetails),
                    };
                })
            );
        }

        return { history: { betLogs, page, pageSize, total } };
    }
}
