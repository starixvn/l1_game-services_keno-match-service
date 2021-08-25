import cron from "cron";
import mongoose from "mongoose";
import { Core } from "sc-game-base";

import { RoundResultConsumer } from "../consumers";
import { sumArrayNumber } from "../helpers/array-helper";

export class GameCron extends Core.Crons.BaseGameCron {
    /**
     * @param {Object} dependencies
     * @param {mongoose.Model} dependencies.globalConfigsRepository
     * @param {RoundResultConsumer} dependencies.roundResultConsumer
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
        roundResultConsumer,
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

        this.roundResultConsumer = roundResultConsumer;
    }

    async start() {
        const lastRound = await this.roundsRepository
            .findOne({}, "id firstHalf fullTime", { sort: { id: -1 } })
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
            if (lastRound.settled) {
                this.gameData.roundId = lastRound.id + 1;
            } else {
                if (lastRound.fullTime && lastRound.fullTime.result) {
                    this.gameData.remainingTime = 0;
                } else {
                    this.gameData.remainingTime = this.definition.durations.firstHalfPlacingBets;
                    const firstHalfResult = lastRound.firstHalf.result;
                    this.gameData.firstHalfResult = {
                        ...firstHalfResult,
                        totalBlue: sumArrayNumber(firstHalfResult.blue),
                        totalRed: sumArrayNumber(firstHalfResult.red),
                    };
                }

                await this.checkGameStatus();
            }
        } else {
            this.gameData.roundId = await this.getLastArchiveRound();
        }

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
            await this.roundResultConsumer.generateFirstHalfResult();
        }

        if (!this.gameData.disabled && this.gameData.remainingTime === this.definition.durations.finishFirstHalf) {
            await this.roundResultConsumer.handleFinishFistHalf();
        }

        if (this.gameData.remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;
            await this.settleGameRoundConsumer.settleRound();
        } else if (this.gameData.remainingTime < durations.firstHalfPlacingBets) {
            this.runningRoundInfoPublisher.publish();
        }
    }

    isStartingTime(remainingTime, durations) {
        return remainingTime === durations.firstHalfPlacingBets;
    }

    resetForNewRound() {
        super.resetForNewRound();
        this.gameData.liveOdds = {};
        this.gameData.firstHalfResult = {};
    }
}
