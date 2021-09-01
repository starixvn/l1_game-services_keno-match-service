import { Core } from "sc-game-base";

export class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async buildPayload(realPlayer) {
        const basePayload = await super.buildPayload(realPlayer);

        if (this.gameData.remainingTime > this.definition.durations.finishFirstHalf) {
            return basePayload;
        }

        const { firstHalfResult, liveOdds } = this.gameData;
        return { ...basePayload, firstHalfResult, liveOdds };
    }
}
