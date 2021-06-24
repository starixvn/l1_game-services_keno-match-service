import { Core } from "sc-game-base";

export class GameCron extends Core.Crons.BaseGameCron {
    async proceed() {
        await super.proceed();

        if (this.gameData.remainingTime === this.definition.durations.finishHalfTime) {
            await this.settleGameRoundConsumer.handleFinishHalfTime();
        }
    }
}
