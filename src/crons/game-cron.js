import cron from "cron";
import mongoose from "mongoose";
import { Core } from "sc-game-base";

export class GameCron extends Core.Crons.BaseGameCron {
    /**
     * @param {Object} dependencies
     * @param {mongoose.Model} dependencies.globalConfigsRepository
     */
    constructor({
        definition,
        gameData,
        bot,
        settleGameRoundConsumer,
        gameStatusPublisher,
        runningRoundInfoPublisher,
        logService,
        gameConfigsRepository,
        roundsRepository,
        archiveStatusesRepository,
        notificationRepository,
        globalConfigsRepository,
    }) {
        super({
            definition,
            gameData,
            bot,
            settleGameRoundConsumer,
            gameStatusPublisher,
            runningRoundInfoPublisher,
            logService,
            gameConfigsRepository,
            roundsRepository,
            archiveStatusesRepository,
            notificationRepository,
        });

        this.globalConfigsRepository = globalConfigsRepository;
    }

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

        await this.updateLiveOdds();

        job.start();
    }

    async proceed() {
        await super.proceed();

        if (!this.gameData.disabled && this.gameData.remainingTime === this.definition.durations.finishHalfTime) {
            await this.settleGameRoundConsumer.handleFinishHalfTime();
        }
    }

    resetForNewRound() {
        this.gameData.halfTimeResult = {};
    }

    async checkGameStatus() {
        await super.checkGameStatus();
        await this.updateLiveOdds();
    }

    async updateLiveOdds() {
        this.gameData.liveOdds = await this.globalConfigsRepository.findOne({ type: "kenosoccer_liveodds" }, "homeAway overUnder").lean();
    }
}
