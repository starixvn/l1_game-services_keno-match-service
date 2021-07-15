import { Core } from "sc-game-base";
import { Socket } from "socket.io";

export class AdminMonitorConsumer extends Core.BaseEventConsumers.AdminMonitorConsumer {
    constructor(definition, gameData, adminPublisher, roundsRepository) {
        super(definition, gameData, adminPublisher, roundsRepository);
    }

    /**
     * @param {Socket} socketClient
     */
    async consume(socketClient) {
        const lastRound = await this.roundsRepository
            .findOne({}, { id: true, halfTime: true, fullTime: true }, { sort: { id: -1 } })
            .lean()
            .exec();

        if (lastRound) {
            const payload = {
                roundId: lastRound.id + 1,
                halfTime: lastRound.halfTime,
                fullTime: lastRound.fullTime,
                remainingTime: this.gameData.remainingTime,
            };

            this.adminPublisher.publishToAdmin(socketClient, payload);
        }
    }
}
