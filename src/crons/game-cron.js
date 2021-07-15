import cron from "cron";
import mongoose from "mongoose";
import { Core } from "sc-game-base";

import { sumArrayNumber } from "../helpers/array-helper";

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
            .findOne({}, "id halfTime fullTime", { sort: { id: -1 } })
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
                const halfTimeResult = lastRound.halfTime.result;

                this.gameData.halfTimeResult = {
                    ...halfTimeResult,
                    totalHome: sumArrayNumber(halfTimeResult.home),
                    totalAway: sumArrayNumber(halfTimeResult.away),
                };

                this.checkGameStatus();
            }
        } else {
            this.gameData.roundId = await this.getLastArchiveRound();
        }

        await this.updateLiveOdds();

        job.start();
    }

    async proceed() {
        const { durations } = this.definition;

        if (this.gameData.remainingTime === durations.wholeRound) {
            await this.checkGameStatus();
        }

        if (!this.gameData.disabled) {
            this.gameData.remainingTime--;
        }

        if (this.isStartingTime(this.gameData.remainingTime, durations)) {
            this.resetForNewRound();
            this.bot && (await this.bot.reset());
        }

        if (!this.gameData.disabled && this.gameData.remainingTime === this.definition.durations.finishHalfTime) {
            await this.settleGameRoundConsumer.handleFinishHalfTime();
        }

        if (this.gameData.remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;
            await this.settleGameRoundConsumer.settleRound(this.gameData);
        } else if (this.gameData.remainingTime < durations.halfTimePlacingBets) {
            this.bot && (await this.bot.run());
            this.runningRoundInfoPublisher.publish();
        }
    }

    isStartingTime(remainingTime, durations) {
        return remainingTime === durations.halfTimePlacingBets;
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
