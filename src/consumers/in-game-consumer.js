import { Core } from "sc-game-base";

export class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async buildPayload(realPlayer) {
        const basePayload = await super.buildPayload(realPlayer);

        return { ...basePayload, firstHalfResult: this.gameData.firstHalfResult };
    }
}
