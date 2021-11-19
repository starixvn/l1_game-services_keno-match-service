import cron from "cron";
import { Core } from "sc-game-base";

import { RoundResultConsumer } from "../consumers";
import { sumArrayNumber } from "../helpers/array-helper";

export class GameCron extends Core.Crons.BaseGameCron {
    /**
     * @param {Object} dependencies
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
        exchangeRatesRepository,
        currencyGroupGamesRepository,
        partnerConfigRepository,
        roundResultConsumer,
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
            exchangeRatesRepository,
            currencyGroupGamesRepository,
            partnerConfigRepository,
        });

        this.roundResultConsumer = roundResultConsumer;
        this.globalConfigsRepository = globalConfigsRepository;
    }

    async start() {
        const lastRound = await this.roundsRepository
            .findOne({}, "id settled", { sort: { id: -1 } })
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
                this.gameData.roundId = lastRound.id;
            }
        } else {
            this.gameData.roundId = await this.getLastArchiveRound();
        }

        await this.updateCurrencyGroupGames();
        await this.updateExchangeRates();
        await this.updatePartnerGameSiteExclusions();

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
            this.roundResultConsumer.handleFinishFistHalf();
        }

        if (!this.gameData.disabled && this.gameData.remainingTime === this.definition.durations.placingBets) {
            await this.roundResultConsumer.generateFullTimeResult();
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
        this.gameData.ingame = {};
        this.gameData.totalBets = {};
        this.gameData.liveOdds = {};
        this.gameData.firstHalfResult = {};
    }

    async checkGameStatus() {
        const { configName, durations } = this.definition;
        const configs = await this.gameConfigsRepository.findOne({ name: configName }).lean().exec();
        const previouslyDisabled = this.gameData.disabled;
        const configuredlyDisabled = !configs || !configs.enabled;

        if (previouslyDisabled) {
            if (this.gameData.delayStartTime > 0) {
                this.gameData.delayStartTime--;
            } else if (!configuredlyDisabled) {
                this.gameData.delayStartTime = configs?.delayStartTime ?? 0;
            }
        }

        this.gameData.umMessages =
            (await this.notificationRepository.findOne({ gameName: configName, displayKind: 2 }, "messages").lean().exec())?.messages ?? {};

        this.gameData.gameConfigs = configs ?? {};
        this.gameData.disabled = configuredlyDisabled || this.gameData.delayStartTime > 0;
        await this.updateCurrencyGroupGames();
        await this.updatePartnerGameSiteExclusions();

        if (this.gameData.gameConfigs.exchangeReload) {
            await this.updateExchangeRates();
            await this.gameConfigsRepository.updateOne({ name: configName }, { exchangeReload: false });
            this.gameData.gameConfigs.exchangeReload = false;
        }

        if (this.gameData.disabled) {
            this.gameData.remainingTime = durations.wholeRound;
            this.gameStatusPublisher.publishDisableGameStatus();

            await this.gameConfigsRepository.updateOne({ name: configName }, { disabledround: this.gameData.roundId });
        } else if (previouslyDisabled) {
            await this.initGameData();
            this.gameStatusPublisher.publishEnablingGameStatus();
        } else {
            this.gameStatusPublisher.publishStartGame();
        }
    }

    async initGameData() {
        const { roundId } = this.gameData;
        const currentRound = await this.roundsRepository.findOne({ id: roundId }, "id firstHalf fullTime settled").lean().exec();
        if (currentRound) {
            const { result, settlementResult, resultKey, md5 } = currentRound.firstHalf;
            const totalBlue = sumArrayNumber(result.blue);
            const totalRed = sumArrayNumber(result.red);
            const sum = totalRed + totalBlue;
            this.gameData.firstHalfResult = {
                result,
                resultKey,
                settlementResult,
                totalBlue,
                totalRed,
                roundId,
            };
            this.gameData.currentMD5 = md5;
            const liveOdds = await this.globalConfigsRepository.findOne({ type: "kenomatch_liveodds" }, "blueRed overUnder").lean().exec();
            this.gameData.liveOdds = { ...liveOdds.blueRed[totalBlue - totalRed], ...liveOdds.overUnder[sum] };

            if (currentRound.fullTime && currentRound.fullTime.result) {
                this.gameData.remainingTime = 0;
            } else {
                this.gameData.remainingTime = this.definition.durations.finishFirstHalf;
            }

            this.roundResultConsumer.handleFinishFistHalf();
        }
    }
}
