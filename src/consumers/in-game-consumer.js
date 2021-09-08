import { Core } from "sc-game-base";

export class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async buildPayload(realPlayer) {
        const basePayload = await super.buildPayload(realPlayer);

        const { liveOdds, currentMD5 } = this.gameData;
        const firstHalfResult = {
            result: this.gameData.firstHalfResult?.result,
            settlementResult: this.gameData.firstHalfResult?.settlementResult,
        };

        if (this.gameData.remainingTime <= this.definition.durations.finishFirstHalf) {
            firstHalfResult["resultKey"] = this.gameData.firstHalfResult?.resultKey;
        }

        return {
            ...basePayload,
            liveOdds,
            firstHalfResult,
            md5: currentMD5,
        };
    }
}
