import { Core } from "sc-game-base";

export class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async buildPayload(realPlayer) {
        const basePayload = await super.buildPayload(realPlayer);

        const { currentMD5 } = this.gameData;

        if (this.gameData.remainingTime <= this.definition.durations.finishFirstHalf) {
            return {
                ...basePayload,
                liveOdds: this.gameData.liveOdds,
                firstHalfResult: this.gameData.firstHalfResult,
                md5: currentMD5,
            };
        }

        return {
            ...basePayload,
            md5: currentMD5,
        };
    }
}
