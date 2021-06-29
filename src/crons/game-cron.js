import { Core } from "sc-game-base";

export class GameCron extends Core.Crons.BaseGameCron {
    async start() {
        const lastRound = await this.roundsRepository
            .findOne({}, "id", { sort: { id: -1 } })
            .lean()
            .exec();

        const job = new cron.CronJob(
            "* * * * * *",
            () => this.proceed().catch(this.logService.logError),
            () => {
                this.logService.logError(
                    `${this.definition.name} unexpectedly stopped at round #${this.gameData.roundId} because some other tasks halt it.`
                );
                job.start();
            }
        );

        if (lastRound) {
            if (lastRound.fullTime && lastRound.fullTime.result) {
                this.gameData.roundId = lastRound.id + 1;
            } else {
                this.gameData.remainingTime = this.definition.durations.finishHalfTime;
            }
        } else {
            this.gameData.roundId = await this.getLastArchiveRound();
        }

        job.start();
    }

    async proceed() {
        await super.proceed();

        if (this.gameData.remainingTime === this.definition.durations.finishHalfTime) {
            await this.settleGameRoundConsumer.handleFinishHalfTime();
        }
    }

    resetForNewRound() {
        this.gameData.halfTimeResult = {};
    }
}
