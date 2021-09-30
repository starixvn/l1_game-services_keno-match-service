import { Core } from "sc-game-base";

export class AdminMonitorConsumer extends Core.BaseEventConsumers.AdminMonitorConsumer {
    /**
     * @param {Socket} socketClient
     */
    async consume(socketClient) {
        const lastRound = await this.roundsRepository
            .findOne({ settled: true }, { id: true, firstHalf: true, fullTime: true }, { sort: { id: -1 } })
            .lean()
            .exec();

        if (lastRound) {
            const payload = {
                roundId: lastRound.id + 1,
                firstHalf: lastRound.firstHalf,
                fullTime: lastRound.fullTime,
                remainingTime: this.gameData.remainingTime,
            };

            this.adminPublisher.publishToAdmin(socketClient, payload);
        }
    }
}
